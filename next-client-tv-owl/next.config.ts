import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "."
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
