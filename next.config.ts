import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/client/**",
      "./node_modules/@prisma/client/**"
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
