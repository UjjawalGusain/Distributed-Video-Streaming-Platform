import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "."
  },
  reactStrictMode: true,
};

export default nextConfig;
