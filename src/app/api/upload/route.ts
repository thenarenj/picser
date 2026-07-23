import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { validateImageFile, validationErrorMessage } from "@/utils/format";
import { buildUploadUrls, createUploadFilename } from "@/utils/upload";

export const runtime = "edge";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    const validationError = validateImageFile(file);
    if (validationError) {
      const message =
        validationError === "not_image"
          ? "Only image files are allowed"
          : validationErrorMessage(validationError);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const image = file as File;
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");
    const filename = createUploadFilename(image.name);

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: filename,
      message: `Upload image: ${image.name}`,
      content: base64Content,
      branch: process.env.GITHUB_BRANCH || "main",
    });

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || "main";
    const commitSha = response.data.commit.sha;
    if (!commitSha) {
      return NextResponse.json(
        { error: "Upload failed: missing commit SHA" },
        { status: 500 }
      );
    }

    const urls = buildUploadUrls({
      owner,
      repo,
      branch,
      filename,
      commitSha,
    });

    return NextResponse.json({
      success: true,
      url: urls.raw,
      urls,
      filename,
      size: image.size,
      type: image.type,
      commit_sha: commitSha,
      github_url: response.data.content?.html_url,
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Upload failed: Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Narenj Uploader API",
    methods: ["POST"],
    maxFileSize: "100MB",
    allowedTypes: ["image/*"],
  });
}
