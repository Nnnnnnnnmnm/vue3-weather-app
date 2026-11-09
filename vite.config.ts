import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * 两个构建目标共用同一份源码：
 * - npm run build        => 常规产物（deploy 到任意静态服务器）
 * - npm run build:single => 把所有 JS/CSS 内联进 index.html，得到一个可直接双击打开的单文件 demo
 */
export default defineConfig(({ mode }) => ({
  plugins: [vue(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: {
    target: 'es2020',
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    emptyOutDir: true
  }
}))
