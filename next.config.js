const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PPR (Partial Prerendering) — requires next@canary. Enable when upgrading:
  // experimental: { ppr: 'incremental' },
};

module.exports = withNextIntl(nextConfig);
