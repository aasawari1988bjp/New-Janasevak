"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { MapPin, Phone, Clock, ShieldCheck, FileText, Users, ChevronRight } from "lucide-react";
import { BJPLogo, LeaderCard, LEADERS } from "@/components/BJPLogo";

const FEATURES = [
  {
    icon: FileText,
    title: "24/7 तक्रार नोंदणी | Complaint Registration",
    description: "वॉर्ड 26 च्या सीमेत कधीही, कुठेही तक्रार नोंदवा | Lodge complaints anytime within Ward 26",
  },
  {
    icon: MapPin,
    title: "जिओ-फेन्स्ड सुरक्षा | Geo-Fenced Security",
    description: "फक्त वॉर्ड 26 रहिवाशांसाठी | Exclusive access for Ward 26 residents only",
  },
  {
    icon: Clock,
    title: "रिअल-टाइम ट्रॅकिंग | Real-time Tracking",
    description: "तुमच्या तक्रारीची स्थिती पहा | Track your complaint status",
  },
  {
    icon: ShieldCheck,
    title: "थेट संवाद | Direct Communication",
    description: "तुमच्या प्रतिनिधीशी थेट संपर्क साधा | Connect directly with your representative",
  },
];

const AREAS = [
  { en: "Ayare Road", hi: "आयरे रोड" },
  { en: "Rajaji Path", hi: "राजाजी पथ" },
  { en: "Ram Nagar", hi: "राम नगर" },
  { en: "Shiv Market", hi: "शिव मार्केट" },
  { en: "Savarkar Road", hi: "सावरकर रोड" },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <BJPLogo size="sm" />
              <div className="hidden sm:block">
                <span className="text-[#FF6B00] font-bold text-lg">जनसेवक</span>
                <span className="text-white/60 text-xs ml-1">Jansevak</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/about"
                className="px-5 py-2 text-white hover:text-[#FF6B00] transition-colors font-medium"
              >
                <span className="hidden sm:inline">माहिती | </span>About
              </Link>
              <Link
                href="/admin"
                className="px-5 py-2 text-white hover:text-[#FF6B00] transition-colors font-medium"
              >
                <span className="hidden sm:inline">प्रशासक | </span>Admin
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all"
                >
                  डॅशबोर्ड
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2 text-white hover:text-[#FF6B00] transition-colors font-medium"
                  >
                    <span className="hidden sm:inline">लॉगिन | </span>Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#FF6B00]/30 transition-all"
                  >
                    नोंदणी
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 mb-6">
                <BJPLogo size="sm" className="w-6 h-6" />
                <span className="text-[#FF6B00] text-sm font-medium">
                  भारतीय जनता पार्टी | BJP
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                <span className="text-gradient-saffron">श्रीमती आसावरी</span>
                <br />
                <span className="text-gradient-gold">केदार नवरे</span>
              </h1>
              <p className="text-lg text-white/60 mb-2">Mrs. Aasawari Kedar Navare</p>

              <p className="text-xl text-white/80 mb-2 font-serif italic">
                भाजपा नगरसेविका - वॉर्ड 26 | BJP Corporator - Ward 26
              </p>
              <p className="text-lg text-white/60 mb-8">
                कल्याण डोंबिवली महानगरपालिका (KDMC)
              </p>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
                वॉर्ड 26 च्या रहिवाशांच्या सेवेसाठी समर्पित. तुमचा आवाज महत्त्वाचा आहे - तक्रारी नोंदवा, समस्या सांगा आणि एकत्र मिळून एक चांगला समुदाय बनवूया.
                <br />
                <span className="text-white/50 text-base">
                  Dedicated to serving Ward 26 residents. Your voice matters - lodge complaints, share concerns, and build a better community together.
                </span>
              </p>

              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link
                    href="/complaints/new"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-[#FF6B00]/30 transition-all animate-pulse-glow"
                  >
                    तक्रार नोंदवा | Lodge Complaint
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-[#FF6B00]/30 transition-all animate-pulse-glow"
                  >
                    सुरू करा | Get Started
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/5 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  संपर्क | Contact
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="absolute inset-0 scale-125">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-radial from-[#FF9933]/40 via-[#FF9933]/20 to-transparent rounded-full blur-[100px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-radial from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent rounded-full blur-[80px]" />
                  <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-gradient-radial from-[#138808]/30 via-[#138808]/10 to-transparent rounded-full blur-[90px]" />
                </div>
                
                <div className="absolute -inset-8 bg-gradient-to-br from-[#FF6B00]/20 via-[#D4AF37]/15 to-[#138808]/20 rounded-full blur-[120px]" />
                
                <div className="relative z-10">
                  <div className="relative mx-auto w-[480px] h-[620px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A] z-10 pointer-events-none" />
                    
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/f7cd043f-2f0b-4500-a548-677ae12f25de/_77A2838_new-resized-1768839941182.webp?width=8000&height=8000&resize=contain"
                      alt="Mrs. Aasawari Kedar Navare - BJP Corporator Ward 26"
                      fill
                      className="object-contain object-bottom drop-shadow-2xl"
                      style={{
                        filter: "contrast(1.05) saturate(1.1) brightness(1.02)",
                      }}
                      priority
                      unoptimized
                    />
                    
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[90%] z-20">
                      <div className="bg-gradient-to-r from-[#FF9933] via-[#D4AF37] to-[#138808] p-[2px] rounded-2xl shadow-2xl shadow-[#D4AF37]/50">
                        <div className="bg-gradient-to-b from-[#1A1A1A]/95 to-[#0A0A0A] backdrop-blur-sm rounded-2xl px-8 py-5 text-center">
                          <p className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-2">भाजपा नगरसेविका | BJP Corporator</p>
                          <h3 className="text-white font-bold text-2xl tracking-wide">श्रीमती आसावरी केदार नवरे</h3>
                          <p className="text-white/70 text-base font-medium mt-1">वॉर्ड 26 • KDMC</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <BJPLogo size="lg" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              आमचे <span className="text-gradient-saffron">नेतृत्व</span> | Our Leadership
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              राष्ट्र निर्माणासाठी समर्पित दूरदर्शी नेते | Visionary leaders committed to nation building
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <LeaderCard {...LEADERS.modi} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LeaderCard {...LEADERS.fadnavis} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <LeaderCard {...LEADERS.chavan} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="text-gradient-saffron">वॉर्ड 26</span> क्षेत्र | Areas
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              या परिसरातील सत्यापित रहिवाशांसाठी विशेष प्रवेश | Exclusive access for verified residents
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {AREAS.map((area, index) => (
              <motion.div
                key={area.en}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-[#D4AF37]/10 border border-[#FF6B00]/30 text-white hover:border-[#FF6B00] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  {area.hi} | {area.en}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="text-gradient-gold">जनसेवक</span> का निवडा? | Why Choose?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              वॉर्ड 26 रहिवाशांसाठी सुरक्षित, कार्यक्षम प्लॅटफॉर्म | Secure, efficient platform for Ward 26 residents
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 hover:border-[#FF6B00]/50 transition-all hover:shadow-xl hover:shadow-[#FF6B00]/10"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#138808]" />
            <div className="absolute inset-0 opacity-10 bg-white/5" />
            
              <div className="relative z-10 p-8 sm:p-12 text-center">
                <div className="mb-6">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/f7cd043f-2f0b-4500-a548-677ae12f25de/BJP-logo-resized-1768839563341.webp?width=8000&height=8000&resize=contain"
                    alt="BJP Logo"
                    width={120}
                    height={120}
                    className="mx-auto"
                    unoptimized
                  />
                </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                वॉर्ड 26 नागरिक नेटवर्क सामील व्हा
                <br />
                <span className="text-xl">Join Ward 26 Citizens Network</span>
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                आमच्या वाढत्या समुदायाचा भाग व्हा. आत्ताच नोंदणी करा आणि वॉर्ड 26 ला राहण्यासाठी एक चांगली जागा बनवण्यात मदत करा.
                <br />
                <span className="text-white/70 text-base">Register now and help make Ward 26 a better place to live.</span>
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#FF6B00] rounded-full font-semibold text-lg hover:shadow-xl transition-all"
              >
                वॉर्ड 26 रहिवासी म्हणून नोंदणी करा | Register
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BJPLogo size="sm" />
                <div>
                  <span className="text-[#FF6B00] font-bold text-lg">जनसेवक</span>
                  <span className="text-white/60 text-xs ml-1">Jansevak</span>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                भाजपा नगरसेविका श्रीमती आसावरी केदार नवरे यांचे वॉर्ड 26 नागरिकांसाठी अधिकृत ॲप.
                <br />
                <span className="text-white/40">Official app of BJP Corporator for Ward 26 citizens.</span>
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">द्रुत दुवे | Quick Links</h4>
              <ul className="space-y-2 text-white/60">
                <li>
                  <Link href="/register" className="hover:text-[#FF6B00] transition-colors">
                    नोंदणी | Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#FF6B00] transition-colors">
                    लॉगिन | Login
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#FF6B00] transition-colors">
                    संपर्क | Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">वॉर्ड 26 क्षेत्र | Areas</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                {AREAS.map((area) => (
                  <li key={area.en}>{area.hi} | {area.en}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">संपर्क | Contact</h4>
              <p className="text-white/60 text-sm">
                KDMC वॉर्ड 26 कार्यालय
                <br />
                डोंबिवली, महाराष्ट्र
                <br />
                भारत | India
              </p>
            </div>
          </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/f7cd043f-2f0b-4500-a548-677ae12f25de/BJP-logo-resized-1768839563341.webp?width=8000&height=8000&resize=contain"
                  alt="BJP Logo"
                  width={60}
                  height={60}
                  className="opacity-70"
                  unoptimized
                />
                <p className="text-white/40 text-sm">&copy; 2025 जनसेवक | Jansevak. सर्व हक्क राखीव.</p>
              </div>
            <p className="text-white/40 text-sm">वॉर्ड 26 रहिवाशांसाठी समर्पणाने बनवलेले | Made with dedication</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
