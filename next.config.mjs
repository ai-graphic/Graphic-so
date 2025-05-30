/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['images.clerk.dev', 'uploadcare.com', 'ucarecdn.com'],
  }
};

export default nextConfig;