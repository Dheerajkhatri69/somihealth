// api/imagekit-auth/route.js
import ImageKit from "imagekit";
import { v4 as uuidv4 } from 'uuid';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
});

export async function GET() {
  try {
    const token = uuidv4();
    const { signature, expire } = imagekit.getAuthenticationParameters({ token });

    return new Response(JSON.stringify({
      signature,
      token, // Direct UUID string
      expire,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Authentication failed', details: error.message }),
      { status: 500 }
    );
  }
}