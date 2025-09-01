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
        pathname: "/netflix100/profile-pictures/**",
      },
    ],
  },
};

export default nextConfig;
