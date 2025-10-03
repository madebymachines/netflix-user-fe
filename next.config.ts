import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mbh-storage.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },

  // Proxy lokal ke BE kamu (tetap)
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://mirror-100-plus-be.onrender.com/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
