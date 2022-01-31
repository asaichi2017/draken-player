import videojs from 'video.js'
import { getResumeLog, refreshResumeLog, saveResumeLog } from './ResumeLog'

const Plugin = videojs.getPlugin('plugin')

export class PlaybackResumePlugin extends Plugin {
  protected videoId: string | null = null
  setup(options: { videoId: string }) {
    this.videoId = options.videoId
    window.addEventListener('beforeunload', this.listener.beforeunload)
    this.player.on('pause', this.listener.pause)
    this.player.on('loadeddata', this.listener.loadeddata)
  }

  dispose() {
    if (this.videoId) {
      saveResumeLog(this.videoId, this.player.currentTime())
    }
    window.removeEventListener('beforeunload', this.listener.beforeunload)
    this.player.off('pause', this.listener.pause)
    this.player.off('loadeddata', this.listener.loadeddata)
  }

  listener = {
    beforeunload: () => {
      if (!this.videoId) return
      saveResumeLog(this.videoId, this.player.currentTime())
    },
    pause: () => {
      if (!this.videoId) return
      saveResumeLog(this.videoId, this.player.currentTime())
    },
    loadeddata: () => {
      if (!this.videoId) return
      refreshResumeLog()
      const time = getResumeLog(this.videoId)
      if (time) {
        this.player.currentTime(time)
      }
    },
  }
}
