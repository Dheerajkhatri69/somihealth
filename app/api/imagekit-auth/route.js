import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
});

export async function GET() {
  try {
    const token = uuidv4();
    const timestamp = Math.floor(Date.now() / 1000);

    console.log("Token:", token);
    console.log("Timestamp:", timestamp);

    const authParams = imagekit.getAuthenticationParameters({ token, timestamp });

    console.log("Auth Params:", authParams);

    return NextResponse.json({
      signature: authParams.signature,
      token,
      expire: authParams.expire,
      timestamp,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return new NextResponse(JSON.stringify({
      error: 'Authentication failed',
      details: error.message
    }), { status: 500 });
  }
}
