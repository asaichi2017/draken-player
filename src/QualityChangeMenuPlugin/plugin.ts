import videojs from 'video.js'
import { QualityChangeMenuButton } from './QualityChangeMenuButton'

const Plugin = videojs.getPlugin('plugin')
export class QualityChangeMenuPlugin extends Plugin {
  protected button: QualityChangeMenuButton | null = null

  setup(options?: { position?: number }) {
    const menuPosition = options?.position ?? -3
    this.button = this.player.controlBar.addChild(
      new QualityChangeMenuButton(this.player),
      {},
      menuPosition > 0
        ? menuPosition
        : // -1の時に最後尾
          menuPosition + this.player.controlBar.children().length + 1,
    )
  }

  dispose() {
    if (this.button) {
      this.player.controlBar.removeChild(this.button)
    }
  }
}
