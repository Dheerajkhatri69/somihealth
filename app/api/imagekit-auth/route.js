// api/imagekit-auth/route.js
import ImageKit from "imagekit";
import { v4 as uuidv4 } from 'uuid'; // Add UUID v4 generator

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
});

export async function GET() {
  try {
    const token = uuidv4(); // Generate fresh V4 UUID
    const authParams = imagekit.getAuthenticationParameters({
      token // Inject custom token
    });
    
    return new Response(JSON.stringify({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0' // Prevent caching
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate auth params' }),
      { status: 500 }
    );
  }
}