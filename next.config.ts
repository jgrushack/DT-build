import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "crypto-browserify": "crypto-browserify",
      fs: { browser: "./src/lib/empty.js" },
      path: { browser: "path-browserify" },
      stream: { browser: "stream-browserify" },
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      fs: false,
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
    };
    return config;
  },
};

export default nextConfig;
