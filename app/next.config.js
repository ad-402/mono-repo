/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side webpack configuration
      config.resolve.fallback = { 
        fs: false, 
        net: false, 
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
        querystring: false
      };
      
      // Externalize problematic packages
      config.externals.push(
        "pino-pretty", 
        "lokijs", 
        "encoding",
        "@lighthouse-web3/sdk",
        "bls-eth-wasm"
      );
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: [
    '@metamask/sdk',
    '@lighthouse-web3/sdk',
    'bls-eth-wasm'
  ],
};

module.exports = nextConfig;
