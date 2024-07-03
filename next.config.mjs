import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pwa: {
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: false,
    swcMinify: true,
    workboxOptions: {
      disableDevLogs: true,
    },
  },
  webpack: (config, { isServer }) => {
    // WebAssembly configuration
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';

    // Optionally, add a rule for .wasm files if needed
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // If it's the client-side bundle, add the WASM path
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default withPWA(nextConfig);