import videojs from 'video.js'
import { QualityChangeMenuItem, QualityChangeAutoMenuItem } from './QualityChangeMenuItem'

const MenuButton = videojs.getComponent('MenuButton')

export class QualityChangeMenuButton extends MenuButton {
  $label?: HTMLElement

  constructor(player: any, options?: any) {
    super(player, options)

    MenuButton.apply(this, [player, options])

    player.qualityLevels().on('change', () => {
      this.update()
    })
    player.qualityLevels().on('addqualitylevel', () => {
      this.update()
    })
  }

  createEl() {
    const el = super.createEl()
    el.classList.add('vjs-quality-change-menu-button')
    this.$label = document.createElement('div')
    this.$label.classList.add('vjs-quality-change-menu-label')
    el.appendChild(this.$label)
    return el
  }

  update() {
    super.update()
    if (this.$label) {
      const qualityLevels = this.player().qualityLevels()
      const selected = qualityLevels[qualityLevels.selectedIndex]
      this.$label.textContent = selected ? `${selected.height}p` : ''
    }
  }

  createItems() {
    const qualityLevels = this.player().qualityLevels()
    const onClick = () => this.update()
    const items = [...Array(qualityLevels.length).keys()].map(i => {
      const level = qualityLevels[i]
      const label = `${level.height}p`
      return new QualityChangeMenuItem(
        this.player_,
        level,
        () => {
          onClick()
          this.player_.trigger('QualityChangeMenuPlugin:change', level)
          // this.player_.trigger({ type: 'QualityChangeMenuPlugin:change', data: level })
        },
        {
          label,
        },
      )
    })
    const auto = new QualityChangeAutoMenuItem(
      this.player_,
      null,
      () => {
        onClick()
        this.player_.trigger('QualityChangeMenuPlugin:change', null)
      },
      { label: 'Auto' },
    )

    // 再生される解像度とメニューの選択状態は別の話
    // 例えば
    // メニュの選択状態: auto
    // 再生される解像度: 360p
    // というふうになる
    // `QualityLevels.selectedIndex`は再生される解像度の話
    // `QualityChangeMenuItem.selected`は選択状態
    // `QualityLevel.enabled`は生成される解像度の指定
    const isAutoSelected =
      [...Array(qualityLevels.length).keys()].map(i => qualityLevels[i]).filter(l => l.enabled).length > 1

    auto.selected(isAutoSelected)
    items.forEach((item, i) => {
      item.selected(isAutoSelected ? false : i === qualityLevels.selectedIndex)
    })
    return [...items, auto]
  }
}
