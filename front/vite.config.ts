import * as path from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), eslintPlugin()],
  resolve: {
    alias: {
      '@dto': path.resolve(__dirname, '../dto'),
    },
  },
})
