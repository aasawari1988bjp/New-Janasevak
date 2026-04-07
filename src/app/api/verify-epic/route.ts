import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyVoter } from '@/lib/voter-verification';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { user_id, epic_number } = await request.json();

    if (!user_id || !epic_number) {
      return NextResponse.json(
        { success: false, error: 'User ID and EPIC number are required' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name, epic_number, voter_verified')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If already verified
    if (user.voter_verified) {
      return NextResponse.json(
        { success: true, message: 'Your account is already verified!' },
        { status: 200 }
      );
    }

    // Check if EPIC already used by another user
    const { data: existingEpic } = await supabase
      .from('users')
      .select('id')
      .eq('epic_number', epic_number)
      .neq('id', user_id)
      .single();

    if (existingEpic) {
      return NextResponse.json(
        { success: false, error: 'This EPIC number is already registered with another account.' },
        { status: 400 }
      );
    }

    // Verify against voter list
    const voterVerification = await verifyVoter(user.full_name, epic_number);

    if (!voterVerification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: voterVerification.message || 'EPIC number verification failed. Please ensure your EPIC number matches your name in the voter list.',
          confidence: voterVerification.confidence
        },
        { status: 400 }
      );
    }

    // Update user with verified EPIC
    const { error: updateError } = await supabase
      .from('users')
      .update({
        epic_number: voterVerification.matchedVoter?.epic_number || epic_number,
        voter_verified: true
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('EPIC verification update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'EPIC number verified successfully! You can now submit unlimited complaints.',
      voterVerification: {
        verified: true,
        matchType: voterVerification.matchType,
        confidence: voterVerification.confidence,
        matchedName: voterVerification.matchedVoter?.voter_name
      }
    });
  } catch (error) {
    console.error('EPIC verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
