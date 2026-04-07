import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isInWard26 } from '@/lib/geofence';
import { categorizeComplaint } from '@/lib/ai-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CORPORATOR_WHATSAPP = '919152233535';

/**
 * Multi-Channel Notification Service
 * Sends notifications via WhatsApp, SMS, and Email
 */
async function sendMultiChannelNotifications(
  complaint: any,
  department: any,
  aiAnalysis: any
) {
  const notifications = [];
  
  const message = formatNotificationMessage(complaint, aiAnalysis);
  
  // 1. Send to Department Officers (WhatsApp)
  if (department.whatsapp_numbers && department.whatsapp_numbers.length > 0) {
    for (const whatsappNumber of department.whatsapp_numbers) {
      notifications.push({
        complaint_id: complaint.id,
        recipient_type: 'department',
        recipient_id: whatsappNumber,
        recipient_name: department.name,
        message: message,
        channel: 'whatsapp',
        status: 'pending'
      });
      
      // Queue WhatsApp message
      await sendWhatsAppMessage(whatsappNumber, message, complaint.id);
    }
  }
  
  // 2. Send to Department Officers (SMS)
  if (department.sms_numbers && department.sms_numbers.length > 0) {
    for (const smsNumber of department.sms_numbers) {
      notifications.push({
        complaint_id: complaint.id,
        recipient_type: 'department',
        recipient_id: smsNumber,
        recipient_name: department.name,
        message: formatSMSMessage(complaint, aiAnalysis),
        channel: 'sms',
        status: 'pending'
      });
      
      // Queue SMS
      await sendSMSMessage(smsNumber, formatSMSMessage(complaint, aiAnalysis), complaint.id);
    }
  }
  
  // 3. Send to Corporator (WhatsApp)
  notifications.push({
    complaint_id: complaint.id,
    recipient_type: 'corporator',
    recipient_id: CORPORATOR_WHATSAPP,
    recipient_name: 'Mrs. Aasawari Kedar Navare',
    message: message,
    channel: 'whatsapp',
    status: 'pending'
  });
  
  await sendWhatsAppMessage(CORPORATOR_WHATSAPP, message, complaint.id);
  
  // Log all notifications
  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications);
  }
  
  return notifications;
}

function formatNotificationMessage(complaint: any, aiAnalysis: any): string {
  const priorityEmoji = aiAnalysis.priority === 'urgent' ? '🚨🚨🚨' : aiAnalysis.priority === 'normal' ? '⚠️' : 'ℹ️';
  
  return `${priorityEmoji} *NEW COMPLAINT - WARD 26*

*Complaint ID:* ${complaint.id.slice(0, 8).toUpperCase()}
*Priority:* ${aiAnalysis.priority.toUpperCase()} ${aiAnalysis.priority === 'urgent' ? '⏰ URGENT ACTION REQUIRED' : ''}
*Department:* ${complaint.department_name}
*AI Confidence:* ${(aiAnalysis.confidence * 100).toFixed(0)}%

👤 *CITIZEN DETAILS*
━━━━━━━━━━━━━━━━━━━━
Name: ${complaint.citizen_name}
Phone: ${complaint.citizen_phone}
${complaint.citizen_epic ? `EPIC: ${complaint.citizen_epic}` : ''}

📍 *LOCATION*
━━━━━━━━━━━━━━━━━━━━
Address: ${complaint.location}
GPS: https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}

📋 *COMPLAINT DETAILS*
━━━━━━━━━━━━━━━━━━━━
Category: ${complaint.category}
Title: ${complaint.title}

Description:
${complaint.description}
${complaint.image_url ? `\n📷 *Photo:* ${complaint.image_url}` : ''}

🤖 *AI ANALYSIS*
━━━━━━━━━━━━━━━━━━━━
Sentiment: ${aiAnalysis.sentiment}
Reasoning: ${aiAnalysis.reasoning}

━━━━━━━━━━━━━━━━━━━━
_Submitted: ${new Date(complaint.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}_
_Via Ward 26 Connect App_`;
}

function formatSMSMessage(complaint: any, aiAnalysis: any): string {
  return `[Ward 26] ${aiAnalysis.priority.toUpperCase()}: ${complaint.title} at ${complaint.location}. Dept: ${complaint.department_name}. ID: ${complaint.id.slice(0, 8)}. Citizen: ${complaint.citizen_name}`;
}

async function sendWhatsAppMessage(phoneNumber: string, message: string, complaintId: string) {
  try {
    // Try WhatsApp Business API first
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappApiUrl && whatsappApiToken && whatsappPhoneNumberId) {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'text',
            text: {
              body: message,
              preview_url: true,
            },
          }),
        }
      );

      if (response.ok) {
        console.log(`WhatsApp sent to ${phoneNumber}`);
        return { success: true, method: 'api' };
      }
    }

    // Fallback: Queue for later delivery
    await supabase.from('whatsapp_queue').insert({
      phone_number: phoneNumber,
      message: message,
      complaint_id: complaintId,
      status: 'pending'
    });

    console.log(`WhatsApp queued for ${phoneNumber}`);
    return { success: true, method: 'queued' };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error };
  }
}

async function sendSMSMessage(phoneNumber: string, message: string, complaintId: string) {
  try {
    // Twilio SMS
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: twilioPhoneNumber,
            Body: message
          })
        }
      );

      if (response.ok) {
        console.log(`SMS sent to ${phoneNumber}`);
        return { success: true };
      }
    }

    console.log(`SMS API not configured, message not sent to ${phoneNumber}`);
    return { success: false, error: 'SMS API not configured' };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error };
  }
}

// GET - List complaints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('complaint_dashboard')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (department) {
      query = query.eq('ai_department', department);
    }

    if (priority) {
      query = query.eq('ai_priority', priority);
    }

    const { data: complaints, error } = await query;

    if (error) {
      console.error('Fetch complaints error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch complaints' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error('Complaints fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST - Submit new complaint with AI categorization
export async function POST(request: NextRequest) {
  try {
    const { user_id, category, title, description, location, latitude, longitude, image_url } =
      await request.json();

    if (!user_id || !category || !title || !description || !location || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 1. Verify location is within Ward 26
    if (!isInWard26(latitude, longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Complaint location is outside Ward 26 boundary. Only complaints within Ward 26 can be submitted.',
        },
        { status: 403 }
      );
    }

    // 2. Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name, phone, epic_number')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. AI Categorization
    console.log('Starting AI categorization...');
    const aiAnalysis = await categorizeComplaint(title, description, category);
    console.log('AI Analysis:', aiAnalysis);

    // 4. Get department details
    const { data: department } = await supabase
      .from('departments')
      .select('*')
      .eq('code', aiAnalysis.department)
      .single();

    // 5. Create complaint
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        user_id,
        category,
        title,
        description,
        location,
        latitude,
        longitude,
        image_url: image_url || null,
        status: 'pending',
        priority: 'medium',
        // AI fields
        ai_department: aiAnalysis.department,
        ai_priority: aiAnalysis.priority,
        ai_sentiment: aiAnalysis.sentiment,
        ai_confidence: aiAnalysis.confidence,
      })
      .select()
      .single();

    if (error) {
      console.error('Create complaint error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit complaint' },
        { status: 500 }
      );
    }

    // 6. Add initial update with AI analysis
    await supabase.from('complaint_updates').insert({
      complaint_id: complaint.id,
      updated_by_role: 'system',
      status: 'pending',
      message: `Complaint received and analyzed by AI.\n\nAI Analysis: ${aiAnalysis.reasoning}\n\nSuggested Response: ${aiAnalysis.suggestedResponse}`,
      is_public: true
    });

    // 7. Send multi-channel notifications
    const complaintWithDetails = {
      ...complaint,
      citizen_name: user.full_name,
      citizen_phone: user.phone,
      citizen_epic: user.epic_number,
      department_name: department?.name || 'Others'
    };

    if (department) {
      sendMultiChannelNotifications(complaintWithDetails, department, aiAnalysis)
        .catch(err => console.error('Notification error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint,
      aiAnalysis: {
        department: aiAnalysis.department,
        priority: aiAnalysis.priority,
        confidence: aiAnalysis.confidence,
        suggestedResponse: aiAnalysis.suggestedResponse
      }
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}
