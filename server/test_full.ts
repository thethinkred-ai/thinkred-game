import * as dotenv from 'dotenv';
dotenv.config();
import * as jwt from 'jsonwebtoken';
import * as http from 'http';

const secret = process.env.JWT_SECRET || '';
console.log('Using JWT_SECRET length:', secret.length);

// Generate token same as stepikService
const token = jwt.sign(
  { userId: 1, email: 'demo@thinkred.local', name: 'Демо Игрок' },
  secret,
  { expiresIn: '7d' }
);
console.log('Token:', token);
console.log('Token length:', token.length);

function request(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve) => {
    const opts: http.RequestOptions = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ***`,
      },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('\n=== 2. Verify ===');
  console.log(JSON.stringify(await request('GET', '/auth/verify'), null, 2));

  console.log('\n=== 3. Game State ===');
  console.log(JSON.stringify(await request('GET', '/api/game/state'), null, 2));

  console.log('\n=== 4. Enterprise Types ===');
  console.log(JSON.stringify(await request('GET', '/api/game/enterprise-types'), null, 2));

  console.log('\n=== 5. Create Enterprise ===');
  const ent = await request('POST', '/api/game/enterprises', { name: 'Красная мануфактура', type: 'manufactory', location: 'Москва' });
  console.log(JSON.stringify(ent, null, 2));
  const entId = ent.id || '';

  console.log('\n=== 6. Decision: wage_change ===');
  console.log(JSON.stringify(await request('POST', `/api/game/enterprises/${entId}/decisions`, { type: 'wage_change', value: 120 }), null, 2));

  console.log('\n=== 7. Decision: investment ===');
  console.log(JSON.stringify(await request('POST', `/api/game/enterprises/${entId}/decisions`, { type: 'investment', value: 5000 }), null, 2));

  console.log('\n=== 8. Events ===');
  console.log(JSON.stringify(await request('GET', '/api/game/events'), null, 2));

  console.log('\n=== 9. Economy ===');
  console.log(JSON.stringify(await request('GET', '/api/game/economy'), null, 2));

  console.log('\n=== 10. Market ===');
  console.log(JSON.stringify(await request('GET', '/api/game/market'), null, 2));

  console.log('\n=== 11. Progress ===');
  console.log(JSON.stringify(await request('GET', '/api/game/progress'), null, 2));

  console.log('\n=== 12. Final State ===');
  console.log(JSON.stringify(await request('GET', '/api/game/state'), null, 2));
}

main();
