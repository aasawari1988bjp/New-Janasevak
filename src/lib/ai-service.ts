/**
 * AI Service for Complaint Categorization and Analysis
 * Uses Google Gemini 3 Flash via Emergent Universal Key
 */

export interface ComplaintAnalysis {
  department: string;
  priority: 'urgent' | 'normal' | 'low';
  sentiment: 'angry' | 'frustrated' | 'neutral' | 'polite';
  confidence: number;
  reasoning: string;
  suggestedResponse?: string;
}

export interface DuplicateCheck {
  isDuplicate: boolean;
  similarComplaints: string[];
  confidence: number;
}

const DEPARTMENTS = {
  roads: 'Roads & Footpaths',
  water: 'Water Supply',
  drainage: 'Drainage & Sewage',
  garbage: 'Garbage Collection',
  lights: 'Street Lights',
  encroachment: 'Encroachment',
  pollution: 'Pollution',
  parks: 'Parks & Gardens',
  buildings: 'Buildings & Construction',
  others: 'Others'
};

export async function categorizeComplaint(
  title: string,
  description: string,
  userCategory: string
): Promise<ComplaintAnalysis> {
  try {
    const prompt = `You are an AI assistant for a municipal ward complaint management system. Analyze this citizen complaint and categorize it.

Complaint Title: ${title}
Complaint Description: ${description}
User Selected Category: ${userCategory}

Available Departments:
${Object.entries(DEPARTMENTS).map(([code, name]) => `- ${name} (${code})`).join('\n')}

Analyze and respond in JSON format:
{
  "department": "department_code",
  "priority": "urgent|normal|low",
  "sentiment": "angry|frustrated|neutral|polite",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why you chose this department and priority",
  "suggestedResponse": "A brief, empathetic acknowledgment message for the citizen (2-3 lines)"
}

Priority Guidelines:
- urgent: Health/safety hazards, water leaks, major road damage, overflowing sewage
- normal: Regular maintenance issues, streetlight repairs
- low: Suggestions, general improvements

Respond only with valid JSON, no additional text.`;

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('AI categorization error:', error);
    // Fallback to user category
    return {
      department: userCategory || 'others',
      priority: 'normal',
      sentiment: 'neutral',
      confidence: 0.5,
      reasoning: 'AI analysis unavailable, using user selection',
      suggestedResponse: 'Thank you for your complaint. We will review it and take appropriate action.'
    };
  }
}

export async function checkDuplicates(
  title: string,
  description: string,
  existingComplaints: Array<{ id: string; title: string; description: string }>
): Promise<DuplicateCheck> {
  try {
    const prompt = `You are an AI assistant checking for duplicate municipal complaints.

New Complaint:
Title: ${title}
Description: ${description}

Existing Complaints:
${existingComplaints.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title}: ${c.description}`).join('\n')}

Analyze if the new complaint is a duplicate of any existing complaints. Consider semantic similarity, not just exact matches.

Respond in JSON format:
{
  "isDuplicate": true/false,
  "similarComplaints": ["complaint_id1", "complaint_id2"],
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}

Respond only with valid JSON, no additional text.`;

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Duplicate check failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return {
      isDuplicate: false,
      similarComplaints: [],
      confidence: 0
    };
  }
}

export async function generateProgressUpdate(
  complaintTitle: string,
  currentStatus: string,
  actionTaken: string
): Promise<string> {
  try {
    const prompt = `Generate a professional progress update message for a municipal complaint.

Complaint: ${complaintTitle}
Current Status: ${currentStatus}
Action Taken: ${actionTaken}

Generate a brief, clear update message (2-3 sentences) that:
1. Acknowledges the action taken
2. Provides clarity on current status
3. Is professional and empathetic

Respond with just the message text, no JSON or additional formatting.`;

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Update generation failed');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Update generation error:', error);
    return `Status updated: ${actionTaken}`;
  }
}
