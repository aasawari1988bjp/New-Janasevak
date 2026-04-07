import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - List all posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('user_id'); // For checking liked status

    let query = supabase
      .from('janasevak_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Fetch posts error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // If user_id provided, check which posts they've liked
    let postsWithLikeStatus = posts;
    if (userId) {
      const { data: userLikes } = await supabase
        .from('janasevak_post_likes')
        .select('post_id')
        .eq('user_id', userId);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
      
      postsWithLikeStatus = posts?.map(post => ({
        ...post,
        is_liked_by_user: likedPostIds.has(post.id)
      }));
    }

    return NextResponse.json({
      success: true,
      posts: postsWithLikeStatus
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const { title, content, category, media_type, media_urls, is_pinned } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabase
      .from('janasevak_posts')
      .insert({
        title,
        content,
        category,
        media_type: media_type || 'none',
        media_urls: media_urls || [],
        is_pinned: is_pinned || false,
        created_by: 'Aasawari Kedar Navare'
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully!',
      post
    });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
