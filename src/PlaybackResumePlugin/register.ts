import videojs from 'video.js'
import { PlaybackResumePlugin } from './plugin'

videojs.registerPlugin('playbackResume', PlaybackResumePlugin)

declare module 'video.js' {
  interface VideoJsPlayer {
    playbackResume: () => PlaybackResumePlugin
  }
}
