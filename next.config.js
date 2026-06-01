const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We can add remotePatterns or other configs if needed later
};

module.exports = withNextIntl(nextConfig);
