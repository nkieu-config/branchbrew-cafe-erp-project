export const BRAND_NAME = "BranchBrew" as const;

export const BRAND_TAGLINE = "Multi-branch cafe ERP" as const;

/** Public GitHub repository — override with NEXT_PUBLIC_GITHUB_REPO_URL if needed. */
export const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ??
  "https://github.com/nkieu-config/branchbrew-cafe-erp";
