import videojs from 'video.js'
import { QualityChangeMenuPlugin } from './plugin'

videojs.registerPlugin('qualityChangeMenu', QualityChangeMenuPlugin)

declare module 'video.js' {
  interface VideoJsPlayer {
    qualityChangeMenu: () => QualityChangeMenuPlugin
  }
}
