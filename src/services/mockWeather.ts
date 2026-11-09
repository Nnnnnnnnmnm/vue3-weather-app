/**
 * 离线兜底数据。
 * 真实接口不可用（例如评审环境断网、跨域被拦截）时，store 会降级到这里，
 * 保证界面仍然可以演示加载失败后的可用形态；界面上会明确标注「内置示例数据」。
 */
import type { City, DailyPoint, ForecastBundle, HourlyPoint } from '../types/weather'

const pad = (value: number) => String(value).padStart(2, '0')

const toIsoHour = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`

export function buildMockBundle(city: City): ForecastBundle {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
  const base = 16 + (Math.abs(Math.round(city.latitude)) % 6)

  const hourly: HourlyPoint[] = Array.from({ length: 24 }, (_, offset) => {
    const moment = new Date(start.getTime() + offset * 3600_000)
    const hour = moment.getHours()
    // 用正弦曲线模拟昼夜温差，保证曲线形状自然
    const temperature = base + 5 * Math.sin(((hour - 9) / 24) * Math.PI * 2)
    const code = [1, 2, 3, 2, 1, 0, 0, 1][Math.floor(hour / 3) % 8]
    return {
      time: toIsoHour(moment),
      temperature: Math.round(temperature * 10) / 10,
      code,
      isDay: hour >= 6 && hour < 18,
      precipitationProbability: code >= 2 ? 20 : 5
    }
  })

  const daily: DailyPoint[] = Array.from({ length: 7 }, (_, offset) => {
    const moment = new Date(start.getTime() + offset * 86_400_000)
    const shift = Math.round(2 * Math.sin(offset / 1.6))
    return {
      date: `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`,
      code: [2, 3, 1, 0, 61, 2, 1][offset],
      max: Math.round(base + 6 + shift),
      min: Math.round(base - 4 + shift),
      sunrise: `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}T06:${pad(30 + offset)}`,
      sunset: `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}T18:${pad(10 - offset)}`,
      precipitationProbability: [20, 30, 10, 0, 60, 20, 10][offset]
    }
  })

  return {
    timezone: city.timezone ?? 'Asia/Shanghai',
    source: 'mock',
    current: {
      time: hourly[0].time,
      temperature: hourly[0].temperature,
      feelsLike: Math.round((hourly[0].temperature - 1.2) * 10) / 10,
      humidity: 62,
      windSpeed: 12,
      windDirection: 135,
      isDay: hourly[0].isDay,
      code: hourly[0].code
    },
    hourly,
    daily
  }
}
