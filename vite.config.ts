import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3100,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/player.ts'),
      name: 'draken',
      fileName: format => `draken-player.${format}.js`,
    },
    rollupOptions: {
      external: ['axios', 'video.js', 'videojs-contrib-quality-levels'],
      output: {
        assetFileNames: info => {
          if (info.name === 'style.css') {
            return 'draken-player.css'
          } else {
            return info.name
          }
        },
      },
    },
  },
})
