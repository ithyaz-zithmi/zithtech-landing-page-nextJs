import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { emailAddress, clickSource, userAgent, ipAddress } = body;

    // Validate email address
    if (!emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Insert email click tracking
    const insertQuery = `
      INSERT INTO email_clicks (email_address, click_source, user_agent, ip_address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;
    
    const result = await client.query(insertQuery, [
      emailAddress,
      clickSource || 'footer',
      userAgent || null,
      ipAddress || null
    ]);

    console.log('Email click tracked:', emailAddress, 'ID:', result.rows[0].id);

    return NextResponse.json({
      success: true,
      message: 'Email click tracked successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Email click tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track email click' },
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
      SELECT email_address, click_source, user_agent, ip_address, created_at
      FROM email_clicks
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
    console.error('Error fetching email clicks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email clicks' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
