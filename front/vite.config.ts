import * as path from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), splitVendorChunkPlugin()],
  resolve: {
    alias: {
      '@dto': path.resolve(__dirname, '../dto'),
    },
  },
})
