/** 领域模型：UI 只消费这里的类型，不直接接触第三方 API 的原始结构 */

export type Unit = 'c' | 'f'

export interface City {
  id: number
  name: string
  /** 一级行政区，例如「重庆市」「California」 */
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface CurrentWeather {
  /** 城市本地时间，格式 2026-11-09T16:00 */
  time: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  isDay: boolean
  code: number
}

export interface HourlyPoint {
  time: string
  temperature: number
  code: number
  isDay: boolean
  precipitationProbability: number
}

export interface DailyPoint {
  date: string
  code: number
  max: number
  min: number
  sunrise: string
  sunset: string
  precipitationProbability: number
}

export interface ForecastBundle {
  timezone: string
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  /** 数据来源：真实接口 or 内置示例数据（降级） */
  source: 'network' | 'mock'
}
