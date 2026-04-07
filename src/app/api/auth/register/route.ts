import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { isInWard26 } from "@/lib/geofence";
import { verifyVoter } from "@/lib/voter-verification";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, address, voter_id, epic_number, latitude, longitude } =
      await request.json();

    if (!email || !password || !full_name || !phone || !address || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Geofencing check
    if (!isInWard26(latitude, longitude)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Registration denied. Your location is outside Ward 26 boundary. Only residents of Ward 26 (Ayare Road, Rajaji Path, Ram Nagar, Shiv Market, Savarkar Road) can register.",
        },
        { status: 403 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Optional EPIC verification (if provided during signup)
    let voterVerified = false;
    let matchedEpicNumber = null;
    
    if (epic_number) {
      // Check if EPIC already used
      const { data: existingEpic } = await supabase
        .from("users")
        .select("id")
        .eq("epic_number", epic_number)
        .single();

      if (existingEpic) {
        return NextResponse.json(
          { success: false, error: "This EPIC number is already registered with another account." },
          { status: 400 }
        );
      }

      // Verify against voter list
      const voterVerification = await verifyVoter(full_name, epic_number);
      if (voterVerification.verified) {
        voterVerified = true;
        matchedEpicNumber = voterVerification.matchedVoter?.epic_number || epic_number;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        phone,
        address,
        voter_id: voter_id || null,
        epic_number: matchedEpicNumber || epic_number || null,
        latitude,
        longitude,
        is_verified: true,
        voter_verified: voterVerified,
        complaint_count: 0, // Initialize complaint counter
      })
      .select("id, email, full_name, phone, address, epic_number, is_verified, voter_verified, complaint_count")
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { success: false, error: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: voterVerified 
        ? "Registration successful! Your EPIC number has been verified. Welcome to Ward 26 Citizen Connect."
        : "Registration successful! You can submit up to 5 complaints. EPIC verification required after 5 complaints.",
      user: newUser,
      needsEpicVerification: !voterVerified,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
