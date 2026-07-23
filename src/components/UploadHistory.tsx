'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Copy, ExternalLink, Trash2, Check, Clock } from 'lucide-react';
import {
  getHistory,
  clearHistory,
  getBestUrl,
  type UploadHistory,
} from '@/utils/storage';
import { formatFileSize, formatUploadDate } from '@/utils/format';

interface UploadHistoryProps {
  refreshKey?: number;
}

export default function UploadHistoryComponent({
  refreshKey = 0,
}: UploadHistoryProps) {
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshKey]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear all upload history on this device?')) {
      clearHistory();
      setHistory([]);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-xl animate-fade-up-delay-2">
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-400" />
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-stone-900">
            Recent
          </h2>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
            {history.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <ul className="space-y-3">
        {history.map((upload, index) => {
          const bestUrl = getBestUrl(upload);
          const displayName = upload.filename.split('/').pop() || upload.filename;

          return (
            <li
              key={upload.id}
              className="group flex gap-3 rounded-2xl border border-stone-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition hover:border-orange-200/80 hover:shadow-md animate-float-in"
              style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                <Image
                  src={bestUrl}
                  alt={displayName}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {displayName}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {formatFileSize(upload.size)} · {formatUploadDate(upload.uploadDate)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={bestUrl}
                    readOnly
                    className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[10px] text-stone-600"
                    aria-label={`URL for ${displayName}`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bestUrl, upload.id)}
                    className="rounded-lg p-1.5 text-stone-500 transition hover:bg-orange-50 hover:text-[var(--narenj)]"
                    aria-label="Copy link"
                  >
                    {copiedId === upload.id ? (
                      <Check className="h-3.5 w-3.5 text-[var(--leaf)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <a
                    href={bestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-stone-500 transition hover:bg-orange-50 hover:text-[var(--narenj)]"
                    aria-label="Open link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
