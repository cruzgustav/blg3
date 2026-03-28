import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Desabilitar geração de source maps para reduzir tamanho
  productionBrowserSourceMaps: false,
};

export default nextConfig;
