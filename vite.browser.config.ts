import path from 'path'
import { UserConfig, LibraryOptions } from 'vite'
import base from './vite.config'

const config = base as UserConfig

config.build.rollupOptions.external = []
config.build.emptyOutDir = false
;(config.build.lib as LibraryOptions).entry = path.resolve(__dirname, 'src/browser.ts')
;(config.build.lib as LibraryOptions).formats = ['umd']
;(config.build.lib as LibraryOptions).fileName = () => 'draken-player.js'

export default config
