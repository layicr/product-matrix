const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 将本地只读库随函数打包（Vercel 只读 FS 下用 file: 时需显式纳入 trace）。
  outputFileTracingIncludes: {
    '/**/*': ['./data/**/*'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'X-DNS-Prefetch-Control', value: 'on'},
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
