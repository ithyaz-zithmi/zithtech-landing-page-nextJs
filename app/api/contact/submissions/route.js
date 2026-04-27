import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, company_name, phone_number, company_email, industry, subject, status, created_at, updated_at
      FROM contact_submissions
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST handler for contact submissions
import nodemailer from 'nodemailer';

// Create reusable transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { companyName, phoneNumber, companyEmail, industry, subject } = body;

    // Validate required fields
    if (!companyName || !phoneNumber || !companyEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
      // Continue without status if there's an error fetching it
    }

    // Insert into database first (mark as complete submission)
    const insertQuery = `
      INSERT INTO contact_submissions (company_name, phone_number, company_email, industry, subject, is_partial, status)
      VALUES ($1, $2, $3, $4, $5, FALSE, $6)
      RETURNING id, created_at
    `;
    
    const dbResult = await client.query(insertQuery, [
      companyName,
      phoneNumber,
      companyEmail,
      industry || null,
      subject || null,
      defaultStatus
    ]);

    console.log('Contact submission saved to database with ID:', dbResult.rows[0].id);

    // Delete any partial submissions for this session if sessionId is provided
    if (body.sessionId) {
      const deletePartialQuery = `
        DELETE FROM contact_submissions 
        WHERE session_id = $1 AND is_partial = TRUE
      `;
      await client.query(deletePartialQuery, [body.sessionId]);
    }

    // Get recipients from environment
    const recipients = process.env.CONTACT_EMAIL_TO;
    if (!recipients) {
      console.error('CONTACT_EMAIL_TO not configured');
      // Don't fail the request if email fails but database save succeeded
      console.warn('Email not sent, but data was saved to database');
      return NextResponse.json({ 
        success: true, 
        message: 'Contact form submitted successfully',
        dbId: dbResult.rows[0].id
      });
    }

    // Create email content
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> Let's Talk with Zithtech Form</p>
      <hr/>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Company Name</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${phoneNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Company Email</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${companyEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Industry</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${industry || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Subject/Message</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${subject || 'No message provided'}</td>
        </tr>
      </table>
      <hr/>
      <p style="color: #666; font-size: 12px;">
        This email was sent from the Zithtech website contact form.
      </p>
    `;

    const emailText = `
New Contact Form Submission
===========================

Company Name: ${companyName}
Phone Number: ${phoneNumber}
Company Email: ${companyEmail}
Industry: ${industry || 'Not specified'}
Subject/Message: ${subject || 'No message provided'}

---
This email was sent from the Zithtech website contact form.
    `;

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients,
      subject: `New Contact: ${companyName} - Let's Talk with Zithtech`,
      text: emailText,
      html: emailHtml,
      replyTo: companyEmail,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      dbId: dbResult.rows[0].id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process contact form' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
