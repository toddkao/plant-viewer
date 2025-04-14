/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

const { env } = require("process");

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

module.exports = async (phase: any): Promise<import("next").NextConfig> => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: "service-worker/index.ts",
      swDest: "public/sw.js",
      disable: env.NODE_ENV !== "production",
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};