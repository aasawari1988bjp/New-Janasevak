import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(s1, s2);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

export interface VoterVerificationResult {
  verified: boolean;
  matchType: "epic" | "name" | "none";
  confidence: number;
  matchedVoter?: {
    epic_number: string;
    voter_name: string;
    father_husband_name?: string;
    house_no?: string;
  };
  message: string;
}

export async function verifyVoter(
  name: string,
  epicNumber?: string
): Promise<VoterVerificationResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (epicNumber) {
    const normalizedEpic = epicNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    const { data: epicMatch, error: epicError } = await supabase
      .from("voter_list")
      .select("*")
      .eq("epic_number", normalizedEpic)
      .single();

    if (epicMatch && !epicError) {
      return {
        verified: true,
        matchType: "epic",
        confidence: 1.0,
        matchedVoter: {
          epic_number: epicMatch.epic_number,
          voter_name: epicMatch.voter_name,
          father_husband_name: epicMatch.father_husband_name,
          house_no: epicMatch.house_no,
        },
        message: `Voter verified! EPIC number ${normalizedEpic} matched.`,
      };
    }
  }

  const normalizedName = normalizeText(name);
  const nameParts = normalizedName.split(" ").filter(p => p.length > 1);
  
  const { data: voters, error: nameError } = await supabase
    .from("voter_list")
    .select("*")
    .limit(5000);

  if (nameError || !voters || voters.length === 0) {
    return {
      verified: false,
      matchType: "none",
      confidence: 0,
      message: "Unable to verify. Voter database unavailable.",
    };
  }

  let bestMatch: (typeof voters)[0] | null = null;
  let bestScore = 0;

  for (const voter of voters) {
    const voterNameNorm = normalizeText(voter.voter_name || "");
    
    const similarity = calculateSimilarity(normalizedName, voterNameNorm);
    
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = voter;
    }

    const voterParts = voterNameNorm.split(" ").filter(p => p.length > 1);
    let partMatches = 0;
    for (const part of nameParts) {
      for (const vPart of voterParts) {
        if (calculateSimilarity(part, vPart) > 0.8) {
          partMatches++;
          break;
        }
      }
    }
    const partScore = nameParts.length > 0 ? partMatches / nameParts.length : 0;
    
    if (partScore > bestScore && partScore >= 0.7) {
      bestScore = partScore;
      bestMatch = voter;
    }
  }

  if (bestMatch && bestScore >= 0.75) {
    return {
      verified: true,
      matchType: "name",
      confidence: bestScore,
      matchedVoter: {
        epic_number: bestMatch.epic_number,
        voter_name: bestMatch.voter_name,
        father_husband_name: bestMatch.father_husband_name,
        house_no: bestMatch.house_no,
      },
      message: `Voter verified! Name matched with ${Math.round(bestScore * 100)}% confidence.`,
    };
  }

  return {
    verified: false,
    matchType: "none",
    confidence: bestScore,
    message: "Verification failed. Your name/EPIC number was not found in Ward 26 voter list.",
  };
}
