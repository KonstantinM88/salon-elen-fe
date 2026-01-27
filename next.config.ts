// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ====== ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЙ ======
  images: {
    // Форматы: сначала AVIF (лучшее сжатие), потом WebP
    formats: ['image/avif', 'image/webp'],
    
    // Размеры для srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Кеширование на 30 дней
    minimumCacheTTL: 60 * 60 * 24 * 30,
    
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
        // Кеширование загруженных изображений
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
