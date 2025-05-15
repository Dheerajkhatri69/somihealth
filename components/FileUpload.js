'use client';
'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function UploadFile({ onUploadComplete, onDelete, file }) {
    const [secureUrl, setSecureUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (file) {
            setSecureUrl(file);
        }
    }, [file]);

    const handleUpload = async (file) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Oops something went wrong');
            }

            const data = await res.json();
            setSecureUrl(data.url);
            onUploadComplete(data.url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setSecureUrl('');
        onDelete();
    };

    //   const handleUpload = async (file) => {
    //     setIsLoading(true);
    //     try {
    //       const formData = new FormData();
    //       formData.append('file', file);

    //       const res = await fetch('/api/upload', {
    //         method: 'POST',
    //         body: formData,
    //       });

    //       if (!res.ok) {
    //         throw new Error('Oops something went wrong');
    //       }

    //       const data = await res.json();
    //       setSecureUrl(data.url);
    //     } catch (error) {
    //       console.error(error);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };

    //   const handleDelete = () => {
    //     setSecureUrl('');
    //   };

    return (
        <div className="max-w-5xl mx-auto p-6 border rounded-lg shadow-sm">
            <label className="block mb-4">
                <span className="block text-sm text-gray-600 mb-2">
                    Upload images, videos, or PDFs (max 10MB)
                </span>
                <input
                    type="file"
                    accept="image/*,video/*,pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <div className="cursor-pointer bg-blue-100 text-blue-800 p-4 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-50 transition-colors text-center">
                    {isLoading ? 'Uploading...' : 'Click to upload or drag & drop'}
                </div>
            </label>

            {secureUrl && (
                <div className="mt-4">
                    {secureUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <Image
                            src={secureUrl}
                            alt="Uploaded file"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />
                    ) : secureUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                            src={secureUrl}
                            controls
                            className="w-full max-w-[400px] rounded-lg aspect-video"
                        />
                    ) : secureUrl.match(/\.pdf$/i) ? (
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                            <a
                                href={secureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View PDF
                            </a>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            Unsupported file format
                        </div>
                    )}
                    <button
                        onClick={handleDelete}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
