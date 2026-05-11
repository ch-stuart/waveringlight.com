import { defineConfig } from "astro/config";


export default defineConfig({
  output: "static",
  outDir: "./docs",
  prefetch: true,
  site: "https://www.waveringlight.com",
  vite: {
    build: { emptyOutDir: false },    
  },
});
