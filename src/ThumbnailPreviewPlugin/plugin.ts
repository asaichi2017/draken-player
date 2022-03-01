import videojs from 'video.js'

const Plugin = videojs.getPlugin('plugin')
export class ThumbnailPreviewPlugin extends Plugin {
  setup(thumbnailUrlGetter: (time: number) => string) {
    this.player?.one('loadeddata', () => {
      const controlBar: any = this.player?.controlBar
      const timeTooltip = controlBar?.['progressControl']?.['seekBar']?.['mouseTimeDisplay']?.['timeTooltip']
      if (!timeTooltip) return

      const $thumbnail = timeTooltip.el()
      const original = timeTooltip.updateTime.bind(timeTooltip)
      timeTooltip.updateTime = function (seekBarRect: any, seekBarPoint: any, time: any, cb: any) {
        original(seekBarRect, seekBarPoint, time, cb)
        const url = thumbnailUrlGetter(time)
        $thumbnail.style.setProperty('background-image', `url("${url}")`)
      }
    })
  }
}
