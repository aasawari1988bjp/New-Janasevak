"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Upload, 
  Database, 
  Users, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  BarChart3,
  AlertCircle,
  Building2,
  Settings
} from "lucide-react";
import { BJPLogo } from "@/components/BJPLogo";

interface VoterStats {
  totalVoters: number;
  gender: {
    male: number;
    female: number;
    other: number;
  };
  ageDistribution: {
    "18-25": number;
    "26-35": number;
    "36-50": number;
    "51-65": number;
    "65+": number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [stats, setStats] = useState<VoterStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    fetchVoterStats();
  }, []);

  const fetchVoterStats = async () => {
    try {
      const res = await fetch("/api/admin/voter-stats");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Uploading PDF...");
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress("Processing PDF and extracting voter data...");
      
      const res = await fetch("/api/admin/upload-voter-list", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadProgress("Upload completed successfully!");
        setUploadResult(data);
        toast.success(`Successfully processed ${data.stats.inserted} voters!`);
        
        // Refresh stats
        await fetchVoterStats();
      } else {
        toast.error(data.error || "Upload failed");
        setUploadResult({ error: data.error, rawTextPreview: data.rawTextPreview });
      }
    } catch (error) {
      toast.error("Failed to upload voter list");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <BJPLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/60">Ward 26 Management</p>
            </div>
          </div>
          
          <Link
            href="/admin/departments"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            <Building2 className="w-5 h-5" />
            Manage Departments
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/departments"
            className="glass-morphism rounded-2xl p-6 hover:border-[#FF6B00]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Departments</p>
                <p className="text-white/60 text-sm">Manage officer contacts</p>
              </div>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="glass-morphism rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Analytics & Reports</p>
                <p className="text-white/60 text-sm">Performance insights</p>
              </div>
            </div>
          </Link>
          
          <div className="glass-morphism rounded-2xl p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Staff Portal</p>
                <p className="text-white/60 text-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Voters</p>
                {loadingStats ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats?.totalVoters.toLocaleString() || 0}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Male Voters</p>
                {loadingStats ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats?.gender.male.toLocaleString() || 0}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Female Voters</p>
                {loadingStats ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats?.gender.female.toLocaleString() || 0}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-[#FF6B00]" />
            <h2 className="text-2xl font-bold text-white">Upload Voter List</h2>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-400">
                <p className="font-semibold mb-1">Supported Format:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-300">
                  <li>PDF files containing voter list data</li>
                  <li>System can handle large files with 60,000+ voters</li>
                  <li>Supports both English and Hindi text</li>
                  <li>Required fields: EPIC Number, Voter Name (Age, Gender optional)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-[#FF6B00]/50 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className={`cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#D4AF37] flex items-center justify-center mb-4">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <FileText className="w-8 h-8 text-white" />
                )}
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                {isUploading ? "Processing..." : "Click to upload voter list PDF"}
              </p>
              <p className="text-white/60 text-sm">
                {isUploading ? uploadProgress : "Supports large PDFs with 60,000+ entries"}
              </p>
            </label>
          </div>

          {uploadResult && (
            <div className="mt-6">
              {uploadResult.error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold mb-2">{uploadResult.error}</p>
                      {uploadResult.rawTextPreview && (
                        <details className="text-xs text-red-300">
                          <summary className="cursor-pointer hover:underline">View extracted text preview</summary>
                          <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">{uploadResult.rawTextPreview}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-400 font-semibold text-lg mb-2">{uploadResult.message}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div className="p-3 rounded-lg bg-white/5">
                          <p className="text-white/60 text-xs">PDF Pages</p>
                          <p className="text-white text-xl font-bold">{uploadResult.stats.pdfPages}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <p className="text-white/60 text-xs">Extracted</p>
                          <p className="text-white text-xl font-bold">{uploadResult.stats.totalExtracted}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/20">
                          <p className="text-white/60 text-xs">Inserted</p>
                          <p className="text-green-400 text-xl font-bold">{uploadResult.stats.inserted}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <p className="text-white/60 text-xs">Skipped</p>
                          <p className="text-white text-xl font-bold">{uploadResult.stats.skipped}</p>
                        </div>
                      </div>

                      {uploadResult.sampleEntries && uploadResult.sampleEntries.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-white/60 hover:text-white text-sm">
                            View sample entries ({uploadResult.sampleEntries.length})
                          </summary>
                          <div className="mt-2 space-y-2">
                            {uploadResult.sampleEntries.map((entry: any, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-white/5 text-xs text-white/70">
                                <span className="font-semibold">{entry.epic_number}</span> - {entry.voter_name}
                                {entry.age && <span className="ml-2">({entry.age}y)</span>}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-orange-400 hover:text-orange-300 text-sm">
                            View errors ({uploadResult.errors.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {uploadResult.errors.map((error: string, idx: number) => (
                              <p key={idx} className="text-xs text-orange-300">{error}</p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Age Distribution */}
        {stats && stats.totalVoters > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white">Age Distribution</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.ageDistribution).map(([range, count]) => {
                const percentage = stats.totalVoters > 0 ? (count / stats.totalVoters) * 100 : 0;
                return (
                  <div key={range}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{range} years</span>
                      <span className="text-white/60">{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
