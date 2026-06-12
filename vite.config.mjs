import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const desktopDir = path.join(rootDir, "desktop")

export default defineConfig({
  root: desktopDir,
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./desktop/src") // @ 指向 src
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: {
      allow: [rootDir],
    },
  },
  build: {
    outDir: path.join(rootDir, "dist"),
    emptyOutDir: true,
  },
})
