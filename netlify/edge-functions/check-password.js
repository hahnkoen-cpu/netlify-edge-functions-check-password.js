export default async function handler(req) {
  // Alleen POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { type, wachtwoord } = body;

  const LEDEN_WW = Netlify.env.get('LEDEN_WACHTWOORD');
  const ADMIN_WW = Netlify.env.get('ADMIN_WACHTWOORD');

  // Controleer of environment variables zijn ingesteld
  if (!LEDEN_WW || !ADMIN_WW) {
    return new Response(
      JSON.stringify({ ok: false, fout: 'Niet geconfigureerd' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let ok = false;

  if (type === 'leden') {
    ok = wachtwoord === LEDEN_WW;
  } else if (type === 'admin') {
    ok = wachtwoord === ADMIN_WW;
  }

  // Kleine vertraging om brute-force te bemoeilijken
  await new Promise(r => setTimeout(r, 300));

  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/check-password' };
