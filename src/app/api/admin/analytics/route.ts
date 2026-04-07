import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    // 1. Get all complaints in date range
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaint_dashboard')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (complaintsError) {
      throw complaintsError;
    }

    // 2. Category-wise analysis (Max/Min complaints)
    const categoryCount: { [key: string]: number } = {};
    const departmentCount: { [key: string]: number } = {};
    const priorityCount: { [key: string]: number } = {};
    const statusCount: { [key: string]: number } = {};
    
    complaints?.forEach((complaint) => {
      // Category
      const category = complaint.category || 'Others';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      // Department
      const dept = complaint.ai_department || 'others';
      departmentCount[dept] = (departmentCount[dept] || 0) + 1;
      
      // Priority
      const priority = complaint.ai_priority || 'normal';
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      
      // Status
      const status = complaint.status || 'pending';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Sort categories
    const sortedCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));

    const maxComplaints = sortedCategories[0] || { category: 'None', count: 0 };
    const minComplaints = sortedCategories[sortedCategories.length - 1] || { category: 'None', count: 0 };

    // 3. Area-wise hotspot analysis
    const areaHotspots: { [key: string]: { count: number; complaints: any[] } } = {};
    
    complaints?.forEach((complaint) => {
      const area = complaint.location || 'Unknown Area';
      if (!areaHotspots[area]) {
        areaHotspots[area] = { count: 0, complaints: [] };
      }
      areaHotspots[area].count++;
      areaHotspots[area].complaints.push({
        id: complaint.id,
        title: complaint.title,
        category: complaint.category,
        ai_department: complaint.ai_department,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        created_at: complaint.created_at
      });
    });

    const sortedHotspots = Object.entries(areaHotspots)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([area, data]) => ({
        area,
        count: data.count,
        complaints: data.complaints
      }));

    // 4. Department-wise issue breakdown
    const departmentIssues: { [key: string]: { [key: string]: number } } = {};
    
    complaints?.forEach((complaint) => {
      const dept = complaint.ai_department || 'others';
      const category = complaint.category || 'Others';
      
      if (!departmentIssues[dept]) {
        departmentIssues[dept] = {};
      }
      departmentIssues[dept][category] = (departmentIssues[dept][category] || 0) + 1;
    });

    // 5. Officer performance analysis
    const { data: staffPerformance, error: staffError } = await supabase
      .from('complaint_dashboard')
      .select('assigned_to, assigned_staff_name, status, resolved_at, created_at, assigned_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('assigned_to', 'is', null);

    const officerMetrics: { [key: string]: any } = {};
    
    staffPerformance?.forEach((complaint) => {
      const officerId = complaint.assigned_to;
      const officerName = complaint.assigned_staff_name || 'Unknown Officer';
      
      if (!officerMetrics[officerId]) {
        officerMetrics[officerId] = {
          name: officerName,
          totalAssigned: 0,
          resolved: 0,
          pending: 0,
          totalResolutionTime: 0,
          resolvedCount: 0
        };
      }
      
      officerMetrics[officerId].totalAssigned++;
      
      if (complaint.status === 'resolved' && complaint.resolved_at) {
        officerMetrics[officerId].resolved++;
        officerMetrics[officerId].resolvedCount++;
        
        // Calculate resolution time in hours
        const assignedTime = new Date(complaint.assigned_at || complaint.created_at).getTime();
        const resolvedTime = new Date(complaint.resolved_at).getTime();
        const resolutionHours = (resolvedTime - assignedTime) / (1000 * 60 * 60);
        
        officerMetrics[officerId].totalResolutionTime += resolutionHours;
      } else {
        officerMetrics[officerId].pending++;
      }
    });

    // Calculate performance scores
    const officerPerformance = Object.entries(officerMetrics).map(([id, metrics]: [string, any]) => {
      const resolutionRate = metrics.totalAssigned > 0 
        ? (metrics.resolved / metrics.totalAssigned) * 100 
        : 0;
      
      const avgResolutionTime = metrics.resolvedCount > 0
        ? metrics.totalResolutionTime / metrics.resolvedCount
        : 0;
      
      // Performance score (0-100)
      // 60% weight on resolution rate, 40% on speed (inverse of avg time)
      const speedScore = avgResolutionTime > 0 
        ? Math.max(0, 100 - (avgResolutionTime / 24) * 20) // Penalty for days taken
        : 0;
      
      const performanceScore = (resolutionRate * 0.6) + (speedScore * 0.4);
      
      return {
        id,
        name: metrics.name,
        totalAssigned: metrics.totalAssigned,
        resolved: metrics.resolved,
        pending: metrics.pending,
        resolutionRate: resolutionRate.toFixed(1),
        avgResolutionHours: avgResolutionTime.toFixed(1),
        performanceScore: performanceScore.toFixed(1),
        rating: performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Good' : performanceScore >= 40 ? 'Average' : 'Needs Improvement'
      };
    }).sort((a, b) => parseFloat(b.performanceScore) - parseFloat(a.performanceScore));

    // 6. Political insights
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, voter_verified, complaint_count, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalUsers = users?.length || 0;
    const verifiedVoters = users?.filter(u => u.voter_verified).length || 0;
    const activeUsers = users?.filter(u => (u.complaint_count || 0) > 0).length || 0;

    // 7. Time-based trends
    const monthlyTrends: { [key: string]: number } = {};
    
    complaints?.forEach((complaint) => {
      const month = new Date(complaint.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
    });

    // 8. Response time analysis
    const avgResponseTime = complaints?.reduce((acc, c) => {
      if (c.assigned_at) {
        const created = new Date(c.created_at).getTime();
        const assigned = new Date(c.assigned_at).getTime();
        return acc + ((assigned - created) / (1000 * 60 * 60)); // hours
      }
      return acc;
    }, 0) / (complaints?.filter(c => c.assigned_at).length || 1);

    const avgResolutionTime = complaints?.reduce((acc, c) => {
      if (c.resolved_at) {
        const created = new Date(c.created_at).getTime();
        const resolved = new Date(c.resolved_at).getTime();
        return acc + ((resolved - created) / (1000 * 60 * 60)); // hours
      }
      return acc;
    }, 0) / (complaints?.filter(c => c.resolved_at).length || 1);

    // Compile report
    const report = {
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalComplaints: complaints?.length || 0,
        resolved: statusCount['resolved'] || 0,
        pending: (statusCount['pending'] || 0) + (statusCount['in_progress'] || 0),
        resolutionRate: complaints?.length > 0 
          ? ((statusCount['resolved'] || 0) / complaints.length * 100).toFixed(1)
          : '0',
        avgResponseTimeHours: avgResponseTime.toFixed(1),
        avgResolutionTimeHours: avgResolutionTime.toFixed(1)
      },
      categoryAnalysis: {
        maxComplaints,
        minComplaints,
        allCategories: sortedCategories,
        byDepartment: Object.entries(departmentCount)
          .sort(([, a], [, b]) => b - a)
          .map(([dept, count]) => ({ department: dept, count }))
      },
      hotspots: sortedHotspots,
      departmentIssues: Object.entries(departmentIssues).map(([dept, issues]) => ({
        department: dept,
        totalComplaints: Object.values(issues).reduce((a: number, b: number) => a + b, 0),
        issueBreakdown: Object.entries(issues)
          .sort(([, a], [, b]) => b - a)
          .map(([category, count]) => ({ category, count }))
      })),
      officerPerformance: {
        topPerformers: officerPerformance.slice(0, 5),
        needsImprovement: officerPerformance.slice(-3).reverse(),
        all: officerPerformance
      },
      politicalInsights: {
        totalCitizens: totalUsers,
        verifiedVoters,
        verificationRate: totalUsers > 0 ? (verifiedVoters / totalUsers * 100).toFixed(1) : '0',
        activeUsers,
        engagementRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : '0',
        avgComplaintsPerUser: totalUsers > 0 ? ((complaints?.length || 0) / totalUsers).toFixed(1) : '0'
      },
      trends: {
        monthly: Object.entries(monthlyTrends)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
        priority: Object.entries(priorityCount).map(([priority, count]) => ({ priority, count })),
        status: Object.entries(statusCount).map(([status, count]) => ({ status, count }))
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
