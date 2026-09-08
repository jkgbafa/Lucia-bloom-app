import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-side app — static export deploys straight to Netlify
  output: "export",
};

export default nextConfig;
