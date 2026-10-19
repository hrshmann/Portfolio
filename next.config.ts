import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the phishing check reads the exported model at runtime; ship it with that function
  outputFileTracingIncludes: {
    "/api/check": ["./src/data/**"],
  },
};

export default nextConfig;
