"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Award,
  Users,
  Target,
  Heart,
  Building,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { BJPLogo } from "@/components/BJPLogo";

const ACHIEVEMENTS = [
  {
    icon: Building,
    title: "Infrastructure Development",
    description: "Improved road conditions and drainage systems across Ward 26",
  },
  {
    icon: Users,
    title: "Community Engagement",
    description: "Regular public meetings and door-to-door visits to understand citizen needs",
  },
  {
    icon: Heart,
    title: "Healthcare Initiatives",
    description: "Organized health camps and awareness programs for residents",
  },
  {
    icon: Target,
    title: "Quick Response",
    description: "24-hour complaint resolution system for urgent issues",
  },
];

const WARD_AREAS = [
  "Ayare Road",
  "Rajaji Path",
  "Ram Nagar",
  "Shiv Market",
  "Savarkar Road",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#138808]/10 rounded-full blur-[150px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3">
              <BJPLogo size="sm" />
              <div className="hidden sm:block">
                <span className="text-white font-semibold">Ward 26</span>
                <span className="text-[#FF6B00] ml-1 font-bold">Connect</span>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-300 hover:text-[#FF6B00] transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm text-[#FF6B00] font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-gray-300 hover:text-[#FF6B00] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF6B00] transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-3xl p-6 sm:p-10 mb-8"
          >
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 text-center lg:text-left">
                <div className="relative inline-block mb-6">
                  <div className="relative w-64 h-80 sm:w-72 sm:h-96 mx-auto lg:mx-0 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 via-transparent to-[#138808]/20 z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/f7cd043f-2f0b-4500-a548-677ae12f25de/_77A2838_new-resized-1768839941182.webp?width=8000&height=8000&resize=contain"
                      alt="Mrs. Aasawari Kedar Navare - BJP Corporator Ward 26"
                      fill
                      className="object-contain object-bottom"
                      style={{
                        filter: "contrast(1.05) saturate(1.1) brightness(1.02)",
                      }}
                      unoptimized
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-[#138808] to-[#0d6606] rounded-xl flex items-center justify-center shadow-lg shadow-[#138808]/30">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full bg-[#138808]/20 border border-[#138808]/30 w-fit mx-auto lg:mx-0">
                  <Shield className="w-4 h-4 text-[#138808]" />
                  <span className="text-sm text-[#138808]">Elected Representative</span>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center gap-4 mb-4">
                  <BJPLogo size="md" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                    <span className="text-sm text-[#FF6B00] font-medium">Bharatiya Janata Party</span>
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                  Mrs. Aasawari <span className="text-gradient-saffron">Kedar Navare</span>
                </h1>
                <p className="text-xl text-[#D4AF37] font-medium mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  BJP Corporator • Ward 26, KDMC
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Calendar className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm text-gray-300">Serving Since 2024</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#FF9933]" />
                      <div className="w-3 h-3 rounded bg-white" />
                      <div className="w-3 h-3 rounded bg-[#138808]" />
                    </div>
                    <span className="text-sm text-[#FF6B00] font-medium">Ward 26 • KDMC</span>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                  Mrs. Aasawari Kedar Navare is a dedicated public servant representing Ward 26 of Kalyan-Dombivli Municipal Corporation (KDMC). As a newly elected BJP Corporator, she is committed to transforming the ward through better infrastructure, improved civic amenities, and responsive governance.
                </p>

                <p className="text-gray-400 leading-relaxed">
                  With a vision to make Ward 26 a model ward in KDMC, she has introduced this digital platform to ensure every citizen&apos;s voice is heard. Through the 24/7 complaint system, residents can directly report issues and track their resolution, making governance more transparent and accessible.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Vision & Initiatives</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-morphism rounded-xl p-5 hover:border-[#FF6B00]/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Ward 26 Coverage</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 mb-4">
                  Ward 26 covers some of the most vibrant neighborhoods in Kalyan-Dombivli. Our focus areas include:
                </p>
                <div className="space-y-3">
                  {WARD_AREAS.map((area) => (
                    <div key={area} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
                      <MapPin className="w-4 h-4 text-[#FF6B00]" />
                      <span className="text-gray-300">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#FF6B00]" />
                  <span className="font-semibold text-white">Ward Office</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Ward 26, Kalyan-Dombivli Municipal Corporation,
                  Maharashtra - 421301
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-[#FF6B00]" />
                    <span>+91 XXXXX XXXXX</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4 text-[#FF6B00]" />
                    <span>ward26@kdmc.gov.in</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-gray-400 mb-6">
              Have an issue to report? Lodge a complaint and we will address it within 24 hours.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-[#FF6B00]/30 transition-all"
            >
              Register & Lodge Complaint
            </Link>
          </motion.div>
        </div>
      </div>

      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <BJPLogo size="sm" />
            <span className="text-sm text-[#D4AF37] font-medium">BJP - भारतीय जनता पार्टी</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 Mrs. Aasawari Kedar Navare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
