import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      // The entry point for your components
      entry: resolve(__dirname, "src/index.ts"),
      // The global variable name for your library (used in UMD/IIFE bundles)
      name: "FileServerDropzone",
      // The output filenames
      fileName: (format) => `fsdropzone.${format}.js`,
      // Formats to generate (ES modules and UMD are standard)
      formats: ["es", "umd"],
    },
    rollupOptions: {
      // Ensure to externalize deps that shouldn't be bundled
      // into your library (e.g., if you use lit or lodash)
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
    // Minimizing the bundle
    minify: "terser",
    sourcemap: true,
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100, // Optional: checks for changes every 100ms
    },
  },
});
