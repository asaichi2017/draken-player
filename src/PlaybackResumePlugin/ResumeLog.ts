const KEY = 'playback-resume-plugin'
// この期間が過ぎた再生履歴は無効とする
const defaultExpireLimit = 7 * 24 * 60 * 60 * 1000

type Entry = { time: number; createdAt: number }
type AllEntry = { [id: string]: Entry }

function isExpire(entry: Entry, expireLimit: number): boolean {
  return Date.now() - entry.createdAt > expireLimit
}

/**
 * `entries`の中から古い再生履歴を省いたものを返す
 */
function filterValidEntries(entries: AllEntry, expireLimit: number): AllEntry {
  const filtered = Object.keys(entries).reduce((prev, cur) => {
    if (!isExpire(entries[cur], expireLimit)) {
      prev[cur] = entries[cur]
    }
    return prev
  }, {} as AllEntry)
  return filtered
}

/**
 * 古い再生履歴は削除する
 */
export function refreshResumeLog(expireLimit = defaultExpireLimit): void {
  const entries = getAllResumeLog()
  const filtered = filterValidEntries(entries, expireLimit)
  localStorage.setItem(KEY, JSON.stringify(filtered))
}

export function saveResumeLog(videoId: string, time: number): void {
  const current = getAllResumeLog()
  current[videoId] = { time, createdAt: Date.now() }
  localStorage.setItem(KEY, JSON.stringify(current))
}

export function getResumeLog(videoId: string): number | null {
  const logs = getAllResumeLog()
  return logs[videoId] ? Number(logs[videoId].time) : null
}

function getAllResumeLog(): AllEntry {
  const item = localStorage.getItem(KEY)
  return item ? JSON.parse(item) : {}
}
