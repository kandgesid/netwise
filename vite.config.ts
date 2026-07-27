import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://kandgesid.github.io/netwise/ on GitHub Pages, so
// production builds need that repo-name base path; dev server stays at "/".
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? '/netwise/' : '/',
}))
