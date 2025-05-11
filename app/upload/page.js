'use client'
import { useState } from 'react';
import Image from 'next/image';

export default function MyUploadComponent() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setErrorMessage('Please select a file first');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            setImageUrl(result.imageUrl);
            setErrorMessage(null);

        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage(error.message || 'Failed to upload file');
        }
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>

            {imageUrl && (
                <div>
                    <p>Uploaded Image Preview:</p>
                    <Image
                        src={imageUrl}
                        alt="Uploaded Image Preview"
                        width={200}
                        height={200}
                    />
                </div>
            )}

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}