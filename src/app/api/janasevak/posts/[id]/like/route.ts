import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('janasevak_post_likes')
      .select('id')
      .eq('post_id', params.id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already liked this post' },
        { status: 400 }
      );
    }

    // Add like
    const { error } = await supabase
      .from('janasevak_post_likes')
      .insert({
        post_id: params.id,
        user_id
      });

    if (error) {
      console.error('Like post error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to like post' },
        { status: 500 }
      );
    }

    // Get updated like count
    const { data: post } = await supabase
      .from('janasevak_posts')
      .select('likes_count')
      .eq('id', params.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Post liked!',
      likes_count: post?.likes_count || 0
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('janasevak_post_likes')
      .delete()
      .eq('post_id', params.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Unlike post error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to unlike post' },
        { status: 500 }
      );
    }

    // Get updated like count
    const { data: post } = await supabase
      .from('janasevak_posts')
      .select('likes_count')
      .eq('id', params.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Post unliked',
      likes_count: post?.likes_count || 0
    });
  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
