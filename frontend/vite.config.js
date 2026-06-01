import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const normalizedId = id.replace(/\\/g, "/");
            const vendorPackages = [
              "react-icons",
              "axios"
            ];
            const isVendor = vendorPackages.some(pkg => 
              normalizedId.includes(`/node_modules/${pkg}/`) ||
              (normalizedId.includes("/node_modules/.pnpm/") && normalizedId.includes(`/${pkg}/`))
            );
            if (isVendor) {
              return "vendor";
            }
          }
        },
      },
    },
  },
});

