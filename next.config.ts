import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  
  // Expor variáveis de ambiente para o Edge Runtime
  env: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  },
};

export default nextConfig;
