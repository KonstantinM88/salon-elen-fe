/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: { bodySizeLimit: "10mb" },
    },
    images: {
      remotePatterns: [{ protocol: "https", hostname: "lbar.com.ua" }],
      formats: ["image/avif", "image/webp"],
      qualities: [60, 70, 75],
      deviceSizes: [320, 360, 420, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 2400],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480],
      // Минимальный кэш для динамических изображений
      minimumCacheTTL: 0,
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
      ];
    },
  };
export default nextConfig;
