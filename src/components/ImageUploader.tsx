'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  ImagePlus,
  Sparkles,
} from 'lucide-react';
import { saveToHistory } from '@/utils/storage';
import {
  formatFileSize,
  validateImageFile,
  validationErrorMessage,
} from '@/utils/format';

interface UploadResult {
  success: boolean;
  url: string;
  urls?: {
    github: string;
    raw: string;
    jsdelivr: string;
    github_commit: string;
    raw_commit: string;
    jsdelivr_commit: string;
  };
  filename: string;
  size: number;
  type: string;
  commit_sha?: string;
  github_url?: string;
  error?: string;
}

interface PreviewFile {
  file: File;
  url: string;
}

interface ImageUploaderProps {
  onUpload?: () => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationErrorMessage(validationError));
        return;
      }

      setError(null);
      setUploadResult(null);

      const previewUrl = URL.createObjectURL(file);
      setPreviewFile({ file, url: previewUrl });
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setUploadResult(result);
          saveToHistory({
            filename: result.filename,
            url: result.urls?.jsdelivr_commit || result.url,
            github_url: result.github_url,
            size: result.size,
            type: result.type,
            urls: result.urls,
          });
          onUpload?.();
        } else {
          setError(result.error || 'Upload failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepth.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleUpload(files[0]);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleUpload(files[0]);
      }
      e.target.value = '';
    },
    [handleUpload]
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetUpload = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setUploadResult(null);
    setError(null);
    setPreviewFile(null);
    setCopiedUrl(null);
  };

  const primaryUrl =
    uploadResult?.urls?.jsdelivr_commit || uploadResult?.url || '';

  return (
    <div className="w-full max-w-xl mx-auto">
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-red-800 animate-float-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {uploadResult ? (
        <div className="rounded-[1.75rem] border border-orange-200/60 bg-white/80 p-5 sm:p-7 shadow-[0_20px_50px_-24px_rgba(194,65,12,0.35)] backdrop-blur-md animate-float-in">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--leaf-soft)] text-[var(--leaf)] animate-success-pop">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <h2 className="font-[family-name:var(--font-syne)] text-xl sm:text-2xl font-semibold text-stone-900">
              Ready to share
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Your image is live on the CDN
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50">
              <Image
                src={primaryUrl}
                alt="Uploaded image"
                width={360}
                height={240}
                className="max-h-56 w-auto max-w-full object-contain"
                unoptimized
              />
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-stone-500">
            <span className="truncate font-medium text-stone-700">
              {uploadResult.filename.split('/').pop()}
            </span>
            <span className="shrink-0">
              {formatFileSize(uploadResult.size)}
            </span>
          </div>

          <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/90 to-amber-50/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--narenj-deep)]">
              <Sparkles className="h-4 w-4" />
              CDN link
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="text"
                value={primaryUrl}
                readOnly
                aria-label="CDN URL"
                className="min-w-0 flex-1 rounded-xl border border-orange-200/80 bg-white/90 px-3 py-2.5 font-mono text-xs text-stone-800 outline-none focus:ring-2 focus:ring-orange-300/60"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(primaryUrl)}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[var(--narenj)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--narenj-deep)] active:scale-[0.98]"
                >
                  {copiedUrl === primaryUrl ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-3 text-stone-600 transition hover:bg-stone-50"
                  aria-label="Open image"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {uploadResult.urls && (
            <details className="mt-4 group">
              <summary className="cursor-pointer list-none text-sm font-medium text-stone-500 transition hover:text-stone-800 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1.5">
                  More links
                  <span className="text-stone-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </span>
              </summary>
              <div className="mt-3 space-y-2 animate-float-in">
                {[
                  {
                    label: 'Permanent raw',
                    value: uploadResult.urls.raw_commit,
                  },
                  {
                    label: 'Branch CDN',
                    value: uploadResult.urls.jsdelivr,
                  },
                  {
                    label: 'GitHub',
                    value: uploadResult.urls.github_commit,
                  },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-xl border border-stone-200/70 bg-white/70 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                          {item.label}
                        </p>
                        <p className="truncate font-mono text-xs text-stone-700">
                          {item.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.value)}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-orange-50 hover:text-[var(--narenj)]"
                        aria-label={`Copy ${item.label}`}
                      >
                        {copiedUrl === item.value ? (
                          <Check className="h-4 w-4 text-[var(--leaf)]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </details>
          )}

          <button
            type="button"
            onClick={resetUpload}
            className="mt-6 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-orange-200 hover:bg-orange-50/50 active:scale-[0.99]"
          >
            Upload another
          </button>
        </div>
      ) : (
        <div
          className={`
            relative overflow-hidden rounded-[1.75rem] border bg-white/75 p-6 sm:p-8
            shadow-[0_24px_60px_-28px_rgba(194,65,12,0.28)] backdrop-blur-md
            transition-all duration-300
            ${
              isDragging
                ? 'border-[var(--narenj)] bg-orange-50/80 scale-[1.01] animate-soft-pulse'
                : 'border-orange-200/50 hover:border-orange-300/80'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="sr-only"
            disabled={uploading}
            id="narenj-file-input"
          />

          {previewFile ? (
            <div className="text-center animate-float-in">
              <div className="relative mx-auto mb-5 inline-block overflow-hidden rounded-2xl border border-stone-200">
                <Image
                  src={previewFile.url}
                  alt="Preview"
                  width={280}
                  height={180}
                  className="max-h-44 w-auto object-contain"
                  unoptimized
                />
                {uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/45 backdrop-blur-[2px]">
                    <div className="mb-3 h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin-ring" />
                    <p className="text-sm font-medium text-white">Uploading…</p>
                  </div>
                )}
              </div>
              <p className="truncate text-sm text-stone-600">
                {previewFile.file.name}
              </p>
            </div>
          ) : (
            <label
              htmlFor="narenj-file-input"
              className="flex cursor-pointer flex-col items-center text-center outline-none"
            >
              <div
                className={`
                  mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
                  bg-gradient-to-br from-orange-100 to-amber-50 text-[var(--narenj)]
                  shadow-inner transition duration-300
                  ${isDragging ? 'scale-110' : ''}
                `}
              >
                {isDragging ? (
                  <ImagePlus className="h-8 w-8" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>

              <h2 className="font-[family-name:var(--font-syne)] text-xl sm:text-2xl font-semibold text-stone-900">
                {isDragging ? 'Drop it here' : 'Drop or choose an image'}
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
                JPG, PNG, GIF, or WebP — up to 100MB. Free forever.
              </p>

              <span className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--narenj)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(232,93,4,0.7)] transition hover:bg-[var(--narenj-deep)] active:scale-[0.98]">
                Choose image
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
