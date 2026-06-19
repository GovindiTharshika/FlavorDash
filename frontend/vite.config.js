import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      // PayHere's checkout popup loads jQuery which uses `unload`; allow it in dev.
      'Permissions-Policy': 'unload=(self)'
    }
  }
})
