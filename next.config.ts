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

  // ==========================================================
  // PENAMBAHAN SECURITY HEADERS UNTUK MENGATASI OWASP ZAP ALERTS
  // ==========================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - Memperbaiki alert medium
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.youtube.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://storage.googleapis.com https://img.youtube.com https://i.ytimg.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com https://www.youtube.com https://netflix-be-1.onrender.com wss:",
              "media-src 'self' https://www.youtube.com",
              "worker-src 'self' blob:",
              "child-src 'self' https://www.youtube.com",
              "frame-src 'self' https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // X-Frame-Options - Mencegah clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options - Mencegah MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer-Policy - Mengontrol informasi referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions-Policy - Mengontrol fitur browser
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=(), payment=(), usb=()'
          },
          // X-XSS-Protection - Perlindungan XSS (meskipun sudah deprecated, masih berguna untuk browser lama)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Strict-Transport-Security - Memaksa HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ],
      },
    ];
  },
};

export default nextConfig;