import videojs from 'video.js'

const MenuItem = videojs.getComponent('MenuItem')

export class QualityChangeMenuItem extends MenuItem {
  constructor(player: any, protected qualityLevel: any, protected onClick: () => void, options: any) {
    super(player, { ...options, selectable: true, multiSelectable: false })
  }

  handleClick(event: any) {
    super.handleClick(event)
    const qualityLevels = this.player().qualityLevels()
    ;[...Array(qualityLevels.length).keys()].forEach(i => {
      qualityLevels[i].enabled = false
    })
    this.qualityLevel.enabled = true
    // 例えばユーザーが`auto(360p)`から`360p`に変更した時、再生する解像度自体は変わらないので、changeイベントが起きない
    // でもメニューの選択肢のハイライトにはユーザーの選択したものを反映させたいので手動で更新用関数を呼ぶ
    this.onClick()
  }
}

export class QualityChangeAutoMenuItem extends QualityChangeMenuItem {
  handleClick() {
    const qualityLevels = this.player().qualityLevels()
    ;[...Array(qualityLevels.length).keys()].forEach(i => {
      qualityLevels[i].enabled = true
    })
    this.onClick()
  }
}
