// Centrale, oplopende factuurteller voor D'r Iereroad.
// De stand staat in Netlify Blobs, dus hij is op elk apparaat gelijk.
//
//   GET   -> geeft het volgende nummer terug ZONDER op te hogen (om te tonen)
//   POST  -> body { "waarde": <getal> }: zet de teller op minstens waarde+1
//            (wordt aangeroepen nadat een factuur is gemaakt), en geeft het
//            nieuwe volgende nummer terug.
//
// De teller begint bij 4, zodat de eerste factuur VL2026-004 is.

import { getStore } from '@netlify/blobs';

const STORE = 'iereroad-facturen';
const KEY   = 'factuurteller';
const START = 4;

const format = (n) => 'VL2026-' + String(n).padStart(3, '0');

export default async (req) => {
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const huidig = parseInt((await store.get(KEY, { type: 'text' })) || String(START), 10);
    return Response.json({ nummer: format(huidig), waarde: huidig });
  }

  if (req.method === 'POST') {
    let gebruikt;
    try { gebruikt = parseInt((await req.json()).waarde, 10); } catch (e) { /* leeg */ }
    if (!Number.isFinite(gebruikt)) {
      return Response.json({ fout: 'Ongeldig nummer' }, { status: 400 });
    }
    const huidig = parseInt((await store.get(KEY, { type: 'text' })) || String(START), 10);
    // Teller loopt alleen vooruit, nooit terug:
    const nieuw = Math.max(huidig, gebruikt + 1);
    await store.set(KEY, String(nieuw));
    return Response.json({ volgende: format(nieuw), waarde: nieuw });
  }

  return new Response('Method Not Allowed', { status: 405 });
};
