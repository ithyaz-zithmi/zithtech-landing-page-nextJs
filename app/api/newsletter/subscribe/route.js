import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { emailAddress, userAgent, ipAddress } = body;

    // Validate email address
    if (!emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
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

    // Insert new submission into contact_submissions table
    const insertQuery = `
      INSERT INTO contact_submissions (company_name, company_email, subject, is_partial, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    
    const result = await client.query(insertQuery, [
      'Newsletter Subscriber',
      emailAddress,
      'Newsletter Subscription',
      false,
      defaultStatus
    ]);

    console.log('Newsletter subscription saved to contact_submissions:', emailAddress, 'ID:', result.rows[0].id);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT company_email as email_address, subject, status, created_at
      FROM contact_submissions
      WHERE subject = 'Newsletter Subscription'
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const result = await client.query(query);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter subscriptions' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
