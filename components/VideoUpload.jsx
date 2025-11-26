'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function VideoUpload({ onUploadComplete = () => { }, onDelete = () => { }, file }) {
  const [secureUrl, setSecureUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // initialize from prop
  useEffect(() => {
    if (file) setSecureUrl(file);
  }, [file]);

  const MAX_SIZE = 100 * 1024 * 1024; // 100MB

  const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|mkv)$/i.test(url);

  const validateFile = useCallback((f) => {
    setError('');
    if (!f) return false;

    if (f.size > MAX_SIZE) {
      setError('File is larger than 100MB.');
      return false;
    }

    const ok =
      f.type.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(f.name);

    if (!ok) {
      setError('Only video files (MP4, WebM, MOV, AVI, MKV) are allowed.');
      return false;
    }

    return true;
  }, [MAX_SIZE]);

  const handleUpload = useCallback(async (f) => {
    if (!validateFile(f)) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setSecureUrl(data.url);
      onUploadComplete(data.url);
    } catch (e) {
      console.error(e);
      setError("Oops, something went wrong during upload.");
    } finally {
      setIsLoading(false);
    }
  }, [validateFile, onUploadComplete]);

  const onFileInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
  };

  const handleDelete = () => {
    setSecureUrl('');
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
      el.classList.remove("ring-2", "ring-blue-500");
    };

    const onDragOver = (e) => {
      prevent(e);
      el.classList.add("ring-2", "ring-blue-500");
    };

    const onDragLeave = (e) => {
      prevent(e);
      el.classList.remove("ring-2", "ring-blue-500");
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    el.addEventListener("dragenter", prevent);
    el.addEventListener("dragend", onDragLeave);
    el.addEventListener("dragstart", prevent);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
      el.removeEventListener("dragenter", prevent);
      el.removeEventListener("dragend", onDragLeave);
      el.removeEventListener("dragstart", prevent);
    };
  }, [handleUpload]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Upload Video (up to 100MB)
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Drag & drop or click to select a video file. Well upload it securely and show a preview.
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
              accept="video/*,.mp4,.webm,.mov,.avi,.mkv"
              className="sr-only"
              onChange={onFileInputChange}
              aria-label="Video uploader"
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* video upload icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Choose video
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
              {isLoading ? 'Uploading…' : secureUrl ? 'Upload complete.' : 'Awaiting video.'}
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
                    <path d="M3 6h18M8 6v14m8-14v14M10 6l1-2h2l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Delete
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                {isVideoUrl(secureUrl) ? (
                  <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-lg">
                    <video
                      src={secureUrl}
                      controls
                      className="h-full w-full object-contain"
                      poster=""
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Unsupported preview.</div>
                )}

                <a
                  href={secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                >
                  Open video
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17l10-10M11 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* subtle footer note */}
      <p className="mt-3 text-xs text-gray-500">
        Allowed: Video files (MP4, WebM, MOV, AVI, MKV). Max size 100MB.
      </p>
    </div>
  );
}
