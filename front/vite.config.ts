import * as path from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020', 'ios13', 'safari13'],
  },
  plugins: [svelte(), splitVendorChunkPlugin()],
  resolve: {
    alias: {
      '@dto': path.resolve(__dirname, '../dto'),
    },
  },
})
