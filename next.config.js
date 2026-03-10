const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Next.js 16: moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['mongodb'],
  // Empty turbopack config to avoid error (we use webpack for Windows compatibility)
  turbopack: {},
  // Use webpack instead of turbopack (due to Windows bug)
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    // Production: use CORS_ORIGINS env var. Development: default to localhost
    const corsOrigins = process.env.CORS_ORIGINS || (isDev ? 'http://localhost:3000' : '')

    return [
      {
        source: "/(.*)",
        headers: [
          // Security: Prevent clickjacking attacks
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Security: Only allow this site to be embedded in same origin
          { key: "Content-Security-Policy", value: "frame-ancestors 'self';" },
          // Security: Only allow API access from specified origins
          { key: "Access-Control-Allow-Origin", value: corsOrigins },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          // Security: Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Security: Enable XSS filter
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
