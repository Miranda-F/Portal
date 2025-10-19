import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* opções de configuração aqui */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desativar hot reload do Next.js, tratado por nodemon
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Desativar hot module replacement do webpack
      config.watchOptions = {
        ignored: ['**/*'], // Ignorar todas as mudanças de arquivo
      };
    }
    return config;
  },
  eslint: {
    // Ignorar erros ESLint durante o build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
