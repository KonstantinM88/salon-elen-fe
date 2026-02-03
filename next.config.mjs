/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: { bodySizeLimit: "10mb" },
    },
    images: {
      remotePatterns: [{ protocol: "https", hostname: "lbar.com.ua" }],
      formats: ["image/avif", "image/webp"],
      deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920, 2400],
      // Минимальный кэш для динамических изображений
      minimumCacheTTL: 0,
    },
  };
export default nextConfig;
