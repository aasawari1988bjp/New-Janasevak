"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Loader2, CheckCircle, XCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { BJPLogo, LeaderCard, LEADERS } from "@/components/BJPLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    voter_id: "",
    epic_number: "",
    password: "",
    confirmPassword: "",
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    setLocationStatus("loading");
    setLocationMessage("Detecting your location...");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          const res = await fetch("/api/verify-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await res.json();

          if (data.inWard) {
            setLocationStatus("verified");
            setLocationMessage("Location verified! You are within Ward 26 boundary.");
          } else {
            setLocationStatus("error");
            setLocationMessage(data.error || "You are outside Ward 26 boundary.");
          }
        } catch {
          setLocationStatus("error");
          setLocationMessage("Failed to verify location. Please try again.");
        }
      },
      (error) => {
        setLocationStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationMessage("Location access denied. Please enable location to register.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationMessage("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationMessage("Location request timed out. Please try again.");
            break;
          default:
            setLocationMessage("An error occurred while getting your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (locationStatus !== "verified" || !location) {
      toast.error("Please verify your location within Ward 26 to register.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Registration successful! Please login to continue.");
        router.push("/login");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 hidden lg:block">
              <div className="sticky top-8">
                <div className="glass-morphism rounded-3xl p-8 mb-6">
                  <div className="text-center mb-8">
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png"
                      alt="BJP Logo"
                      width={100}
                      height={100}
                      className="mx-auto mb-4"
                      unoptimized
                    />
                    <h2 className="text-xl font-bold text-white">Ward 26 Connect</h2>
                    <p className="text-white/60 text-sm">Bharatiya Janata Party</p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-white font-semibold text-center mb-4">Our Leadership</h3>
                    <div className="flex flex-col items-center gap-6">
                      <LeaderCard {...LEADERS.modi} />
                      <LeaderCard {...LEADERS.fadnavis} />
                      <LeaderCard {...LEADERS.chavan} />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-center">
                  <p className="text-white/70 text-sm">
                    <span className="text-[#FF6B00] font-semibold">Mrs. Aasawari Kedar Navare</span>
                    <br />
                    BJP Corporator - Ward 26, KDMC
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="glass-morphism rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="lg:hidden mb-4">
                    <BJPLogo size="lg" className="mx-auto" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Register for Ward 26</h1>
                  <p className="text-white/60 text-sm">Join the exclusive Ward 26 Citizens Network</p>
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
                      {locationMessage || "Location verification required"}
                    </p>
                  </div>
                  {locationStatus === "error" && (
                    <button
                      onClick={requestLocation}
                      className="text-[#FF6B00] text-sm hover:underline"
                    >
                      Retry
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          EPIC Number (Voter ID)
                          <span className="text-white/40 ml-1 text-xs">(Optional - can add later)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.epic_number}
                          onChange={(e) => setFormData({ ...formData, epic_number: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors uppercase"
                          placeholder="e.g. ABC1234567 (optional)"
                          maxLength={10}
                        />
                        <p className="text-green-400 text-xs mt-1">✓ EPIC verification required after 5 complaints</p>
                      </div>
                    </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                      placeholder="Your complete address in Ward 26"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm mb-2">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || locationStatus !== "verified"}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register as Ward 26 Citizen"
                    )}
                  </button>
                </form>

                <p className="text-center text-white/60 text-sm mt-6">
                  Already registered?{" "}
                  <Link href="/login" className="text-[#FF6B00] hover:underline">
                    Login here
                  </Link>
                </p>
              </div>

              <p className="text-center text-white/40 text-xs mt-6">
                Only residents within Ward 26 boundaries can register. Your location will be verified.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
