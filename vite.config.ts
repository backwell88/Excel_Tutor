import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getHttpsServerOptions } from "office-addin-dev-certs";

export default defineConfig(async () => ({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    https: await getHttpsServerOptions(),
  },
}));