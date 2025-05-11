import { NextResponse } from 'next/server';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to a usable format (Next.js/FormData handling)
    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Create dir if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    await fs.writeFile(
      path.join(uploadDir, fileName),
      Buffer.from(buffer)
    );

    return NextResponse.json(
      { message: 'File uploaded!', imageUrl: `/uploads/${fileName}` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload file', error: error.message },
      { status: 500 }
    );
  }
}