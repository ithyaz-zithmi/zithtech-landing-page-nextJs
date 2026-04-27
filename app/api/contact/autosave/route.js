import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { companyName, phoneNumber, companyEmail, industry, subject, sessionId } = body;

    console.log('Auto-save request data:', { companyName, phoneNumber, companyEmail, industry, subject, sessionId });

    // Validate session ID
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate at least email or phone number is provided
    if (!companyEmail && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'At least email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (9-15 digits if provided, allowing +, -, spaces, parentheses)
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      console.log('Original phone:', phoneNumber, 'Clean phone:', cleanPhone, 'Length:', cleanPhone.length);
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        return NextResponse.json(
          { success: false, error: `Phone number must be between 9 and 15 digits (got ${cleanPhone.length})` },
          { status: 400 }
        );
      }
    }

    // Validate email format (contains @ if provided)
    if (companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Fetch default status from status_configs
    let defaultStatus = null;
    try {
      const statusQuery = `SELECT name FROM status_configs WHERE is_default = TRUE LIMIT 1`;
      const statusResult = await client.query(statusQuery);
      if (statusResult.rows.length > 0) {
        defaultStatus = statusResult.rows[0].name;
      }
    } catch (statusError) {
      console.error('Error fetching default status:', statusError);
    }

    // Upsert query - update existing partial submission or create new one
    const upsertQuery = `
      INSERT INTO contact_submissions (company_name, phone_number, company_email, industry, subject, is_partial, session_id, status)
      VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7)
      ON CONFLICT (session_id) WHERE is_partial = TRUE
      DO UPDATE SET 
        company_name = EXCLUDED.company_name,
        phone_number = EXCLUDED.phone_number,
        company_email = EXCLUDED.company_email,
        industry = EXCLUDED.industry,
        subject = EXCLUDED.subject,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, created_at, updated_at
    `;
    
    const result = await client.query(upsertQuery, [
      companyName || null,
      phoneNumber || null,
      companyEmail || null,
      industry || null,
      subject || null,
      sessionId,
      defaultStatus
    ]);

    return NextResponse.json({
      success: true,
      message: 'Form data auto-saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-save form data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  
  try {
    const query = `
      SELECT company_name, phone_number, company_email, industry, subject, is_partial, status
      FROM contact_submissions
      WHERE session_id = $1 AND is_partial = TRUE
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    const result = await client.query(query, [sessionId]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching auto-saved data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auto-saved data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
