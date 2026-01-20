"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flower2, Phone, Mail, MapPin, ArrowLeft, Clock, Building } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF6B00]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#138808]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center mb-6">
              <Flower2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Contact <span className="text-gradient-saffron">Ward 26</span> Office
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Get in touch with your elected representative Mrs. Aasawari Kedar Navare and the Ward 26 office
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-morphism rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FF6B00]" />
                Corporator Office
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF6B00] mt-1 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Office Address</p>
                    <p className="text-white/60 text-sm">
                      Ward 26 Office, KDMC Building<br />
                      Ayare Road, Dombivli (East)<br />
                      Maharashtra - 421201
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FF6B00] mt-1 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Office Hours</p>
                    <p className="text-white/60 text-sm">
                      Monday - Saturday: 10:00 AM - 6:00 PM<br />
                      Sunday: By Appointment Only
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-morphism rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FF6B00]" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#FF6B00] mt-1 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-white/60 text-sm">
                      +91 XXXXX XXXXX (Office)<br />
                      +91 XXXXX XXXXX (Helpline)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#FF6B00] mt-1 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-white/60 text-sm">
                      ward26.kdmc@gmail.com<br />
                      corporator.ward26@kdmc.gov.in
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-morphism rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 text-center">About Your Corporator</h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center shrink-0">
                <span className="text-4xl font-bold text-white">AKN</span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-1">Mrs. Aasawari Kedar Navare</h3>
                <p className="text-[#FF6B00] font-medium mb-3">BJP Corporator - Ward 26, KDMC</p>
                <p className="text-white/70 leading-relaxed">
                  Dedicated to serving the residents of Ward 26 including Ayare Road, Rajaji Path, 
                  Ram Nagar, Shiv Market, and Savarkar Road areas. Committed to improving 
                  infrastructure, civic amenities, and quality of life for all Ward 26 citizens.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#138808] text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">Need Immediate Assistance?</h3>
            <p className="text-white/90 mb-4">
              Register on Ward 26 Connect and lodge your complaint for faster resolution
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#FF6B00] rounded-full font-semibold hover:shadow-xl transition-all"
            >
              Register Now
            </Link>
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm">
              Ward 26 covers: Ayare Road, Rajaji Path, Ram Nagar, Shiv Market, Savarkar Road
            </p>
            <p className="text-white/40 text-sm mt-1">
              Total Population: 48,502 | SC: 1,841 | ST: 185
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
