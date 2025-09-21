import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Konfigurasi yang sudah ada (TETAP DIPERTAHANKAN)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'mbh-storage.s3.ap-southeast-2.amazonaws.com',
  //       pathname: '/netflix100/profile-pictures/**',
  //     },
  //   ],
  // },

  // // ==========================================================
  // // PENAMBAHAN KONFIGURASI PROXY UNTUK DEVELOPMENT LOKAL
  // // ==========================================================
  // async rewrites() {
  //   return [
  //     {
  //       // 'source' harus cocok persis dengan baseURL di file axios.ts Anda.
  //       // Ini akan menangkap semua permintaan yang dimulai dengan /api/v1/...
  //       source: '/api/v1/:path*',

  //       // 'destination' adalah URL backend Anda di Render.
  //       // Next.js akan mengganti `:path*` dengan sisa URL dari 'source'.
  //       destination: 'https://netflix-be-1.onrender.com/v1/:path*',
  //     },
  //   ];
  // },

  // ==========================================================
  // SECURITY HEADERS CONFIGURATION
  // ==========================================================
  async headers() {
    return [
      {
        // Terapkan security headers ke semua route
        source: '/(.*)',
        headers: [
          {
            // HSTS - HTTP Strict Transport Security
            // Memaksa browser untuk selalu menggunakan HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            // X-Frame-Options - Mencegah clickjacking
            // Mencegah website diembed dalam iframe di situs lain
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            // X-Content-Type-Options - Mencegah MIME-sniffing attacks
            // Mencegah browser menebak tipe konten yang berbeda dari yang dideklarasikan
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // X-DNS-Prefetch-Control - Kontrol DNS prefetching
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            // Referrer-Policy - Kontrol informasi referrer
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            // Permissions-Policy - Kontrol browser features
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=()'
          },
          {
            // Content Security Policy (CSP)
            // Policy yang sangat permissive untuk MediaPipe dan external resources
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://storage.googleapis.com https://*.youtube.com https://*.ytimg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' data: blob: https: mediastream:",
              "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com https://netflix-be-1.onrender.com wss: ws:",
              "worker-src 'self' blob:",
              "child-src 'self' blob: https://*.youtube.com",
              "frame-src 'self' https://*.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;