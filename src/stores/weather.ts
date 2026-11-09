import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { City, ForecastBundle } from '../types/weather'
import { fetchForecast, searchCities as requestCities } from '../services/weatherApi'
import { ApiError } from '../services/http'
import { buildMockBundle } from '../services/mockWeather'
import { DEFAULT_CITY, matchLocalCities } from '../utils/cities'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SuggestStatus = 'idle' | 'loading' | 'empty' | 'error'

/**
 * 天气 store：唯一的数据入口。
 * - 用自增 seq + AbortController 处理竞态：只有最后一次请求的结果会被写入 state
 * - 网络不可用时降级到内置示例数据；打开「模拟失败」开关则可以走真实的错误分支
 * - 组件不直接调 API，只调用 action / 读 state，方便替换数据源与写测试
 */
export const useWeatherStore = defineStore('weather', () => {
  const city = ref<City | null>(null)
  const bundle = ref<ForecastBundle | null>(null)
  const status = ref<LoadStatus>('idle')
  const errorMessage = ref('')
  const notice = ref('')
  const simulateFailure = ref(false)

  const suggestions = ref<City[]>([])
  const suggestStatus = ref<SuggestStatus>('idle')
  const suggestError = ref('')

  const isMockData = computed(() => bundle.value?.source === 'mock')

  let forecastSeq = 0
  let forecastController: AbortController | null = null
  let searchSeq = 0
  let searchController: AbortController | null = null

  async function loadForecast(target: City): Promise<void> {
    forecastController?.abort()
    forecastController = new AbortController()
    const seq = ++forecastSeq

    city.value = target
    status.value = 'loading'
    errorMessage.value = ''
    notice.value = ''

    try {
      if (simulateFailure.value) {
        throw new ApiError('模拟的网络故障：请求未送达', 'network')
      }
      const data = await fetchForecast(target, forecastController.signal)
      if (seq !== forecastSeq) return
      bundle.value = data
      status.value = 'ready'
    } catch (error) {
      if (seq !== forecastSeq) return
      if (error instanceof ApiError && error.kind === 'aborted') return

      const message = error instanceof ApiError ? error.message : '加载天气数据失败'

      if (simulateFailure.value) {
        status.value = 'error'
        errorMessage.value = message
        return
      }

      // 降级策略：真实网络异常时用内置示例数据兜住界面，并明确告知用户
      bundle.value = buildMockBundle(target)
      status.value = 'ready'
      notice.value = `${message}，当前展示内置示例数据`
    }
  }

  async function searchCities(keyword: string): Promise<void> {
    const trimmed = keyword.trim()
    searchController?.abort()

    if (!trimmed) {
      suggestions.value = []
      suggestStatus.value = 'idle'
      return
    }

    searchController = new AbortController()
    const seq = ++searchSeq
    suggestStatus.value = 'loading'
    suggestError.value = ''

    try {
      const list = await requestCities(trimmed, searchController.signal)
      if (seq !== searchSeq) return
      suggestions.value = list
      suggestStatus.value = list.length ? 'idle' : 'empty'
    } catch (error) {
      if (seq !== searchSeq) return
      if (error instanceof ApiError && error.kind === 'aborted') return

      const fallback = matchLocalCities(trimmed)
      suggestions.value = fallback
      suggestStatus.value = fallback.length ? 'idle' : 'error'
      suggestError.value = fallback.length ? '' : '搜索服务暂不可用，请稍后重试'
    }
  }

  function clearSuggestions(): void {
    searchController?.abort()
    suggestions.value = []
    suggestStatus.value = 'idle'
    suggestError.value = ''
  }

  function retry(): void {
    if (city.value) void loadForecast(city.value)
  }

  function init(): void {
    void loadForecast(DEFAULT_CITY)
  }

  function toggleSimulateFailure(value?: boolean): void {
    simulateFailure.value = value ?? !simulateFailure.value
  }

  return {
    city,
    bundle,
    status,
    errorMessage,
    notice,
    simulateFailure,
    suggestions,
    suggestStatus,
    suggestError,
    isMockData,
    loadForecast,
    searchCities,
    clearSuggestions,
    retry,
    init,
    toggleSimulateFailure
  }
})
