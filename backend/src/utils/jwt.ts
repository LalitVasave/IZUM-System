import { SignJWT, jwtVerify, generateKeyPair, exportJWK, importJWK, type JWTPayload } from 'jose';
import fs from 'fs';
import path from 'path';

type JoseKey = Awaited<ReturnType<typeof importJWK>>;

const KEYS_DIR = path.join(__dirname, '../../secrets');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.json');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.json');

let privateKey: JoseKey | undefined;
let publicKey: JoseKey | undefined;

export async function initKeys() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    console.log('Generating new RS256 key pair...');
    const { publicKey: pub, privateKey: priv } = await generateKeyPair('RS256', { extractable: true });
    
    const privateJwk = await exportJWK(priv);
    const publicJwk = await exportJWK(pub);
    
    fs.writeFileSync(PRIVATE_KEY_PATH, JSON.stringify(privateJwk));
    fs.writeFileSync(PUBLIC_KEY_PATH, JSON.stringify(publicJwk));
    
    privateKey = priv;
    publicKey = pub;
  } else {
    const privateJwk = JSON.parse(fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8'));
    const publicJwk = JSON.parse(fs.readFileSync(PUBLIC_KEY_PATH, 'utf-8'));
    
    privateKey = await importJWK(privateJwk, 'RS256');
    publicKey = await importJWK(publicJwk, 'RS256');
  }
}

export async function signAccessToken(payload: JWTPayload) {
  if (!privateKey) await initKeys();
  const key = privateKey;
  if (!key) throw new Error('JWT private key unavailable');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key);
}

export async function signRefreshToken(payload: JWTPayload, jti: string) {
  if (!privateKey) await initKeys();
  const key = privateKey;
  if (!key) throw new Error('JWT private key unavailable');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token: string) {
  if (!publicKey) await initKeys();
  const key = publicKey;
  if (!key) throw new Error('JWT public key unavailable');
  const { payload } = await jwtVerify(token, key);
  return payload;
}
