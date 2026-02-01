import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true, // Extensions can't use Next.js Image Optimization
  },
};

export default nextConfig;