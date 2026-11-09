/** 极薄的 HTTP 封装：统一超时、取消、错误分类，业务层不需要写 try/catch 细节 */

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'aborted'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { signal, timeoutMs = 8000 } = options
  const controller = new AbortController()
  let timedOut = false

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const relayAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', relayAbort, { once: true })
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
      throw new ApiError(`服务返回 HTTP ${response.status}`, 'http', response.status)
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new ApiError('返回内容无法解析', 'parse')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (timedOut) throw new ApiError('请求超时，请稍后重试', 'timeout')
    if (signal?.aborted) throw new ApiError('请求已取消', 'aborted')
    throw new ApiError('网络连接失败，请检查网络后重试', 'network')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', relayAbort)
  }
}
