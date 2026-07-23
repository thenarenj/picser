export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatUploadDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type ImageValidationError = "empty" | "not_image" | "too_large";

export function validateImageFile(
  file: Pick<File, "type" | "size"> | null | undefined
): ImageValidationError | null {
  if (!file) return "empty";
  if (!file.type.startsWith("image/")) return "not_image";
  if (file.size > MAX_FILE_SIZE) return "too_large";
  return null;
}

export function validationErrorMessage(error: ImageValidationError): string {
  switch (error) {
    case "empty":
      return "No file provided";
    case "not_image":
      return "Please select an image file";
    case "too_large":
      return "File size must be less than 100MB";
  }
}
