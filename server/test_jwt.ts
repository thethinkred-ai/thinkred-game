import * as dotenv from 'dotenv';
dotenv.config();
import * as jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
console.log('JWT_SECRET:', JSON.stringify(secret));
console.log('JWT_SECRET length:', secret?.length);

const token = jwt.sign({userId: 1, email: 'test@test.com', name: 'Test User'}, secret || '', {expiresIn: '7d'});
console.log('Generated token:', token);
console.log('Token length:', token.length);

try {
  const decoded = jwt.verify(token, secret || '');
  console.log('Verified OK:', decoded);
} catch(e: any) {
  console.log('Verify error:', e.message);
}
