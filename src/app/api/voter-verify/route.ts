import { NextRequest, NextResponse } from "next/server";
import { verifyVoter } from "@/lib/voter-verification";

export async function POST(request: NextRequest) {
  try {
    const { name, epic_number } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required for voter verification" },
        { status: 400 }
      );
    }

    const result = await verifyVoter(name, epic_number);

    return NextResponse.json({
      success: result.verified,
      ...result,
    });
  } catch (error) {
    console.error("Voter verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
