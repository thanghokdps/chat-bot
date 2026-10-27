import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Agent stack runs on the Node runtime only (ADR 0001); keep it out of the bundler.
  serverExternalPackages: ["@copilotkit/runtime", "@langfuse/otel", "pg"],
};

export default nextConfig;
