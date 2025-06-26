import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      // Visualize bundle size (only in production build)
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/bundle-analyzer-report.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      open: true,
    },
    
    preview: {
      port: 4173,
      strictPort: true,
      host: true,
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['axios', 'react-icons', 'react-toastify'],
          },
        },
      },
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    
    define: {
      'process.env': { ...env },
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
