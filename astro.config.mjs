import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://sparkwing.com.au",
  output: "static",
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
