import draken from './player'
export default draken

const thisScriptUrl: string = (document.currentScript as any).src
const urls = thisScriptUrl.split('/')
urls[urls.length - 1] = 'draken-player.css'

const link = document.createElement('link')
link.rel = 'stylesheet'
link.type = 'text/css'
link.href = urls.join('/')
document.head.appendChild(link)
