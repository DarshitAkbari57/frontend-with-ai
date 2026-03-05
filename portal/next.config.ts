import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'invi-media.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'disgo-eb-bucket.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
