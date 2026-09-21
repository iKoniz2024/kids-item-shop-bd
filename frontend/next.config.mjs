// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'standalone',
// };

// export default nextConfig;



import EventEmitter from 'events';

// Increase max listeners to suppress Turbopack memory leak warnings in dev mode
EventEmitter.defaultMaxListeners = 100;

/** @type {import('next').NextConfig} */

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);

const nextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' }),
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/products',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
