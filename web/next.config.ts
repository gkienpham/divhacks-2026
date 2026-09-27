import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ponytail: design components are untyped .jsx; don't let type noise block the demo build.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
