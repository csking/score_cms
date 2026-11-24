import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 部署到 GitHub Pages / 子路径时可改 base: '/score_cms/'
  base: './',
})
