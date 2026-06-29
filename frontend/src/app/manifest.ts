import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BranchBrew ERP",
    short_name: "BranchBrew",
    description: "Multi-branch cafe ERP — POS, inventory, kitchen, and payroll",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#9a5a1e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
