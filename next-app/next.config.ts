import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    const rules = config.module?.rules;
    if (Array.isArray(rules)) {
      rules.push({
        test: /\.wgsl$/,
        loader: "@vgpu/wgsl/loader-webpack",
      });
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/",
        permanent: true,
      },
      {
        source: "/work/helm-in-house-saas",
        destination: "/work",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
