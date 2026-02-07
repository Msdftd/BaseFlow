import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Externalize all dependencies loaded via importmap
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
