export function buildUploadUrls(params: {
  owner: string;
  repo: string;
  branch: string;
  filename: string;
  commitSha: string;
}) {
  const { owner, repo, branch, filename, commitSha } = params;

  return {
    github: `https://github.com/${owner}/${repo}/blob/${branch}/${filename}`,
    raw: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`,
    jsdelivr: `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filename}`,
    github_commit: `https://github.com/${owner}/${repo}/blob/${commitSha}/${filename}`,
    raw_commit: `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${filename}`,
    jsdelivr_commit: `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${commitSha}/${filename}`,
  };
}

export function createUploadFilename(originalName: string, now = new Date(), random = Math.random()): string {
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const extension = originalName.includes(".")
    ? originalName.split(".").pop() || "jpg"
    : "jpg";
  const id = random.toString(36).slice(2, 11);
  return `uploads/${timestamp}-${id}.${extension}`;
}
