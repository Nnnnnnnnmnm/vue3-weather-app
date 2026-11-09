/**
 * 数据访问层：负责 URL 拼装 + 原始响应 -> 领域模型的转换。
 * 组件与 store 都不感知 Open-Meteo 的字段名，换数据源只需改这一层。
 */
import type { City, DailyPoint, ForecastBundle, HourlyPoint } from '../types/weather'
import { requestJson } from './http'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

interface GeocodingResult {
  id: number
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}

interface GeocodingResponse {
  results?: GeocodingResult[]
}

interface ForecastResponse {
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    wind_direction_10m: number
    is_day: number
    weather_code: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
    is_day: number[]
    precipitation_probability: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
    precipitation_probability_max: number[]
  }
}

export async function searchCities(keyword: string, signal?: AbortSignal): Promise<City[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(keyword)}&count=6&language=zh&format=json`
  const data = await requestJson<GeocodingResponse>(url, { signal })

  return (data.results ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    admin1: item.admin1,
    country: item.country,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone
  }))
}

export async function fetchForecast(city: City, signal?: AbortSignal): Promise<ForecastBundle> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,is_day,weather_code',
    hourly: 'temperature_2m,weather_code,is_day,precipitation_probability',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7'
  })

  const data = await requestJson<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`, { signal })

  // 从当前时刻起截取 24 小时，避免把已经过去的小时也画进图表
  const startIndex = Math.max(
    0,
    data.hourly.time.findIndex((time) => time >= data.current.time)
  )

  const hourly: HourlyPoint[] = data.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time, offset) => {
      const index = startIndex + offset
      return {
        time,
        temperature: data.hourly.temperature_2m[index],
        code: data.hourly.weather_code[index],
        isDay: data.hourly.is_day[index] === 1,
        precipitationProbability: data.hourly.precipitation_probability?.[index] ?? 0
      }
    })

  const daily: DailyPoint[] = data.daily.time.slice(0, 7).map((date, index) => ({
    date,
    code: data.daily.weather_code[index],
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    sunrise: data.daily.sunrise[index],
    sunset: data.daily.sunset[index],
    precipitationProbability: data.daily.precipitation_probability_max?.[index] ?? 0
  }))

  return {
    timezone: data.timezone,
    source: 'network',
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      isDay: data.current.is_day === 1,
      code: data.current.weather_code
    },
    hourly,
    daily
  }
}
