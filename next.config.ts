// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ====== ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЙ ======
  images: {
    // Форматы: сначала AVIF (лучшее сжатие), потом WebP
    formats: ['image/avif', 'image/webp'],
    
    // Размеры для srcset
    deviceSizes: [320, 360, 420, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Для динамически загружаемых изображений держим TTL коротким.
    minimumCacheTTL: 60,
    
    // Если изображения на внешнем домене, раскомментируйте:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'permanent-halle.de',
        pathname: '/uploads/**',
      },
    ],
  },

  // ====== ОПТИМИЗАЦИЯ СБОРКИ ======
  
  // Оптимизация импортов (tree-shaking для больших библиотек)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
  },

  // ====== ЗАГОЛОВКИ ДЛЯ КЕШИРОВАНИЯ ======
  async headers() {
    return [
      {
        // Allow microphone in this document (required for getUserMedia in production)
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self)',
          },
        ],
      },
      {
        // Кеширование загруженных изображений
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;





// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
