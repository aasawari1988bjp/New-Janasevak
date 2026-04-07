"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Heart,
  Eye,
  Calendar,
  Pin,
  Filter,
  Loader2,
  MessageSquare,
  Share2,
  ArrowLeft,
  Bell,
  Megaphone,
  Award,
  PartyPopper,
  Info
} from "lucide-react";
import { BJPLogo } from "@/components/BJPLogo";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  media_type: string;
  media_urls: string[];
  is_pinned: boolean;
  views: number;
  likes_count: number;
  is_liked_by_user?: boolean;
  created_by: string;
  created_at: string;
}

const CATEGORIES = {
  all: { label: 'All Updates', icon: Info, color: 'white' },
  news: { label: 'News', icon: Megaphone, color: 'blue' },
  notice: { label: 'Notices', icon: Bell, color: 'yellow' },
  invitation: { label: 'Invitations', icon: PartyPopper, color: 'purple' },
  achievement: { label: 'Achievements', icon: Award, color: 'green' },
  announcement: { label: 'Announcements', icon: Info, color: 'orange' },
  event: { label: 'Events', icon: Calendar, color: 'pink' },
  scheme: { label: 'Schemes', icon: Info, color: 'cyan' }
};

export default function JanasevakPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let url = `/api/janasevak/posts?limit=50`;
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      if (user?.id) {
        url += `&user_id=${user.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
      } else {
        toast.error('Failed to load posts');
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!userId) {
      toast.error('Please login to like posts');
      router.push('/login');
      return;
    }

    try {
      if (isCurrentlyLiked) {
        // Unlike
        const res = await fetch(`/api/janasevak/posts/${postId}/like?user_id=${userId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          setPosts(posts.map(p => 
            p.id === postId 
              ? { ...p, is_liked_by_user: false, likes_count: data.likes_count }
              : p
          ));
        }
      } else {
        // Like
        const res = await fetch(`/api/janasevak/posts/${postId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        
        if (data.success) {
          setPosts(posts.map(p => 
            p.id === postId 
              ? { ...p, is_liked_by_user: true, likes_count: data.likes_count }
              : p
          ));
          toast.success('Post liked!');
        }
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.all;
    const Icon = cat.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.all;
    return cat.color;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <BJPLogo size="xl" className="mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">
              जनसेवक - Janasevak
            </h1>
            <p className="text-xl text-white/80 mb-1">Your Direct Connection</p>
            <p className="text-white/60">
              <span className="text-[#FF6B00] font-semibold">Mrs. Aasawari Kedar Navare</span>
              <br />
              BJP Corporator, Ward 26, KDMC
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(CATEGORIES).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No posts yet in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-morphism rounded-3xl p-6 ${
                    post.is_pinned ? 'border-2 border-[#FF6B00]/50' : ''
                  }`}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                        AN
                      </div>
                      <div>
                        <p className="text-white font-semibold">{post.created_by}</p>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <div className="px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-semibold flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </div>
                      )}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-${getCategoryColor(post.category)}-500/20 text-${getCategoryColor(post.category)}-400`}>
                        {getCategoryIcon(post.category)}
                        {CATEGORIES[post.category as keyof typeof CATEGORIES]?.label || post.category}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
                    <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>
                  </div>

                  {/* Media */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {post.media_urls.map((url, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden">
                          {post.media_type === 'image' ? (
                            <img
                              src={url}
                              alt={`Post media ${idx + 1}`}
                              className="w-full h-auto object-cover"
                            />
                          ) : post.media_type === 'video' ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-auto"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id, post.is_liked_by_user || false)}
                        className={`flex items-center gap-2 transition-all ${
                          post.is_liked_by_user
                            ? 'text-red-500'
                            : 'text-white/60 hover:text-red-400'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${post.is_liked_by_user ? 'fill-red-500' : ''}`}
                        />
                        <span className="font-semibold">{post.likes_count}</span>
                      </button>

                      <div className="flex items-center gap-2 text-white/60">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">{post.views}</span>
                      </div>
                    </div>

                    <button className="text-white/60 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
