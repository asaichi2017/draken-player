import { VideoJsPlayer } from 'video.js'
import { QualityLevel } from 'videojs-contrib-quality-levels'

export default class LastSelectedQuality {
  constructor(protected key = 'QualityChangeMenuPlugin') {}

  setup(player: VideoJsPlayer) {
    player.qualityLevels().on('addqualitylevel', ({ qualityLevel }) => {
      const id = qualityLevel.height
      const savedId = this.get()
      const auto = savedId === null
      qualityLevel.enabled = auto ? true : savedId === id
    })
    player.on('QualityChangeMenuPlugin:change', (_, data: QualityLevel | null) => {
      const id = data?.height
      this.save(id ?? null)
    })
  }

  private save(id: number | null) {
    localStorage.setItem(this.key, String(id ?? ''))
  }

  private get(): number | null {
    const id = localStorage.getItem(this.key)
    return id ? Number(id) : null
  }
}
