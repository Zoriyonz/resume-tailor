/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ANTHROPIC_KEY: process.env.ANTHROPIC_KEY,
  },
};

export default nextConfig;