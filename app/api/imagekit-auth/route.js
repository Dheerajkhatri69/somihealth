import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
});

export async function GET() {
  try {
    const authParams = imagekit.getAuthenticationParameters(); // Generates fresh token
    return new Response(JSON.stringify(authParams), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate auth params' }),
      { status: 500 }
    );
  }
}
