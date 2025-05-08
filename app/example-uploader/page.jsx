"use client";

import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <main className="flex min-h-screen flex-col bg-secondary items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Handle the response
          console.log("Files: ", res);
          if (res && res.length > 0) {
            setImageUrl(res[0].url); // Set the uploaded image URL
          }
        }}
        onUploadError={(error) => {
          // Handle the error
          alert(`ERROR! ${error.message}`);
        }}
      />
      {imageUrl && (
        <div className="relative w-[200px] h-[200px]">
          <Image
            src={imageUrl}
            alt="Uploaded Image"
            layout="fill" // This makes the image fill the container
            objectFit="cover" // This ensures the image maintains aspect ratio
            className="rounded-lg"
          />
        </div>
      )}
    </main>
  );
}