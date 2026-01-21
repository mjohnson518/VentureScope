import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Anthropic SDK from bundling to prevent build-time initialization issues
  serverExternalPackages: ['@anthropic-ai/sdk'],
};

export default nextConfig;
