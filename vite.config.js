
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/ListingsApp.jsx'),
      name: 'ListingsBundle', 
      fileName: (format) => `react-listings-bundle.js`,
      formats: ['umd'] 
    },
    outDir: 'dist',
    sourcemap: true,
  },
});