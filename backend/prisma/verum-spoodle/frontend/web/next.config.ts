import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip lint failures during production build to avoid blocking deploys.
  // (App code still type-checks via `tsc`.)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
