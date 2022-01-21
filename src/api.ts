import { get, post } from './request'

export type Tokens = {
  idToken?: string
  adminToken?: string
  apiKey?: string
}

type Headers = { [key: string]: string }

/**
 * 認証用のヘッダーを生成する
 * @param tokens
 */
function createAuthHeader(tokens: Tokens): Headers {
  let headers: { [key: string]: string } = {}
  if (tokens.idToken) {
    headers['Authorization'] = tokens.idToken
  }
  if (tokens.apiKey) {
    headers['x-api-key'] = tokens.apiKey
  }
  if (tokens.adminToken) {
    headers['x-admin-authorization'] = tokens.adminToken
  }
  return headers
}

export type VideoUrlApiResponse = {
  playListUrl: string
  posterUrl: string
  sign: { expires: number; sign: string; contentToken: string }
}

export async function getVideoUrl(
  endpoint: string,
  contentID: string,
  tokens: Tokens,
  first: boolean,
  signed: boolean,
): Promise<VideoUrlApiResponse> {
  return await get<VideoUrlApiResponse>(`${endpoint}/v1/content-info/${contentID}`, createAuthHeader(tokens), {
    action: first ? 'first' : null,
    mode: signed ? 'signed' : null,
  })
}

export async function playLogs(endpoint: string, contentID: string, tokens: Tokens) {
  await post(`${endpoint}/v1/play-log/${contentID}`, {}, createAuthHeader(tokens))
}
