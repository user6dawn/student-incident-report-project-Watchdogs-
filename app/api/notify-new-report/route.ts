import { NextRequest, NextResponse } from 'next/server'
import { BrevoClient } from '@getbrevo/brevo'

/**
 * POST /api/notify-new-report
 * Sends a transactional email via Brevo when a new incident report is submitted.
 * Triggered by the client after a successful report insert.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.BREVO_API_KEY
  const notifyEmail = process.env.NOTIFY_NEW_REPORT_EMAIL
  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'noreply@example.com'
  const senderName = process.env.BREVO_SENDER_NAME ?? 'Student Incident Reports'

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Brevo API key not configured (BREVO_API_KEY)' },
      { status: 500 }
    )
  }
  if (!notifyEmail) {
    return NextResponse.json(
      { error: 'Notification email not configured (NOTIFY_NEW_REPORT_EMAIL)' },
      { status: 500 }
    )
  }

  let body: {
    id?: string
    type: string
    date: string
    location: string
    description: string
    anonymous?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, date, location, description, anonymous, id } = body
  if (!type || !date || !location || !description) {
    return NextResponse.json(
      { error: 'Missing required fields: type, date, location, description' },
      { status: 400 }
    )
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Incident Report</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333;">
  <h2 style="color: #1e40af;">New incident report submitted</h2>
  <p>A new student incident report has been created${id ? ` (ID: ${id})` : ''}.</p>
  <table style="border-collapse: collapse; margin: 1rem 0;">
    <tr><td style="padding: 0.25rem 0.5rem 0; font-weight: bold;">Type</td><td style="padding: 0.25rem 0 0 0.5rem;">${escapeHtml(type)}</td></tr>
    <tr><td style="padding: 0.25rem 0.5rem 0; font-weight: bold;">Date</td><td style="padding: 0.25rem 0 0 0.5rem;">${escapeHtml(date)}</td></tr>
    <tr><td style="padding: 0.25rem 0.5rem 0; font-weight: bold;">Location</td><td style="padding: 0.25rem 0 0 0.5rem;">${escapeHtml(location)}</td></tr>
    <tr><td style="padding: 0.25rem 0.5rem 0; font-weight: bold;">Anonymous</td><td style="padding: 0.25rem 0 0 0.5rem;">${anonymous ? 'Yes' : 'No'}</td></tr>
  </table>
  <p><strong>Description:</strong></p>
  <p style="white-space: pre-wrap; background: #f1f5f9; padding: 0.75rem; border-radius: 4px;">${escapeHtml(description)}</p>
  <p style="margin-top: 1.5rem; color: #64748b; font-size: 0.875rem;">This is an automated notification from the Student Incident Report system.</p>
</body>
</html>
`.trim()

  try {
    const brevo = new BrevoClient({ apiKey })
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: notifyEmail }],
      subject: `[Incident Report] ${type} – ${date}`,
      htmlContent,
    })
    console.log('[notify-new-report] Email sent to', notifyEmail)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    const fullError = err instanceof Error ? err.stack ?? err.message : String(err)
    console.error('[notify-new-report] Brevo error:', fullError)
    return NextResponse.json(
      { error: 'Brevo send failed', details: message },
      { status: 502 }
    )
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
