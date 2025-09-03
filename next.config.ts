import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Konfigurasi yang sudah ada (TETAP DIPERTAHANKAN)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mbh-storage.s3.ap-southeast-2.amazonaws.com',
        pathname: '/netflix100/profile-pictures/**',
      },
    ],
  },

  // ==========================================================
  // PENAMBAHAN KONFIGURASI PROXY UNTUK DEVELOPMENT LOKAL
  // ==========================================================
  async rewrites() {
    return [
      {
        // 'source' harus cocok persis dengan baseURL di file axios.ts Anda.
        // Ini akan menangkap semua permintaan yang dimulai dengan /api/v1/...
        source: '/api/v1/:path*',

        // 'destination' adalah URL backend Anda di Render.
        // Next.js akan mengganti `:path*` dengan sisa URL dari 'source'.
        destination: 'https://netflix-be-1.onrender.com/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
