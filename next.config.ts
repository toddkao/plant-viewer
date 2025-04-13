import withPWA from "next-pwa";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);