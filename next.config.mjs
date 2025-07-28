/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "portfolio-image-store.s3.ap-south-1.amazonaws.com",
      },
      {
        hostname: "cdn.sanity.io",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;
