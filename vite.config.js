import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Isso é crucial para o funcionamento correto
  resolve: {
    alias: {
      '@': '/workspaces/imobigest/imobigest/src'
    }
  }
})
