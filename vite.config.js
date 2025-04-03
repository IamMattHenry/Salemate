import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "public/main-resources/*.html", dest: "" }  // Copy all HTML to dist/
      ]
    }),
  ],
})