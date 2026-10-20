import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.8.31', '192.168.8.63', '127.0.0.1', '172.26.160.1'],
  async redirects() {
    return [
      {
        source: "/proekty",
        destination: "/obekty",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
