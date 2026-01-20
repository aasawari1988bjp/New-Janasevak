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
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

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

    const voterVerification = await verifyVoter(full_name, epic_number || voter_id);

    if (!voterVerification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: voterVerification.message || "Voter verification failed. Your name or EPIC number was not found in the Ward 26 voter list. Please ensure your details match your voter ID card.",
          voterVerification: {
            verified: false,
            confidence: voterVerification.confidence,
          },
        },
        { status: 403 }
      );
    }

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

    if (voterVerification.matchedVoter?.epic_number) {
      const { data: existingEpic } = await supabase
        .from("users")
        .select("id")
        .eq("epic_number", voterVerification.matchedVoter.epic_number)
        .single();

      if (existingEpic) {
        return NextResponse.json(
          { success: false, error: "This voter ID (EPIC) is already registered with another account." },
          { status: 400 }
        );
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
        epic_number: voterVerification.matchedVoter?.epic_number || epic_number || null,
        latitude,
        longitude,
        is_verified: true,
        voter_verified: true,
      })
      .select("id, email, full_name, phone, address, voter_id, epic_number, is_verified, voter_verified")
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
      message: "Registration successful! Your voter ID has been verified. Welcome to Ward 26 Citizen Connect.",
      user: newUser,
      voterVerification: {
        verified: true,
        matchType: voterVerification.matchType,
        confidence: voterVerification.confidence,
        matchedName: voterVerification.matchedVoter?.voter_name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
