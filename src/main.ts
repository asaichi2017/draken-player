import draken from './player'

function envToString(key: string, env: any): { [key: string]: string } {
  return env ? { [key]: String(env) } : {}
}

function envToFunc(key: string, env: any): { [key: string]: () => string } {
  return env ? { [key]: () => String(env) } : {}
}

// yarn devの時はここがエントリーポイント
const contentID = import.meta.env.VITE_CONTENT_ID as string
const player = draken.player('video', {
  ...envToString('endpoint', import.meta.env.VITE_ENDPOINT),
  ...envToString('apiKey', import.meta.env.VITE_API_KEY),
  ...envToFunc('idToken', import.meta.env.VITE_ID_TOKEN),
  ...envToFunc('adminToken', import.meta.env.VITE_ADMIN_TOKEN),
  // enablePlaybackRates: false,
  // enablePlaybackResume: false,
  // bigPlayButton: false,
  // controlBarそのものを非表示
  // controlBar: false,
  controlBar: {
    // fullscreenToggle: false,
    // pictureInPictureToggle: false,
    // volumePanel: false,
    // playToggle: false,
    // progressControl: false,
    // remainingTimeDisplay: false,
  },
})

const videojsPlayer = player.getRawPlayer()!
videojsPlayer.on('firstplay', () => {
  console.info('videojs event fired: firstplay')
})

player.load(contentID)

const form = document.getElementById('form')!
form.addEventListener('submit', e => {
  e.preventDefault()
  const contentID = (form as any).contentID.value
  player.load(contentID)
})
