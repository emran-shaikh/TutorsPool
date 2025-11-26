import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [".replit.dev", ".repl.co"],
    proxy: {
      '/api': 'http://localhost:5174'
    }
  },
  plugins: [
    react()
  ].filter(Boolean),
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase chunk size warning limit to 1500kb
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    sourcemap: mode !== 'production',
    reportCompressedSize: false,
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // React core - ensure React is bundled together
            if (id.includes('react/') || (id.includes('react') && !id.includes('react-'))) {
              return 'react-core';
            }
            
            // Radix UI: keep all together to avoid splitting internal helpers across chunks
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // UI libraries
            if (id.includes('lucide-react') || id.includes('date-fns') || id.includes('class-variance-authority')) {
              return 'ui-utils';
            }
            
            // Query and state management - but keep React context separate
            if (id.includes('@tanstack/react-query')) {
              return 'query-management';
            }
            
            if (id.includes('react-hook-form')) {
              return 'form-management';
            }
            
            // Socket and real-time
            if (id.includes('socket.io-client')) {
              return 'realtime';
            }
            
            // Payment and external services
            if (id.includes('stripe') || id.includes('@stripe') || id.includes('@supabase')) {
              return 'external-services';
            }
            
            // Charts and visualization
            if (id.includes('recharts') || id.includes('highlight.js')) {
              return 'visualization';
            }
            
            // Router and navigation
            if (id.includes('react-router')) {
              return 'routing';
            }
            
            // Other large dependencies
            if (id.includes('axios') || id.includes('zod') || id.includes('uuid')) {
              return 'utils';
            }
            
            // Split remaining vendor into smaller chunks
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'text-processing';
            }
            
            if (id.includes('prisma') || id.includes('@prisma')) {
              return 'database';
            }
            
            if (id.includes('bcrypt') || id.includes('jsonwebtoken')) {
              return 'auth-utils';
            }
            
            if (id.includes('express') || id.includes('cors')) {
              return 'server-utils';
            }
            
            // Default vendor chunk for everything else
            return 'vendor';
          }
        }
      }
    }
  }
}));
