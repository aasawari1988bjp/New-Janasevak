import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VoterEntry {
  sr_no?: number;
  epic_number: string;
  voter_name: string;
  father_husband_name?: string;
  house_no?: string;
  age?: number;
  gender?: string;
}

function parseVoterListText(text: string): VoterEntry[] {
  const voters: VoterEntry[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);

  const epicPattern = /[A-Z]{3}[0-9]{7}/g;

  let currentEntry: Partial<VoterEntry> = {};
  let entryText = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    entryText += " " + line;

    const epicMatches = line.match(epicPattern);
    if (epicMatches) {
      if (currentEntry.epic_number && currentEntry.voter_name) {
        voters.push(currentEntry as VoterEntry);
      }
      
      currentEntry = { epic_number: epicMatches[0] };
      entryText = line;
    }

    const nameMatch = line.match(/(?:Name|नाम)\s*:?\s*([A-Za-z\s]{2,50})/i);
    if (nameMatch && nameMatch[1]) {
      currentEntry.voter_name = nameMatch[1].trim();
    }

    const fatherMatch = line.match(/(?:Father|Husband|पिता|पति)(?:'s)?\s*(?:Name)?\s*:?\s*([A-Za-z\s]{2,50})/i);
    if (fatherMatch && fatherMatch[1]) {
      currentEntry.father_husband_name = fatherMatch[1].trim();
    }

    const houseMatch = line.match(/(?:House\s*No|H\.No|घर\s*नं)\s*:?\s*([A-Za-z0-9\-\/\s]{1,20})/i);
    if (houseMatch && houseMatch[1]) {
      currentEntry.house_no = houseMatch[1].trim();
    }

    const ageMatch = line.match(/(?:Age|उम्र)\s*:?\s*(\d{1,3})/i);
    if (ageMatch && ageMatch[1]) {
      currentEntry.age = parseInt(ageMatch[1], 10);
    }

    if (/Male|पुरुष/i.test(line) && !/Female|महिला/i.test(line)) {
      currentEntry.gender = "Male";
    } else if (/Female|महिला/i.test(line)) {
      currentEntry.gender = "Female";
    }
  }

  if (currentEntry.epic_number && currentEntry.voter_name) {
    voters.push(currentEntry as VoterEntry);
  }

  // Enhanced table pattern matching for common voter list formats
  const tablePattern = /(\d+)\s+([A-Z]{3}\d{7})\s+([A-Za-z\s]+?)(?:\s+(?:M|F|Male|Female))?\s+(\d{2,3})/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(text)) !== null) {
    const existingEpic = voters.find(v => v.epic_number === tableMatch[2]);
    if (!existingEpic) {
      voters.push({
        sr_no: parseInt(tableMatch[1], 10),
        epic_number: tableMatch[2],
        voter_name: tableMatch[3].trim(),
        age: parseInt(tableMatch[4], 10),
      });
    }
  }

  return voters;
}

// Batch insert function for better performance
async function batchInsertVoters(voters: VoterEntry[], batchSize: number = 500) {
  let insertedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < voters.length; i += batchSize) {
    const batch = voters.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from("voter_list")
        .upsert(batch.map(voter => ({
          sr_no: voter.sr_no,
          epic_number: voter.epic_number,
          voter_name: voter.voter_name,
          father_husband_name: voter.father_husband_name,
          house_no: voter.house_no,
          age: voter.age,
          gender: voter.gender,
        })), { onConflict: "epic_number" });

      if (error) {
        skippedCount += batch.length;
        if (errors.length < 10) {
          errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        }
      } else {
        insertedCount += batch.length;
      }
    } catch (err) {
      skippedCount += batch.length;
      if (errors.length < 10) {
        errors.push(`Batch ${i / batchSize + 1}: ${err}`);
      }
    }
  }

  return { insertedCount, skippedCount, errors };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pdfUrl = formData.get("pdf_url") as string | null;

    let pdfBuffer: Buffer;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else if (pdfUrl) {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch PDF from URL" },
          { status: 400 }
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide a PDF file or URL" },
        { status: 400 }
      );
    }

    console.log("Starting PDF parsing...");
    const pdfData = await pdf(pdfBuffer);
    const extractedText = pdfData.text;

    console.log(`PDF parsed. Pages: ${pdfData.numpages}, Text length: ${extractedText.length}`);

    const voters = parseVoterListText(extractedText);

    if (voters.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No voter entries found in the PDF. The format may not be supported.",
        rawTextPreview: extractedText.substring(0, 1000),
      }, { status: 400 });
    }

    console.log(`Extracted ${voters.length} voters. Starting batch insert...`);

    // Use batch insert for better performance
    const { insertedCount, skippedCount, errors } = await batchInsertVoters(voters, 500);

    return NextResponse.json({
      success: true,
      message: `Voter list processed successfully!`,
      stats: {
        totalExtracted: voters.length,
        inserted: insertedCount,
        skipped: skippedCount,
        pdfPages: pdfData.numpages,
      },
      sampleEntries: voters.slice(0, 5),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to process voter list PDF: ${error}` },
      { status: 500 }
    );
  }
}
