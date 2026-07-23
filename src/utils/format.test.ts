import { describe, expect, it } from "vitest";
import {
  formatFileSize,
  validateImageFile,
  validationErrorMessage,
  MAX_FILE_SIZE,
} from "@/utils/format";

describe("formatFileSize", () => {
  it("formats zero and invalid values", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(-1)).toBe("0 Bytes");
    expect(formatFileSize(Number.NaN)).toBe("0 Bytes");
  });

  it("formats bytes, KB, and MB", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
  });
});

describe("validateImageFile", () => {
  it("rejects missing files", () => {
    expect(validateImageFile(null)).toBe("empty");
    expect(validateImageFile(undefined)).toBe("empty");
    expect(validationErrorMessage("empty")).toBe("No file provided");
  });

  it("rejects non-image types", () => {
    expect(validateImageFile({ type: "application/pdf", size: 10 })).toBe(
      "not_image"
    );
    expect(validationErrorMessage("not_image")).toBe(
      "Please select an image file"
    );
  });

  it("rejects oversized files", () => {
    expect(
      validateImageFile({ type: "image/png", size: MAX_FILE_SIZE + 1 })
    ).toBe("too_large");
    expect(validationErrorMessage("too_large")).toContain("100MB");
  });

  it("accepts valid images", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 2048 })).toBeNull();
    expect(validateImageFile({ type: "image/webp", size: MAX_FILE_SIZE })).toBeNull();
  });
});
