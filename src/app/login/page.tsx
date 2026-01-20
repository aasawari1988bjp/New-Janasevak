"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { LeaderCard, LEADERS } from "@/components/BJPLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success("Welcome back to Ward 26 Connect!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-morphism rounded-3xl p-8 order-2 md:order-1">
            <div className="text-center mb-8">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png"
                alt="BJP Logo"
                width={80}
                height={80}
                className="mx-auto mb-4"
                unoptimized
              />
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-white/60 text-sm">Login to Ward 26 Citizens Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/70 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white font-semibold hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center text-white/60 text-sm mt-6">
              New to Ward 26 Connect?{" "}
              <Link href="/register" className="text-[#FF6B00] hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="hidden md:block order-1 md:order-2">
            <div className="glass-morphism rounded-3xl p-8 h-full">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Our Leadership</h2>
                <p className="text-white/60 text-sm">Bharatiya Janata Party</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <LeaderCard {...LEADERS.modi} />
                <LeaderCard {...LEADERS.fadnavis} />
                <LeaderCard {...LEADERS.chavan} />
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-center">
                <p className="text-white/70 text-sm">
                  <span className="text-[#FF6B00] font-semibold">Mrs. Aasawari Kedar Navare</span>
                  <br />
                  BJP Corporator - Ward 26, KDMC
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30">
          <p className="text-white/70 text-sm text-center">
            <span className="text-[#FF6B00] font-medium">Note:</span> Only verified Ward 26 residents can access this portal.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
