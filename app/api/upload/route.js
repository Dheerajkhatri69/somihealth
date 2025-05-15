import { uploadFile } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json("File not found", { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const res = await uploadFile(buffer, "fileUploader");

    return NextResponse.json({
      url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
