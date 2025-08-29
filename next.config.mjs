/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // async headers() {
  //   const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           // Usando template literal para incluir a URL da API
  //           value: `default-src 'self'; connect-src 'self' ${apiURL};`,
  //         },
  //       ],
  //     },
  //   ];
  // },
}

export default nextConfig
