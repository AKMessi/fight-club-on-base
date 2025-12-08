/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Fixes Module not found errors during Vercel build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
    }
    return config;
  },
};

export default nextConfig;