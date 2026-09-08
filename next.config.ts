import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-side app — static export deploys to any static host
  output: "export",
  // GitHub Pages serves under /Lucia-bloom-app; Netlify serves at the root
  basePath: process.env.BASE_PATH || "",
};

export default nextConfig;
