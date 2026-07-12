import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function page(body: string) {
  return new NextResponse(
    `<!doctype html>
<html><head><meta charset="utf-8"><title>Unsubscribe</title>
<style>
  body { background:#0a0a0a; color:rgba(255,255,255,0.9); font-family:ui-monospace,monospace; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; padding:2rem; text-align:center; }
  .card { max-width:28rem; }
  button { background:#0aee3c; color:#0a0a0a; font-weight:700; border:none; border-radius:6px; padding:0.6rem 1.2rem; cursor:pointer; font-family:inherit; }
  a { color:#8ab4f8; }
</style></head>
<body><div class="card">${body}</div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// GET renders a confirmation page instead of unsubscribing directly — some
// email clients "prefetch" links in messages to scan for phishing, which
// would otherwise unsubscribe people who never clicked anything.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return page('<p>Missing or invalid unsubscribe link.</p>');
  }

  return page(`
    <p>Unsubscribe from new post emails?</p>
    <form method="POST" action="/api/unsubscribe">
      <input type="hidden" name="token" value="${token}" />
      <button type="submit">Confirm unsubscribe</button>
    </form>
  `);
}

export async function POST(request: NextRequest) {
  let token: string | null = null;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    token = body.token;
  } else {
    const formData = await request.formData();
    token = formData.get('token') as string | null;
  }

  if (!token) {
    return page('<p>Missing or invalid unsubscribe link.</p>');
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .delete()
    .eq('unsubscribe_token', token);

  if (error) {
    console.error('Unsubscribe error:', error);
    return page('<p>Something went wrong. Please try again later.</p>');
  }

  return page("<p>You've been unsubscribed. Sorry to see you go.</p>");
}
