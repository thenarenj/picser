import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploader from "@/components/ImageUploader";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, unoptimized, ...rest } = props;
    void fill;
    void unoptimized;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

function selectFile(file: File) {
  const input = document.getElementById(
    "narenj-file-input"
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

describe("ImageUploader", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:narenj-test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          url: "https://raw.githubusercontent.com/o/r/main/uploads/a.png",
          urls: {
            github: "g",
            raw: "r",
            jsdelivr: "j",
            github_commit: "gc",
            raw_commit: "rc",
            jsdelivr_commit:
              "https://cdn.jsdelivr.net/gh/o/r@sha/uploads/a.png",
          },
          filename: "uploads/a.png",
          size: 128,
          type: "image/png",
        }),
      })
    );
    mockClipboard();
  });

  it("renders the upload dropzone", () => {
    render(<ImageUploader />);
    expect(screen.getByText(/Drop or choose an image/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose image/i)).toBeInTheDocument();
  });

  it("uploads an image and shows the CDN link", async () => {
    const onUpload = vi.fn();
    render(<ImageUploader onUpload={onUpload} />);

    selectFile(new File(["fake-image"], "photo.png", { type: "image/png" }));

    await waitFor(() => {
      expect(screen.getByText(/Ready to share/i)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/upload",
      expect.objectContaining({ method: "POST" })
    );
    expect(onUpload).toHaveBeenCalled();
    expect(screen.getByDisplayValue(/cdn.jsdelivr.net/)).toBeInTheDocument();
  });

  it("shows an error for non-image files", async () => {
    render(<ImageUploader />);

    selectFile(new File(["pdf"], "doc.pdf", { type: "application/pdf" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Please select an image file/i
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("copies the CDN URL", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<ImageUploader />);

    selectFile(new File(["fake-image"], "photo.png", { type: "image/png" }));

    await screen.findByText(/Ready to share/i);
    await user.click(screen.getByRole("button", { name: /^Copy$/i }));

    expect(writeText).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/gh/o/r@sha/uploads/a.png"
    );
    expect(await screen.findByText(/^Copied$/i)).toBeInTheDocument();
  });
});
