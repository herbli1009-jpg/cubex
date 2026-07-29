import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { inquirySchema } from '../../lib/inquiry';
import { getAdminClient } from '../../lib/admin-users';

const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    if (body?.website || body?.honeypot) return json({ code: 'SPAM_REJECTED', message: 'Unable to send your inquiry.' }, 400);
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      const errors = Object.fromEntries(parsed.error.issues.filter(issue => !['honeypot', 'website'].includes(String(issue.path[0]))).map(issue => [String(issue.path[0]), issue.message]));
      return json({ code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields and try again.', errors }, 400);
    }
    const data = parsed.data;
    if (import.meta.env.TURNSTILE_SECRET_KEY) { const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: import.meta.env.TURNSTILE_SECRET_KEY, response: data.turnstileToken || '', remoteip: clientAddress || '' }) }); if (!(await check.json()).success) return json({ code: 'BOT_CHECK_FAILED', message: 'Please complete the security check and try again.' }, 400); }
    if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase is not configured.');
    const supabase = getAdminClient(import.meta.env);
    const { data: inserted, error } = await supabase.from('inquiries').insert({ name:data.name, company:data.company || null, email:data.email, country:data.country || null, service:data.service, priority:data.priority, details:data.details, source:data.source, product:data.product || null, resource:data.resource || null, questionnaire:data.questionnaire || {}, status:'new' }).select('id').single();
    if (error) throw error;
    if (import.meta.env.SMTP_HOST) { const transporter = nodemailer.createTransport({ host: import.meta.env.SMTP_HOST, port: Number(import.meta.env.SMTP_PORT || 587), secure: Number(import.meta.env.SMTP_PORT) === 465, auth: { user: import.meta.env.SMTP_USER, pass: import.meta.env.SMTP_PASS } }); await transporter.sendMail({ from: import.meta.env.SMTP_FROM, to: import.meta.env.INQUIRY_RECIPIENT, replyTo: data.email, subject: `[CUBEX] New inquiry ${inserted.id}`, text: `${data.name} (${data.email})\n\nService: ${data.service}\nPriority: ${data.priority}\n\n${data.details}` }); }
    return json({ id: inserted.id });
  } catch (error) { console.error('Inquiry submission failed', error); return json({ code: 'SUBMISSION_FAILED', message: 'We could not send your inquiry. Please email hello@cubexfitness.com.' }, 500); }
};
