import ImageKit from "imagekit";
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
});

// Cache busting mechanism
let lastTokenTime = 0;
let sequenceCounter = 0;

export async function GET() {
  try {
    // Four layers of uniqueness:
    // 1. UUID v4
    // 2. Cryptographic random number
    // 3. Current timestamp (ms)
    // 4. Sequence counter for same-millisecond requests
    const now = Date.now();
    if (now === lastTokenTime) {
      sequenceCounter++;
    } else {
      sequenceCounter = 0;
      lastTokenTime = now;
    }
    
    const randomNum = parseInt(randomBytes(4).toString('hex'), 16);
    const token = `${uuidv4()}-${randomNum}-${now}-${sequenceCounter}`;
    
    const timestamp = Math.floor(now / 1000);
    
    const { signature, expire } = imagekit.getAuthenticationParameters({
      token,
      timestamp
    });

    return new Response(JSON.stringify({
      signature,
      token,
      expire,
      timestamp,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Vary': '*' // Ensure responses aren't cached by proxies
      }
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        details: error.message 
      }),
      { status: 500 }
    );
  }
}