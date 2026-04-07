import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = new URL(request.url).searchParams.get('user_id');

    // Increment view count
    await supabase.rpc('increment_post_views', { post_uuid: params.id });

    const { data: post, error } = await supabase
      .from('janasevak_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user liked this post
    let isLiked = false;
    if (userId) {
      const { data: like } = await supabase
        .from('janasevak_post_likes')
        .select('id')
        .eq('post_id', params.id)
        .eq('user_id', userId)
        .single();
      
      isLiked = !!like;
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        is_liked_by_user: isLiked
      }
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT - Update post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content, category, media_type, media_urls, is_pinned } = await request.json();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (media_type !== undefined) updateData.media_type = media_type;
    if (media_urls !== undefined) updateData.media_urls = media_urls;
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;

    const { data: post, error } = await supabase
      .from('janasevak_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update post error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('janasevak_posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Delete post error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
