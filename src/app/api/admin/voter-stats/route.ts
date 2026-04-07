import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("voter_list")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    // Get gender distribution
    const { data: genderData, error: genderError } = await supabase
      .from("voter_list")
      .select("gender");

    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;

    if (genderData) {
      genderData.forEach((row: any) => {
        if (row.gender === "Male") maleCount++;
        else if (row.gender === "Female") femaleCount++;
        else otherCount++;
      });
    }

    // Get age distribution
    const { data: ageData, error: ageError } = await supabase
      .from("voter_list")
      .select("age");

    let age18to25 = 0;
    let age26to35 = 0;
    let age36to50 = 0;
    let age51to65 = 0;
    let age65plus = 0;

    if (ageData) {
      ageData.forEach((row: any) => {
        const age = row.age;
        if (age >= 18 && age <= 25) age18to25++;
        else if (age >= 26 && age <= 35) age26to35++;
        else if (age >= 36 && age <= 50) age36to50++;
        else if (age >= 51 && age <= 65) age51to65++;
        else if (age > 65) age65plus++;
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalVoters: totalCount || 0,
        gender: {
          male: maleCount,
          female: femaleCount,
          other: otherCount,
        },
        ageDistribution: {
          "18-25": age18to25,
          "26-35": age26to35,
          "36-50": age36to50,
          "51-65": age51to65,
          "65+": age65plus,
        },
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch voter statistics" },
      { status: 500 }
    );
  }
}
