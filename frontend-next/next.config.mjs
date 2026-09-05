/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exporta el sitio a HTML estático (out/) que sirve el backend Express
  output: 'export',
  images: {
    // Sin optimización de imágenes servida por Next: Express sirve el estático
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Avatares de Google
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
    ],
  },
};

export default nextConfig;
