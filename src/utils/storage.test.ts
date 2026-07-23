import { beforeEach, describe, expect, it } from "vitest";
import {
  saveToHistory,
  getHistory,
  clearHistory,
  getBestUrl,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
} from "@/utils/storage";

const sample = {
  filename: "uploads/a.png",
  url: "https://cdn.example/a.png",
  size: 1200,
  type: "image/png",
  urls: {
    github: "g",
    raw: "r",
    jsdelivr: "j",
    github_commit: "gc",
    raw_commit: "rc",
    jsdelivr_commit: "https://cdn.jsdelivr.net/gh/x/y@sha/a.png",
  },
};

describe("storage history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and retrieves uploads newest-first", () => {
    saveToHistory({ ...sample, filename: "first.png" });
    saveToHistory({ ...sample, filename: "second.png" });

    const history = getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].filename).toBe("second.png");
    expect(history[0].id).toBeTruthy();
    expect(history[0].uploadDate).toBeTruthy();
  });

  it("clears history", () => {
    saveToHistory(sample);
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("migrates legacy picser history", () => {
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify([
        {
          id: "1",
          filename: "legacy.png",
          url: "https://old",
          uploadDate: "2024-01-01T00:00:00.000Z",
          size: 10,
          type: "image/png",
        },
      ])
    );

    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].filename).toBe("legacy.png");
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("prefers permanent jsDelivr URL", () => {
    expect(getBestUrl(sample)).toBe(sample.urls.jsdelivr_commit);
    expect(getBestUrl({ url: "fallback", urls: undefined })).toBe("fallback");
  });
});
