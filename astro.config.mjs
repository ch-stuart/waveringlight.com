import { defineConfig } from "astro/config";


export default defineConfig({
  output: "static",
  outDir: "./docs",
  site: "https://www.waveringlight.com",
  vite: {
    build: { emptyOutDir: false },    
  },
});
