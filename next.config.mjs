/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/landing',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig;
