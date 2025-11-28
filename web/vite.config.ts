import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss() as unknown as PluginOption,
  ],
})