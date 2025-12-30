import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirects any request starting with /chat or /feedback to port 3000
      '/chat': 'http://localhost:3000',
      '/feedback': 'http://localhost:3000',
    }
  }
})
