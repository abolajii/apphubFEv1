import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: {
      plugins: [
        // Ensure Tailwind CSS is processed correctly
      ],
    },
  },
  build: {
    // Ensure CSS is properly optimized
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Better asset naming for CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
