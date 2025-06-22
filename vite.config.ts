import { defineConfig } from 'vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss(), mockDevServerPlugin({log: 'debug', wsPrefix: ['/ws']})],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
