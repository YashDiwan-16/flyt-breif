import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@flyt-breif/ai",
    "@flyt-breif/core",
    "@flyt-breif/data",
    "@flyt-breif/ui",
  ],
};

export default nextConfig;
