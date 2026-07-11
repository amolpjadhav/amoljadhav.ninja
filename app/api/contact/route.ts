import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Database } from '@/types/database';

type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save to database
    // @ts-ignore - Supabase type inference issue with insert
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({ name, email, message })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send email notification using Resend
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({...});

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! I\'ll get back to you soon.' 
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
