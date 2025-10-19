import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, name, company, leadMagnetType } = await request.json();

    // Mailchimp API configuration
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1'
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
      console.error('Mailchimp environment variables not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Add subscriber to Mailchimp
    const mailchimpResponse = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: name.split(' ')[0] || name,
            LNAME: name.split(' ').slice(1).join(' ') || '',
            COMPANY: company || '',
          },
          tags: [
            leadMagnetType === 'spreadsheets' 
              ? 'Lead Magnet - Spreadsheets'
              : 'Lead Magnet - AI Guide'
          ],
        }),
      }
    );

    const data = await mailchimpResponse.json();

    // Handle existing subscriber
    if (mailchimpResponse.status === 400 && data.title === 'Member Exists') {
      // Update tags for existing member
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      await fetch(
        `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
          },
          body: JSON.stringify({
            tags: [
              {
                name: leadMagnetType === 'spreadsheets' 
                  ? 'Lead Magnet - Spreadsheets'
                  : 'Lead Magnet - AI Guide',
                status: 'active'
              }
            ],
          }),
        }
      );

      return NextResponse.json({ success: true, message: 'Updated existing subscriber' });
    }

    if (!mailchimpResponse.ok) {
      console.error('Mailchimp API error:', data);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: mailchimpResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}