import type { NextConfig } from "next";

const devUploadsFallbackOrigin =
  process.env.DEV_UPLOADS_FALLBACK_ORIGIN?.replace(/\/+$/, "") ||
  "https://permanent-halle.de";

const nextConfig: NextConfig = {
  deploymentId: process.env.DEPLOYMENT_VERSION,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: { bodySizeLimit: "10mb" },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    deviceSizes: [320, 360, 420, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 2400],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480],
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "permanent-halle.de",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lbar.com.ua",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "microphone=(self)",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return {
      fallback: [
        {
          source: "/uploads/:path*",
          destination: `${devUploadsFallbackOrigin}/uploads/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
