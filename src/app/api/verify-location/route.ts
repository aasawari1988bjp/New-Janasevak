import { NextRequest, NextResponse } from "next/server";
import { isInWard26, getDistanceFromWard } from "@/lib/geofence";

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "Location coordinates required" },
        { status: 400 }
      );
    }

    const isInWard = isInWard26(latitude, longitude);
    const distance = getDistanceFromWard(latitude, longitude);

    if (isInWard) {
      return NextResponse.json({
        success: true,
        inWard: true,
        message: "Location verified! You are within Ward 26 boundary.",
        distance: distance.toFixed(2),
      });
    } else {
      return NextResponse.json({
        success: false,
        inWard: false,
        error: "You are outside Ward 26 boundary. Only residents of Ward 26 can register.",
        distance: distance.toFixed(2),
      });
    }
  } catch (error) {
    console.error("Location verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify location" },
      { status: 500 }
    );
  }
}
