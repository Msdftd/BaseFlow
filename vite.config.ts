import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Prevent Vite from trying to pre-bundle these missing dependencies
  optimizeDeps: {
    exclude: ['@farcaster/frame-sdk', '@google/genai']
  },
  build: {
    rollupOptions: {
      // Tell Rollup these are external and will be available via global variables (from importmap)
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        'recharts',
        'lucide-react',
        '@google/genai',
        '@farcaster/frame-sdk'
      ]
    }
  },
  define: {
    // Safely provide API key from environment variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
