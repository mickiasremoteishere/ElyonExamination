import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const isTauri = env.VITE_TAURI === 'true';
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  // Filter out sourcemap warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('Sourcemap for') || 
         args[0].includes('Sourcemap is likely to be incorrect'))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  return {
    // Base public path when served in development or production
    base: isTauri && isProd ? './' : '/',
    
    // Development server configuration
    server: {
      host: '::',
      port: 8080,
      strictPort: true,
      hmr: isDev ? {
        host: 'localhost',
        protocol: 'ws',
        port: 24678,
        clientPort: 24678,
      } : undefined,
    },

    // Plugins
    plugins: [
      react(),
      isDev && componentTagger()
    ].filter(Boolean),

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Add any other aliases here
      },
    },

    // Build configuration
    build: {
      // Source maps are useful for development but should be disabled in production
      sourcemap: isDev ? 'inline' : false,
      
      // Minify the production build
      minify: isProd ? 'esbuild' : false,
      
      // Output directory
      outDir: 'dist',
      
      // Empty the output directory before building
      emptyOutDir: true,
      
      // Rollup options
      rollupOptions: {
        // Make sure to include all entry points
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        
        // Suppress specific warnings
        onwarn(warning, warn) {
          // Ignore certain warnings
          if (
            warning.code === 'SOURCEMAP_ERROR' ||
            warning.message.includes('Sourcemap is likely to be incorrect') ||
            warning.message.includes('Circular dependency')
          ) {
            return;
          }
          warn(warning);
        },
        
        // Output configuration
        output: {
          // This ensures consistent chunk naming in development and production
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.[a-z0-9]+\.[cm]?js$/.test(name ?? '')) {
              return 'assets/js/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name ?? '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (/\.css$/i.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      
      // Chunk size warning limit (in kbs)
      chunkSizeWarningLimit: 1000,
      
      // Terser options (for production builds)
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      // Add any dependencies that need to be pre-bundled
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        // Add other large dependencies here
      ],
      
      // Force dependency pre-bundling in development
      force: isDev,
    },
    
    // Esbuild configuration
    esbuild: {
      // Drop console.log in production
      drop: isProd ? ['console', 'debugger'] : [],
      
      // JSX factory and fragment
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      
      // Log override to silence certain warnings
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    
    // Environment variables and global definitions
    define: {
      // Process environment variables
      'process.env': {},
      // Vite environment variables
      'import.meta.env.TAURI': JSON.stringify(isTauri),
      'import.meta.env.DEV': JSON.stringify(isDev),
      'import.meta.env.PROD': JSON.stringify(isProd),
      'import.meta.env.MODE': JSON.stringify(mode),
      // Global object handling
      ...(isTauri ? { 'global': 'window' } : { 'global': {} }),
    },
    
    // CSS configuration
    css: {
      // Enable CSS modules by default for .module.css files
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      
      // PostCSS configuration (if needed)
      postcss: {},
      
      // Enable CSS source maps in development
      devSourcemap: isDev,
    },
    
    // Public directory (files in this directory are served at / during dev and copied to the root of dist)
    publicDir: 'public',
    
    // Development server configuration
    preview: {
      port: 8080,
      strictPort: true,
      open: !isTauri,
    },
    
    // Custom logger configuration
    logLevel: isDev ? 'warn' : 'error',
    
    // Clear the screen when restarting the dev server
    clearScreen: false,
  };
});