import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - List all departments
export async function GET(request: NextRequest) {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Fetch departments error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('Departments fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(request: NextRequest) {
  try {
    const { name, code, description, whatsapp_numbers, sms_numbers, email_addresses } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if department code already exists
    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .eq('code', code)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Department code already exists' },
        { status: 400 }
      );
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        name,
        code,
        description: description || null,
        whatsapp_numbers: whatsapp_numbers || [],
        sms_numbers: sms_numbers || [],
        email_addresses: email_addresses || [],
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Create department error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create department' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Department creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// PUT - Update department (handled by [id]/route.ts)
// DELETE - Delete department (handled by [id]/route.ts)
