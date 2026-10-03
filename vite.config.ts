import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localContentPlugin } from './server/localContent';

export default defineConfig({
  plugins: [
    localContentPlugin(),
    tailwindcss(),
    react()
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: false,
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.portfolio-data/**'] },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-phaser': ['phaser'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
