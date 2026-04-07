"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  MapPin,
  Users,
  Award,
  AlertTriangle,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  Target,
  Star,
  ThumbsDown
} from "lucide-react";
import { BJPLogo } from "@/components/BJPLogo";

interface AnalyticsReport {
  period: { start: string; end: string };
  summary: any;
  categoryAnalysis: any;
  hotspots: any[];
  departmentIssues: any[];
  officerPerformance: any;
  politicalInsights: any;
  trends: any;
}

export default function CorporatorAnalyticsPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    months: 6 // Default to 6 months
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - dateRange.months);
      
      const res = await fetch(
        `/api/admin/analytics?start_date=${startDate.toISOString()}&end_date=${new Date().toISOString()}`
      );
      const data = await res.json();

      if (data.success) {
        setReport(data.report);
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Analytics error:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ward26-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <BJPLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">Corporator Analytics</h1>
              <p className="text-white/60">Data-Driven Insights for Ward 26</p>
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={dateRange.months}
              onChange={(e) => setDateRange({ months: parseInt(e.target.value) })}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value={1}>Last Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last Year</option>
            </select>

            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Complaints</p>
                <p className="text-3xl font-bold text-white">{report.summary.totalComplaints}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Resolution Rate</p>
                <p className="text-3xl font-bold text-green-400">{report.summary.resolutionRate}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-purple-400">{report.summary.avgResolutionTimeHours}h</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Active Citizens</p>
                <p className="text-3xl font-bold text-orange-400">{report.politicalInsights.activeUsers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Max vs Min Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white">Complaint Categories</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 font-semibold">Maximum Complaints</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{report.categoryAnalysis.maxComplaints.category}</p>
                <p className="text-red-300">{report.categoryAnalysis.maxComplaints.count} complaints</p>
              </div>

              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-semibold">Minimum Complaints</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{report.categoryAnalysis.minComplaints.category}</p>
                <p className="text-green-300">{report.categoryAnalysis.minComplaints.count} complaints</p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm font-semibold">All Categories:</p>
                {report.categoryAnalysis.allCategories.slice(0, 5).map((cat: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-white">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6B00] to-[#D4AF37]"
                          style={{
                            width: `${(cat.count / report.categoryAnalysis.maxComplaints.count) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-white/60 text-sm w-12 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Hotspot Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white">Complaint Hotspots</h2>
            </div>

            <div className="space-y-4">
              {report.hotspots.slice(0, 8).map((hotspot: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">#{idx + 1}</span>
                        <p className="text-white font-medium">{hotspot.area}</p>
                      </div>
                      <p className="text-white/60 text-sm">{hotspot.count} complaints</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      idx === 0 ? 'bg-red-500/20 text-red-400' :
                      idx < 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {idx === 0 ? 'Critical' : idx < 3 ? 'High' : 'Medium'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Department Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-[#FF6B00]" />
            <h2 className="text-2xl font-bold text-white">Department-wise Issues</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.departmentIssues.map((dept: any, idx: number) => (
              <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1 capitalize">
                    {dept.department.replace('_', ' ')}
                  </h3>
                  <p className="text-2xl font-bold text-[#FF6B00]">{dept.totalComplaints}</p>
                  <p className="text-white/60 text-sm">total complaints</p>
                </div>

                <div className="space-y-2">
                  {dept.issueBreakdown.slice(0, 3).map((issue: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{issue.category}</span>
                      <span className="text-white font-semibold">{issue.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Officer Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Top Performing Officers</h2>
            </div>

            <div className="space-y-4">
              {report.officerPerformance.topPerformers.map((officer: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{officer.name}</p>
                        <p className="text-green-400 text-sm">{officer.rating}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">{officer.performanceScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-white/60">Assigned</p>
                      <p className="text-white font-semibold">{officer.totalAssigned}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Resolved</p>
                      <p className="text-green-400 font-semibold">{officer.resolved}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Rate</p>
                      <p className="text-white font-semibold">{officer.resolutionRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Needs Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <ThumbsDown className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Officers Needing Support</h2>
            </div>

            <div className="space-y-4">
              {report.officerPerformance.needsImprovement.map((officer: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{officer.name}</p>
                      <p className="text-red-400 text-sm">{officer.rating}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white/60 text-sm">Score: </span>
                      <span className="text-red-400 font-bold">{officer.performanceScore}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-white/60">Assigned</p>
                      <p className="text-white font-semibold">{officer.totalAssigned}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Pending</p>
                      <p className="text-red-400 font-semibold">{officer.pending}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Avg Time</p>
                      <p className="text-white font-semibold">{officer.avgResolutionHours}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Political Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-6 h-6 text-[#FF6B00]" />
            <h2 className="text-2xl font-bold text-white">Political Insights & Engagement</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-white/60 text-sm mb-2">Total Citizens</p>
              <p className="text-3xl font-bold text-white mb-1">{report.politicalInsights.totalCitizens}</p>
              <p className="text-white/40 text-xs">Registered users</p>
            </div>

            <div className="p-4 rounded-xl bg-green-500/10">
              <p className="text-green-400 text-sm mb-2">Verified Voters</p>
              <p className="text-3xl font-bold text-white mb-1">{report.politicalInsights.verifiedVoters}</p>
              <p className="text-green-300 text-xs">{report.politicalInsights.verificationRate}% verified</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10">
              <p className="text-blue-400 text-sm mb-2">Active Users</p>
              <p className="text-3xl font-bold text-white mb-1">{report.politicalInsights.activeUsers}</p>
              <p className="text-blue-300 text-xs">{report.politicalInsights.engagementRate}% engagement</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10">
              <p className="text-purple-400 text-sm mb-2">Avg Complaints/User</p>
              <p className="text-3xl font-bold text-white mb-1">{report.politicalInsights.avgComplaintsPerUser}</p>
              <p className="text-purple-300 text-xs">User activity</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30">
            <p className="text-[#FF6B00] font-semibold mb-2">📊 Campaign Insights:</p>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• {report.politicalInsights.verificationRate}% voter verification shows strong citizen trust</li>
              <li>• {report.politicalInsights.engagementRate}% active engagement demonstrates ward connectivity</li>
              <li>• {report.summary.resolutionRate}% resolution rate showcases effective governance</li>
              <li>• Average {report.summary.avgResolutionTimeHours}h response time demonstrates quick action</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
