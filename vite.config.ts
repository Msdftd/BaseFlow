import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Externalize dependencies that are loaded via importmap in index.html
      // This prevents Rollup from failing when it can't find them in node_modules during build
      external: [
        '@farcaster/frame-sdk',
      ],
    }
  }
});
