export interface UploadUrls {
  github: string;
  raw: string;
  jsdelivr: string;
  github_commit: string;
  raw_commit: string;
  jsdelivr_commit: string;
}

export interface UploadHistory {
  id: string;
  filename: string;
  url: string;
  urls?: UploadUrls;
  github_url?: string;
  uploadDate: string;
  size: number;
  type: string;
}

export const STORAGE_KEY = "narenj_upload_history";
export const LEGACY_STORAGE_KEY = "picser_upload_history";
export const MAX_HISTORY = 50;

function readHistory(key: string): UploadHistory[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as UploadHistory[]) : [];
  } catch {
    return [];
  }
}

export const saveToHistory = (
  upload: Omit<UploadHistory, "id" | "uploadDate">
): UploadHistory | undefined => {
  if (typeof window === "undefined") return;

  const history = getHistory();
  const newUpload: UploadHistory = {
    ...upload,
    id: Date.now().toString(),
    uploadDate: new Date().toISOString(),
  };

  const updatedHistory = [newUpload, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newUpload;
};

export const getHistory = (): UploadHistory[] => {
  if (typeof window === "undefined") return [];

  const current = readHistory(STORAGE_KEY);
  if (current.length > 0) return current;

  // Migrate legacy Picser history once
  const legacy = readHistory(LEGACY_STORAGE_KEY);
  if (legacy.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return legacy;
  }

  return [];
};

export const clearHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
};

export const getBestUrl = (upload: Pick<UploadHistory, "url" | "urls">): string => {
  if (upload.urls?.jsdelivr_commit) return upload.urls.jsdelivr_commit;
  if (upload.urls?.jsdelivr) return upload.urls.jsdelivr;
  return upload.url;
};
