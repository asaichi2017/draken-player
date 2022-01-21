import axios from 'axios'

type Headers = { [key: string]: string }

export async function get<T>(url: string, headers: Headers, params: any = {}): Promise<T> {
  const result = await axios.get<T>(url, {
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
  return result.data
}

export async function post<T>(url: string, body: any = {}, headers: Headers): Promise<T> {
  const result = await axios.post<T>(url, body, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
  return result.data
}
