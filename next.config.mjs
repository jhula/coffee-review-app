/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.coffeereview.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "coffeereview.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
