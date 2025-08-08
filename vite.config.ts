import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/Self-discipline-clock-in-software/', // 修正为你的 GitHub 仓库名称
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})
