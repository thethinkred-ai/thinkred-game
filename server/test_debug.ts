import * as dotenv from 'dotenv';
dotenv.config();
import * as http from 'http';
import * as jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || '';
console.log('JWT_SECRET length:', secret.length);

function reqRaw(method: string, path: string, body?: any, token?: string): Promise<{status: number, body: string, headers: Record<string, string | string[] | undefined>}> {
  return new Promise((resolve) => {
    const opts: http.RequestOptions = {
      hostname: 'localhost', port: 3001, path, method,
      headers: { 'Content-Type': 'application/json' } as any,
    };
    if (token) (opts.headers as any)['Authorization'] = 'Bearer ' + token;
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode!, body: data, headers: res.headers }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message, headers: {} }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function json(data: string): any { try { return JSON.parse(data); } catch { return data; } }

async function main() {
  // 1. Get token from dev-login redirect
  console.log('=== 1. Dev-login ===');
  const login = await reqRaw('GET', '/auth/dev-login');
  const location = (login.headers.location as string) || '';
  const token = location.includes('token=') ? location.split('token=')[1] : '';
  console.log('Token length:', token.length);

  if (!token) {
    console.log('No token found! Location:', location);
    return;
  }

  // Decode payload
  const parts = token.split('.');
  if (parts.length >= 2) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('Payload:', JSON.stringify(payload));
  }

  // Try local verify
  try {
    const dec = jwt.verify(token, secret);
    console.log('Local verify OK:', JSON.stringify(dec));
  } catch (e: any) {
    console.log('Local verify FAILED:', e.message);
    try {
      const dec2 = jwt.verify(token, '');
      console.log('*** SERVER USES EMPTY SECRET! Verify with "" OK ***');
    } catch {}
  }

  // 2. Verify via server
  console.log('\n=== 2. Verify via server ===');
  const v = await reqRaw('GET', '/auth/verify', undefined, token);
  console.log(json(v.body));

  // 3. Game state
  console.log('\n=== 3. Game state ===');
  const gs = await reqRaw('GET', '/api/game/state', undefined, token);
  console.log(JSON.stringify(json(gs.body), null, 2));

  // 4. Enterprise types
  console.log('\n=== 4. Enterprise types ===');
  const et = await reqRaw('GET', '/api/game/enterprise-types', undefined, token);
  console.log(JSON.stringify(json(et.body), null, 2));

  // 5. Create enterprise
  console.log('\n=== 5. Create enterprise ===');
  const ce = await reqRaw('POST', '/api/game/enterprises', { name: 'Красная мануфактура', type: 'manufactory', location: 'Москва' }, token);
  console.log(JSON.stringify(json(ce.body), null, 2));
  const entId = json(ce.body)?.id || '';

  // 6. Decisions
  if (entId) {
    console.log('\n=== 6. Decision: wage_change ===');
    const d1 = await reqRaw('POST', `/api/game/enterprises/${entId}/decisions`, { type: 'wage_change', value: 120 }, token);
    console.log(JSON.stringify(json(d1.body), null, 2));

    console.log('\n=== 7. Decision: investment ===');
    const d2 = await reqRaw('POST', `/api/game/enterprises/${entId}/decisions`, { type: 'investment', value: 5000 }, token);
    console.log(JSON.stringify(json(d2.body), null, 2));
  }

  // 8. Events
  console.log('\n=== 8. Events ===');
  const ev = await reqRaw('GET', '/api/game/events', undefined, token);
  console.log(JSON.stringify(json(ev.body), null, 2));

  // 9. Economy
  console.log('\n=== 9. Economy ===');
  const ec = await reqRaw('GET', '/api/game/economy', undefined, token);
  console.log(JSON.stringify(json(ec.body), null, 2));

  // 10. Market
  console.log('\n=== 10. Market ===');
  const mk = await reqRaw('GET', '/api/game/market', undefined, token);
  console.log(JSON.stringify(json(mk.body), null, 2));

  console.log('\n=== DONE ===');
}

main();
