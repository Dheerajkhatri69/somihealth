'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function UploadMediaLite({ onUploadComplete = () => {}, onDelete = () => {}, file }) {
  const [secureUrl, setSecureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [textPreview, setTextPreview] = useState('');
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // initialize from prop
  useEffect(() => {
    if (file) setSecureUrl(file);
  }, [file]);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  const isTextUrl = (url) => /\.txt$/i.test(url);

  const validateFile = (f) => {
    setError('');
    if (!f) return false;
    if (f.size > MAX_SIZE) {
      setError('File is larger than 10MB.');
      return false;
    }
    // allow: images + text/plain
    const ok =
      f.type.startsWith('image/') ||
      f.type === 'text/plain' ||
      // fallback for some browsers that don’t set type well:
      /\.(txt|jpg|jpeg|png|gif|webp|avif)$/i.test(f.name);
    if (!ok) {
      setError('Only images and plain text (.txt) are allowed.');
      return false;
    }
    return true;
  };

  const readLocalPreviewIfText = async (f) => {
    if (!f) return;
    if (f.type === 'text/plain' || /\.txt$/i.test(f.name)) {
      const txt = await f.text();
      setTextPreview(txt.slice(0, 8000)); // safety cap
    } else {
      setTextPreview('');
    }
  };

  const handleUpload = async (f) => {
    if (!validateFile(f)) return;
    await readLocalPreviewIfText(f);

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', f);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setSecureUrl(data.url);
      onUploadComplete(data.url);
    } catch (e) {
      console.error(e);
      setError('Oops, something went wrong during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  const onFileInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
  };

  const handleDelete = () => {
    setSecureUrl('');
    setTextPreview('');
    setError('');
    onDelete();
    if (inputRef.current) inputRef.current.value = '';
  };

  // Drag & drop handlers
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e) => {
      prevent(e);
      const f = e.dataTransfer?.files?.[0];
      if (f) handleUpload(f);
      el.classList.remove('ring-2', 'ring-blue-500');
    };
    const onDragOver = (e) => {
      prevent(e);
      el.classList.add('ring-2', 'ring-blue-500');
    };
    const onDragLeave = (e) => {
      prevent(e);
      el.classList.remove('ring-2', 'ring-blue-500');
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);
    el.addEventListener('dragenter', prevent);
    el.addEventListener('dragend', onDragLeave);
    el.addEventListener('dragstart', prevent);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
      el.removeEventListener('dragenter', prevent);
      el.removeEventListener('dragend', onDragLeave);
      el.removeEventListener('dragstart', prevent);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Upload media (Images or .txt, up to 10MB)
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Drag & drop or click to select a file. We’ll upload it securely and show a preview.
          </p>
        </div>

        <div className="p-6">
          <div
            ref={dropRef}
            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/60 px-6 py-10 text-center transition hover:bg-gray-50"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,text/plain,.txt"
              className="sr-only"
              onChange={onFileInputChange}
              aria-label="File uploader"
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* upload icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M6 20h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose file
            </button>

            <p className="mt-3 text-sm text-gray-500">
              …or drag & drop here
            </p>

            <div className="absolute inset-0 pointer-events-none rounded-xl" aria-hidden="true" />

            <div className="mt-4 h-1 w-40 overflow-hidden rounded bg-gray-200">
              <div
                className={`h-full transition-all ${isLoading ? 'w-full animate-pulse' : 'w-0'}`}
              />
            </div>

            <div className="sr-only" aria-live="polite">
              {isLoading ? 'Uploading…' : secureUrl ? 'Upload complete.' : 'Awaiting file.'}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {secureUrl && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Preview</h3>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  {/* trash icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6v14m8-14v14M10 6l1-2h2l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Delete
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                {isImageUrl(secureUrl) ? (
                  <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-lg">
                    <Image
                      src={secureUrl}
                      alt="Uploaded image"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 640px"
                      priority={false}
                    />
                  </div>
                ) : isTextUrl(secureUrl) ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                    {textPreview || 'Text file uploaded. (Preview unavailable)'}
                  </pre>
                ) : (
                  <div className="text-sm text-gray-600">Unsupported preview.</div>
                )}

                <a
                  href={secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                >
                  Open file
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17l10-10M11 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* subtle footer note */}
      <p className="mt-3 text-xs text-gray-500">
        Allowed: Images (JPG, PNG, GIF, WEBP, AVIF) and plain text (.txt). Max size 10MB.
      </p>
    </div>
  );
}
