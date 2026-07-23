import { describe, expect, it } from "vitest";
import { buildUploadUrls, createUploadFilename } from "@/utils/upload";

describe("buildUploadUrls", () => {
  it("builds branch and commit URLs", () => {
    const urls = buildUploadUrls({
      owner: "acme",
      repo: "assets",
      branch: "main",
      filename: "uploads/photo.png",
      commitSha: "abc123",
    });

    expect(urls.github).toBe(
      "https://github.com/acme/assets/blob/main/uploads/photo.png"
    );
    expect(urls.raw).toBe(
      "https://raw.githubusercontent.com/acme/assets/main/uploads/photo.png"
    );
    expect(urls.jsdelivr).toBe(
      "https://cdn.jsdelivr.net/gh/acme/assets@main/uploads/photo.png"
    );
    expect(urls.jsdelivr_commit).toBe(
      "https://cdn.jsdelivr.net/gh/acme/assets@abc123/uploads/photo.png"
    );
    expect(urls.raw_commit).toContain("/abc123/");
    expect(urls.github_commit).toContain("/blob/abc123/");
  });
});

describe("createUploadFilename", () => {
  it("creates a unique uploads path with extension", () => {
    const now = new Date("2026-07-24T10:00:00.000Z");
    const filename = createUploadFilename("sunset.JPEG", now, 0.123456789);

    expect(filename.startsWith("uploads/")).toBe(true);
    expect(filename.endsWith(".JPEG")).toBe(true);
    expect(filename).toContain("2026-07-24T10-00-00-000Z");
  });

  it("defaults extension when missing", () => {
    const filename = createUploadFilename("noext", new Date("2026-01-01T00:00:00.000Z"), 0.5);
    expect(filename.endsWith(".jpg")).toBe(true);
  });
});
