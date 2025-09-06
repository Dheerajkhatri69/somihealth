'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';

export default function TestUpload() {
    const [uploadedImage, setUploadedImage] = useState('');

    const handleUploadComplete = (url) => {
        setUploadedImage(url);
        console.log('Image uploaded successfully:', url);
    };

    const handleDelete = () => {
        setUploadedImage('');
        console.log('Image deleted');
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">File Upload Test</h1>
            
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold mb-4">Test FileUpload Component</h2>
                
                <FileUpload
                    onUploadComplete={handleUploadComplete}
                    onDelete={handleDelete}
                    file={uploadedImage}
                />

                {uploadedImage && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-2">Upload Successful!</h3>
                        <p className="text-green-700 text-sm mb-2">Image URL:</p>
                        <code className="block bg-white p-2 rounded border text-sm break-all">
                            {uploadedImage}
                        </code>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-3">How to Use FileUpload Component</h3>
                <div className="space-y-2 text-sm text-blue-700">
                    <p>• <strong>onUploadComplete:</strong> Callback function that receives the uploaded image URL</p>
                    <p>• <strong>onDelete:</strong> Callback function called when delete button is clicked</p>
                    <p>• <strong>file:</strong> Current file URL to display (if editing existing data)</p>
                    <p>• <strong>Supported formats:</strong> Images (jpg, jpeg, png, gif, webp), Videos (mp4, webm, ogg), PDFs</p>
                    <p>• <strong>Max size:</strong> 10MB</p>
                </div>
            </div>
        </div>
    );
}
