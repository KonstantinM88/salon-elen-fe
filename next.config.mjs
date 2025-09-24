/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: { bodySizeLimit: "10mb" }, // чтобы action принимал файл
    },
    images: {
      // опционально: если используешь внешние URL
      remotePatterns: [{ protocol: "https", hostname: "lbar.com.ua" }],
      formats: ["image/avif", "image/webp"],
    },
  };
  
  export default nextConfig;
  