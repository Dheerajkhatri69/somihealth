/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization
    domains: ['ik.imagekit.io', 'res.cloudinary.com'], 
  },
  reactStrictMode: false,
};

export default nextConfig;