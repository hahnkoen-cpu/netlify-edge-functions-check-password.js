import { getStore } from '@netlify/blobs';

// Per factuursoort een eigen prefix en teller-key
const SOORTEN = {
  ir: { prefix: 'IR2026-', key: 'ir-teller' }, // reservering
  cn: { prefix: 'CN2026-', key: 'cn-teller' }, // creditnota
  vl: { prefix: 'VL2026-', key: 'vl-teller' }, // veiling
};

// Geeft het volgende oplopende factuurnummer terug, bijv. IR2026-001, CN2026-001, VL2026-001
// De tellers worden persistent bewaard in Netlify Blobs (gedeeld over alle bezoekers).
export default async (req) => {
  let type = 'ir';
  try {
    const body = await req.json();
    if (body && body.type && SOORTEN[body.type]) type = body.type;
  } catch (e) {
    // geen of ongeldige body -> standaard 'ir' (reservering)
  }

  const { prefix, key } = SOORTEN[type];
  const store = getStore({ name: 'facturen', consistency: 'strong' });

  const huidig = Number(await store.get(key)) || 0;
  const volgnummer = huidig + 1;
  await store.set(key, String(volgnummer));

  const nummer = prefix + String(volgnummer).padStart(3, '0');
  return Response.json({ nummer });
};

// Beschikbaar op /api/next-invoice (zelfde stijl als /api/check-password)
export const config = { path: '/api/next-invoice' };
