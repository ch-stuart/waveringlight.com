import { defineConfig } from "astro/config";
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [sitemap()],
  output: "static",
  outDir: "./docs",
  prefetch: true,
  site: "https://www.waveringlight.com",
  vite: {
    build: { emptyOutDir: false },    
  },
});
