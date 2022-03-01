import videojs from 'video.js'
import { ThumbnailPreviewPlugin } from './plugin'

videojs.registerPlugin('thumbnailPreview', ThumbnailPreviewPlugin)

declare module 'video.js' {
  interface VideoJsPlayer {
    thumbnailPreview: () => ThumbnailPreviewPlugin
  }
}
