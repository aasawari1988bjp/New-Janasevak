"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { isInWard26 } from "@/lib/geofence";
import { BJPLogo } from "@/components/BJPLogo";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Send,
  Camera,
  Home,
} from "lucide-react";

const CATEGORIES = [
  { value: "roads", label: "Roads & Footpaths", icon: "🛣️" },
  { value: "water", label: "Water Supply", icon: "💧" },
  { value: "drainage", label: "Drainage & Sewage", icon: "🚿" },
  { value: "garbage", label: "Garbage Collection", icon: "🗑️" },
  { value: "streetlights", label: "Street Lights", icon: "💡" },
  { value: "encroachment", label: "Encroachment", icon: "🏗️" },
  { value: "pollution", label: "Pollution", icon: "🌫️" },
  { value: "others", label: "Others", icon: "📝" },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [complaintLocation, setComplaintLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const requestLocation = () => {
    setLocationStatus("loading");
    setLocationMessage("Detecting complaint location...");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setComplaintLocation({ lat: latitude, lng: longitude });

        if (isInWard26(latitude, longitude)) {
          setLocationStatus("verified");
          setLocationMessage("Location verified within Ward 26!");
        } else {
          setLocationStatus("error");
          setLocationMessage("Location is outside Ward 26. Only complaints from Ward 26 area are accepted.");
        }
      },
      (error) => {
        setLocationStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationMessage("Location access denied. Please enable location.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationMessage("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationMessage("Location request timed out.");
            break;
          default:
            setLocationMessage("An error occurred while getting location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a complaint");
      return;
    }

    if (locationStatus !== "verified" || !complaintLocation) {
      toast.error("Please verify the complaint location within Ward 26");
      return;
    }

    if (!formData.category || !formData.title || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          latitude: complaintLocation.lat,
          longitude: complaintLocation.lng,
          image_url: imageUrl || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedComplaintId(data.complaint.id.slice(0, 8).toUpperCase());
        setShowSuccess(true);
      } else {
        toast.error(data.error || "Failed to submit complaint");
      }
    } catch {
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-md mx-auto mt-20"
          >
            <div className="glass-morphism rounded-3xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2">Complaint Submitted</h1>
                <p className="text-white/60 mb-6">
                  Your complaint has been successfully registered
                </p>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-white/60 text-sm mb-1">Complaint ID</p>
                  <p className="text-2xl font-bold text-[#FF6B00]">{submittedComplaintId}</p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png"
                    alt="BJP Logo"
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">Ward 26 Office</p>
                    <p className="text-white/60 text-xs">Will review your complaint</p>
                  </div>
                </div>

                <p className="text-white/50 text-sm mb-6">
                  You can track the status of your complaint from your dashboard
                </p>

                <div className="flex gap-3">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setFormData({ category: "", title: "", description: "", location: "" });
                      setImageUrl("");
                      setLocationStatus("idle");
                      setLocationMessage("");
                      setComplaintLocation(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
                  >
                    New Complaint
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-2xl mx-auto"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="glass-morphism rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center mb-4">
                  <BJPLogo size="sm" className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Lodge a Complaint</h1>
                <p className="text-white/60 text-sm">Help us improve Ward 26 by reporting issues</p>
              </div>

              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  locationStatus === "verified"
                    ? "bg-green-500/10 border border-green-500/30"
                    : locationStatus === "error"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {locationStatus === "loading" ? (
                  <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin" />
                ) : locationStatus === "verified" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : locationStatus === "error" ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <MapPin className="w-5 h-5 text-white/60" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      locationStatus === "verified"
                        ? "text-green-400"
                        : locationStatus === "error"
                        ? "text-red-400"
                        : "text-white/70"
                    }`}
                  >
                    {locationMessage || "Verify complaint location"}
                  </p>
                </div>
                {locationStatus !== "verified" && (
                  <button
                    onClick={requestLocation}
                    className="px-4 py-1.5 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full text-sm font-medium hover:bg-[#FF6B00]/30 transition-colors"
                  >
                    {locationStatus === "error" ? "Retry" : "Get Location"}
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm mb-3">Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.category === cat.value
                            ? "bg-[#FF6B00]/20 border-[#FF6B00] text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <span className="text-2xl mb-1 block">{cat.icon}</span>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                    placeholder="Brief title of your complaint"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                    placeholder="e.g., Near Shiv Market, Ayare Road"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Photo/Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                    placeholder="Paste image/video link (Google Drive, etc.)"
                  />
                  <p className="text-white/40 text-xs mt-1">Upload to Google Drive and paste the shareable link</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || locationStatus !== "verified"}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Complaint
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-white/40 text-xs mt-6">
              Only complaints from within Ward 26 boundary will be accepted and addressed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
