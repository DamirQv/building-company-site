import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.8.31', '192.168.8.63', '127.0.0.1', '172.26.160.1'],
  // Disabled object URLs must return 404 even with a trailing slash.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [{
      source: "/:path((?!obekty(?:/|$)|proekty(?:/|$)).+)/",
      destination: "/:path",
      permanent: true,
    }];
  },
};

export default nextConfig;
