import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gitlab.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
