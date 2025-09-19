import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5174'
    }
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase chunk size warning limit to 1500kb
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // React core - ensure React is bundled together
            if (id.includes('react/') || (id.includes('react') && !id.includes('react-'))) {
              return 'react-core';
            }
            
            // Radix UI components (split into smaller chunks)
            if (id.includes('@radix-ui')) {
              if (id.includes('react-dialog') || id.includes('react-dropdown-menu') || id.includes('react-select')) {
                return 'radix-forms';
              }
              if (id.includes('react-avatar') || id.includes('react-badge') || id.includes('react-button')) {
                return 'radix-display';
              }
              if (id.includes('react-navigation') || id.includes('react-menu') || id.includes('react-tabs')) {
                return 'radix-navigation';
              }
              return 'radix-other';
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
