import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import documentTitlePlugin from './plugins/vite-plugin-document-title';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), documentTitlePlugin('llm-chat')],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
