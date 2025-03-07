import { defineConfig } from 'vite';

export default defineConfig({
  base: '/drone1/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist', // Output folder for build files
  },
  server: {
    port: 3000, // You can change this port if needed
    open: true, // Opens browser automatically
  },
});
