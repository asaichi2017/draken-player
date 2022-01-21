import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels'
import './QualityChangeMenuPlugin/register'
import './PlaybackResumePlugin/register'
import { getVideoUrl, Tokens, playLogs, VideoUrlApiResponse } from './api'
import './style.css'

// 動画の署名の有効期限をチェックする間隔
// 実際はexpireの少し前になったらAPIリクエストを送る
const intervalToCheckSign = 1 * 60 * 1000
// expire丁度にsignを更新しようとするとAPIリクエストに時間がかかったりしたら失敗するので少し余裕を持たせる
const bufferTimeToCheckSign = 1 * 60 * 1000

export type PlayerOptions = RequestOptions & PlayOptions

export type RequestOptions = {
  endpoint?: string
  apiKey?: string
  idToken?: () => Promise<string> | string
  adminToken?: () => Promise<string> | string
}

export type PlayOptions = {
  // 再生速度変更機能の有効無効
  enablePlaybackRates?: boolean | number[]
  // 途中再生機能の有効無効
  enablePlaybackResume?: boolean
  // videoタグのDOMのサイズ設定
  layout?: 'fill' | 'fluid' | 'none'
}

const defaultOptions: PlayerOptions = {
  enablePlaybackRates: true,
  enablePlaybackResume: true,
  layout: 'fluid',
}

class Player {
  protected player: videojs.Player | null = null
  protected timer: number | null = null
  protected contentUrl?: string
  protected poster?: string
  protected sign?: VideoUrlApiResponse['sign']
  protected contentID!: string
  protected options: PlayerOptions

  constructor(protected dom: string | HTMLVideoElement, options: PlayerOptions = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
    const embedEndpoint = String(import.meta.env.VITE_EMBED_ENDPOINT)
    if (embedEndpoint.startsWith('http')) {
      this.options.endpoint = embedEndpoint
    }
    if (!this.options.endpoint) {
      throw new Error('endpointを指定してください')
    }

    this.player = this.createPlayer(dom)
  }

  async load(contentID: string) {
    this.contentID = contentID
    this.setupPlayer()
  }

  // tokenを取得する。
  protected async getTokens(): Promise<Tokens> {
    const tokens: Tokens = {}
    if (this.options.adminToken) {
      tokens.adminToken = await this.options.adminToken()
    }
    if (this.options.idToken) {
      tokens.idToken = await this.options.idToken()
    }
    if (this.options.apiKey) {
      tokens.apiKey = this.options.apiKey
    }
    return tokens
  }

  protected createPlayer(dom: string | HTMLVideoElement) {
    const player = videojs(dom, {
      controls: true,
      ...(this.options.enablePlaybackRates
        ? {
            playbackRates: Array.isArray(this.options.enablePlaybackRates)
              ? this.options.enablePlaybackRates
              : [0.75, 1, 1.5, 2], // 倍速
          }
        : {}),
    })
    player.contentEl().classList.add('video-js')
    if (this.options.layout === 'fill') {
      player.contentEl().classList.add('vjs-fill')
    } else if (this.options.layout === 'fluid') {
      player.contentEl().classList.add('vjs-fluid')
    }
    player.contentEl().classList.add('vjs-big-play-centered')
    player.contentEl().classList.add('vjs-waiting')
    return player
  }

  protected async setupPlayer() {
    if (!this.contentID) {
      throw new Error('contenIDを指定してください')
    }

    try {
      // m3u8の場所やポスターのURLなどを取得
      const response = await getVideoUrl(
        this.options.endpoint!,
        this.contentID,
        await this.getTokens(),
        true,
        !this.canHookRequest(),
      )
      this.contentUrl = response.playListUrl
      this.poster = response.posterUrl
      this.sign = response.sign
    } catch (error) {
      this.player?.error('動画を取得できませんでした')
      return
    }

    this.player?.playbackResume().dispose()
    if (this.options.enablePlaybackResume ?? true) {
      this.player?.playbackResume().setup({ videoId: this.contentID })
    }
    if (this.canHookRequest()) {
      this.player?.qualityChangeMenu().dispose()
      this.player?.qualityChangeMenu().setup()
    }

    this.player?.src({ type: 'application/x-mpegURL', src: this.contentUrl })
    this.player?.poster(`${this.poster}`)

    this.timer = setInterval(() => {
      this.checkSignExpire()
    }, intervalToCheckSign)

    if (this.canHookRequest()) {
      // queryパラメーターを使ってsignを送る方式
      const Vhs = (videojs as any).Vhs
      Vhs.xhr.beforeRequest = (options: any) => {
        const isApi = options.uri.startsWith(this.options.endpoint!)
        if (isApi) {
          options.uri = `${options.uri}?contentToken=${this.sign?.contentToken ?? ''}`
        } else {
          options.uri = `${options.uri}?${this.sign?.sign ?? ''}`
        }
        return options
      }
    }

    this.player?.one('play', async () => {
      await playLogs(this.options.endpoint!, this.contentID, await this.getTokens())
    })
  }

  protected async checkSignExpire() {
    if (!this.sign) {
      return
    }
    const expire = this.sign.expires * 1000
    if (expire - Date.now() < intervalToCheckSign + bufferTimeToCheckSign) {
      await this.refreshSign()
    }
  }

  protected async refreshSign(): Promise<void> {
    const response = await getVideoUrl(
      this.options.endpoint!,
      this.contentID,
      await this.getTokens(),
      false,
      !this.canHookRequest(),
    )
    if (!this.canHookRequest()) {
      // requestをhookしてqueryパラメーターにsignを送る方法が使えない
      // 新しいsignが入っているm3u8を取得して差し替える
      this.contentUrl = response.playListUrl
      const time = this.player?.currentTime()
      const resume = !this.player?.paused()
      this.player?.src({ type: 'application/x-mpegURL', src: this.contentUrl })
      if (resume) {
        await this.player?.play()
      }
      if (time) {
        this.player?.currentTime(time)
      }
    }
    this.sign = response.sign
  }

  /**
   * m3u8やtsファイルへのリクエストをフックできるか
   * できるならcontentTokenやsignを差し込める
   * できない場合はAPI側でcontentTokenやsignを挿入したURLを返す必要がある
   */
  protected canHookRequest(): boolean {
    const tech: any = videojs.getTech('Html5')
    const mockSrc = { type: 'application/x-mpegURL', src: '' }
    const sourceHandler = tech.selectSourceHandler(mockSrc)
    return sourceHandler.name === 'videojs-http-streaming'
  }

  dispose() {
    this.player?.dispose()
    this.player = null
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

const draken = {
  player(dom: string | HTMLVideoElement, options: PlayerOptions) {
    return new Player(dom, options)
  },
}

export type PlayerInterface = Player

export default draken
