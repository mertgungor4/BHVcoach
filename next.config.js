/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '192.168.1.21'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.21',
        port: '3000',
        pathname: '/maps/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.21',
        port: '3000',
        pathname: '/logos/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/maps/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/logos/**',
      },
    ],
  },
};

module.exports = nextConfig; 