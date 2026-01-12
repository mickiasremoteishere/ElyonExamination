import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Filter out sourcemap warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        args[0].includes('Sourcemap for') && 
        args[0].includes('points to missing source files')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
        port: 8080,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Add this to suppress sourcemap warnings
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    build: {
      sourcemap: false, // Disable sourcemaps in production
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === 'SOURCEMAP_ERROR') {
            return;
          }
          if (warning.message.includes('Sourcemap is likely to be incorrect')) {
            return;
          }
          defaultHandler(warning);
        }
      }
    }
  };
});