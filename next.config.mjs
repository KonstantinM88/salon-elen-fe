/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: { bodySizeLimit: "10mb" }, // чтобы action принимал файл
    },
    images: {
      // опционально: если используешь внешние URL
      remotePatterns: [{ protocol: "https", hostname: "lbar.com.ua" }],
      formats: ["image/avif", "image/webp"],
      deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920, 2400],
    },
  };
  
  export default nextConfig;
  