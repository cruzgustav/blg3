import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Desabilitar geração de source maps para reduzir tamanho
  productionBrowserSourceMaps: false,

  // Configuração do webpack para reduzir tamanho
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Desabilitar cache do webpack no servidor
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
