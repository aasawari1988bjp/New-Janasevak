import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isInWard26 } from "@/lib/geofence";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CORPORATOR_WHATSAPP = "919152233535";

const CATEGORY_LABELS: Record<string, string> = {
  roads: "Roads & Footpaths",
  water: "Water Supply",
  drainage: "Drainage & Sewage",
  garbage: "Garbage Collection",
  streetlights: "Street Lights",
  encroachment: "Encroachment",
  pollution: "Pollution",
  others: "Others",
};

async function sendWhatsAppNotification(complaintData: {
  residentName: string;
  phone: string;
  voterId: string | null;
  latitude: number;
  longitude: number;
  category: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string | null;
  complaintId: string;
}) {
  const googleMapsLink = `https://www.google.com/maps?q=${complaintData.latitude},${complaintData.longitude}`;
  const categoryLabel = CATEGORY_LABELS[complaintData.category] || complaintData.category;
  
  const message = `🚨 *NEW COMPLAINT - WARD 26*

*Complaint ID:* ${complaintData.complaintId.slice(0, 8).toUpperCase()}

👤 *RESIDENT DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${complaintData.residentName}
Phone: ${complaintData.phone}
${complaintData.voterId ? `Voter ID: ${complaintData.voterId}` : "Voter ID: Not Provided"}

📍 *LOCATION*
━━━━━━━━━━━━━━━━━━━━
Address: ${complaintData.location}
GPS: ${googleMapsLink}

📋 *COMPLAINT DETAILS*
━━━━━━━━━━━━━━━━━━━━
Category: ${categoryLabel}
Title: ${complaintData.title}

Description:
${complaintData.description}
${complaintData.imageUrl ? `\n📷 *Photo/Video:* ${complaintData.imageUrl}` : ""}

━━━━━━━━━━━━━━━━━━━━
_Submitted via Ward 26 Connect App_
_Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}_`;

  try {
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappApiUrl && whatsappApiToken && whatsappPhoneNumberId) {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: CORPORATOR_WHATSAPP,
            type: "text",
            text: {
              body: message,
              preview_url: true,
            },
          }),
        }
      );

      if (response.ok) {
        console.log("WhatsApp notification sent successfully via API");
        return { success: true, method: "api" };
      }
    }

    await supabase.from("whatsapp_queue").insert({
      phone_number: CORPORATOR_WHATSAPP,
      message: message,
      complaint_id: complaintData.complaintId,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    console.log("WhatsApp notification queued for delivery");
    return { success: true, method: "queued" };
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return { success: false, error };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch complaints error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch complaints" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("Complaints fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, category, title, description, location, latitude, longitude, image_url } =
      await request.json();

    if (!user_id || !category || !title || !description || !location || !latitude || !longitude) {
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
            "Complaint location is outside Ward 26 boundary. Only complaints within Ward 26 can be submitted.",
        },
        { status: 403 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("full_name, phone, voter_id")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      console.error("User fetch error:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert({
        user_id,
        category,
        title,
        description,
        location,
        latitude,
        longitude,
        image_url: image_url || null,
        status: "pending",
        priority: "medium",
      })
      .select()
      .single();

    if (error) {
      console.error("Create complaint error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to submit complaint" },
        { status: 500 }
      );
    }

    sendWhatsAppNotification({
      residentName: user.full_name,
      phone: user.phone,
      voterId: user.voter_id,
      latitude,
      longitude,
      category,
      title,
      description,
      location,
      imageUrl: image_url || null,
      complaintId: complaint.id,
    }).catch((err) => {
      console.error("Background WhatsApp notification failed:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Complaint submitted successfully!",
      complaint,
    });
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit complaint" },
      { status: 500 }
    );
  }
}
