import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadHistory from "@/components/UploadHistory";
import { saveToHistory } from "@/utils/storage";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, unoptimized, ...rest } = props;
    void fill;
    void unoptimized;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

describe("UploadHistory", () => {
  it("renders nothing when history is empty", () => {
    const { container } = render(<UploadHistory />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists recent uploads and clears them", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    saveToHistory({
      filename: "uploads/sunset.png",
      url: "https://cdn.jsdelivr.net/gh/o/r@sha/uploads/sunset.png",
      size: 2048,
      type: "image/png",
      urls: {
        github: "g",
        raw: "r",
        jsdelivr: "j",
        github_commit: "gc",
        raw_commit: "rc",
        jsdelivr_commit: "https://cdn.jsdelivr.net/gh/o/r@sha/uploads/sunset.png",
      },
    });

    render(<UploadHistory refreshKey={1} />);

    expect(screen.getByText(/Recent/i)).toBeInTheDocument();
    expect(screen.getByText("sunset.png")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Clear/i }));
    expect(screen.queryByText(/Recent/i)).not.toBeInTheDocument();
  });
});
