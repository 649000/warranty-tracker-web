/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for undici module parse failed error
    // Exclude undici from webpack processing as it contains private class fields
    // that webpack can't parse without additional configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "undici": false
      };
    }

    return config;
  }
};

module.exports = nextConfig;
