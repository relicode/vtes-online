import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
