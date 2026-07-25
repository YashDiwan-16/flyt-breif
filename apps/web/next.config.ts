import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: [
    "@flyt-breif/ai",
    "@flyt-breif/auth",
    "@flyt-breif/core",
    "@flyt-breif/data",
    "@flyt-breif/db",
    "@flyt-breif/env",
    "@flyt-breif/ui",
  ],
};

export default nextConfig;
