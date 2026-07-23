'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import UploadHistory from '@/components/UploadHistory';

export default function Home() {
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleNewUpload = () => {
    setRefreshHistory((prev) => prev + 1);
  };

  return (
    <main className="narenj-canvas min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <header className="mb-8 text-center sm:mb-10">
          <p className="animate-fade-up font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-br from-[var(--narenj)] via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Narenj
            </span>{' '}
            <span className="text-stone-800">Uploader</span>
          </p>
          <p className="animate-fade-up-delay-1 mx-auto mt-3 max-w-md text-base leading-relaxed text-stone-500 sm:text-lg">
            Free image upload. Drop a file, copy a fast CDN link.
          </p>
        </header>

        <div className="animate-fade-up-delay-1 flex-1">
          <ImageUploader onUpload={handleNewUpload} />
          <UploadHistory refreshKey={refreshHistory} />
        </div>

        <footer className="mt-12 text-center text-xs text-stone-400 animate-fade-up-delay-2">
          Free · No account · Works on mobile
        </footer>
      </div>
    </main>
  );
}
