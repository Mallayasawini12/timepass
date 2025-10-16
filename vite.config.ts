import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      external: [
        '@rollup/rollup-linux-x64-gnu'
      ],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast'
          ]
        },
        format: 'es'
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      transformMixedEsModules: true
    },
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
});
