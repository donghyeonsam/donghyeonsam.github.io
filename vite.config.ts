import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// donghyeonsam.github.io is a GitHub Pages *user* site, served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
