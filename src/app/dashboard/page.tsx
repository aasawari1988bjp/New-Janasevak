"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Home,
  MapPin,
} from "lucide-react";
import { BJPLogo } from "@/components/BJPLogo";

interface Complaint {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: Clock },
  in_progress: { bg: "bg-blue-500/10", text: "text-blue-400", icon: AlertCircle },
  resolved: { bg: "bg-green-500/10", text: "text-green-400", icon: CheckCircle },
  rejected: { bg: "bg-red-500/10", text: "text-red-400", icon: AlertCircle },
};

const CATEGORIES = [
  { value: "roads", label: "Roads & Footpaths" },
  { value: "water", label: "Water Supply" },
  { value: "drainage", label: "Drainage & Sewage" },
  { value: "garbage", label: "Garbage Collection" },
  { value: "streetlights", label: "Street Lights" },
  { value: "encroachment", label: "Encroachment" },
  { value: "pollution", label: "Pollution" },
  { value: "others", label: "Others" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#138808]/5 rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-semibold">Ward 26</span>
                <span className="text-[#FF6B00] ml-1 font-bold">Connect</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {user.full_name}
              </h1>
              <p className="text-white/60 text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Ward 26 Verified Resident
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Complaints", value: stats.total, color: "from-[#FF6B00] to-[#D4AF37]" },
            { label: "Pending", value: stats.pending, color: "from-yellow-500 to-yellow-600" },
            { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-blue-600" },
            { label: "Resolved", value: stats.resolved, color: "from-green-500 to-green-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10"
            >
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Complaints</h2>
          <Link
            href="/complaints/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Complaint
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-4 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10"
          >
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Complaints Yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              You haven&apos;t submitted any complaints. Lodge your first complaint and help improve Ward 26.
            </p>
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-medium"
            >
              <Plus className="w-5 h-5" />
              Lodge First Complaint
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint, index) => {
              const statusConfig = STATUS_COLORS[complaint.status] || STATUS_COLORS.pending;
              const StatusIcon = statusConfig.icon;
              const categoryLabel = CATEGORIES.find((c) => c.value === complaint.category)?.label || complaint.category;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 hover:border-[#FF6B00]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-medium">
                          {categoryLabel}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} text-xs font-medium flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {complaint.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{complaint.title}</h3>
                      <p className="text-white/60 text-sm line-clamp-2 mb-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-white/40 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {complaint.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(complaint.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
