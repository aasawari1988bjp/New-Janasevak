import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Analysis API using Google Gemini 3 Flash
 * This is a server-side only endpoint for AI operations
 */

let LlmChat: any = null;
let UserMessage: any = null;

// Dynamically import emergentintegrations
async function initializeAI() {
  if (!LlmChat || !UserMessage) {
    try {
      const emergentintegrations = await import('emergentintegrations/llm/chat');
      LlmChat = emergentintegrations.LlmChat;
      UserMessage = emergentintegrations.UserMessage;
    } catch (error) {
      console.error('Failed to load emergentintegrations:', error);
      throw new Error('AI service unavailable');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt required' },
        { status: 400 }
      );
    }

    // Initialize AI
    await initializeAI();

    const apiKey = process.env.EMERGENT_LLM_KEY;
    if (!apiKey) {
      throw new Error('EMERGENT_LLM_KEY not configured');
    }

    // Create AI chat instance with Gemini 3 Flash
    const chat = new LlmChat(
      apiKey,
      `complaint-ai-${Date.now()}`,
      'You are an AI assistant for a municipal ward complaint management system. Provide accurate, concise, and helpful analysis.'
    ).with_model('gemini', 'gemini-3-flash-preview');

    // Send message and get response
    const userMessage = new UserMessage(prompt);
    const response = await chat.send_message(userMessage);

    // Try to parse as JSON if it looks like JSON
    let analysis;
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }
      analysis = JSON.parse(cleanResponse);
    } catch (e) {
      // If not JSON, return as text
      analysis = response;
    }

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'AI analysis failed' },
      { status: 500 }
    );
  }
}
