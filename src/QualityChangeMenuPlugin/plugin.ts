import videojs from 'video.js'
import { QualityChangeMenuButton } from './QualityChangeMenuButton'
import LastSelectedQuality from './LastSelectedQuality'

const Plugin = videojs.getPlugin('plugin')
export class QualityChangeMenuPlugin extends Plugin {
  protected button: QualityChangeMenuButton | null = null

  setup(options?: { position?: number; rememberSelectedQuality?: boolean }) {
    if (!this.player.controlBar) return
    const menuPosition = options?.position ?? -3
    this.button = this.player.controlBar.addChild(
      new QualityChangeMenuButton(this.player),
      {},
      menuPosition > 0
        ? menuPosition
        : // -1の時に最後尾
          menuPosition + this.player.controlBar.children().length + 1,
    )

    if (options?.rememberSelectedQuality ?? true) {
      new LastSelectedQuality().setup(this.player)
    }
  }

  dispose() {
    if (this.player.controlBar && this.button) {
      this.player.controlBar.removeChild(this.button)
    }
  }
}
