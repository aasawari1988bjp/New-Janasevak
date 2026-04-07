import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get single department
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: department, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      department
    });
  } catch (error) {
    console.error('Department fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PUT - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, code, description, whatsapp_numbers, sms_numbers, email_addresses, is_active } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (whatsapp_numbers !== undefined) updateData.whatsapp_numbers = whatsapp_numbers;
    if (sms_numbers !== undefined) updateData.sms_numbers = sms_numbers;
    if (email_addresses !== undefined) updateData.email_addresses = email_addresses;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update department error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update department' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Department update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Delete department error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete department' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Department deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
