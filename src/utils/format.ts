/** 展示层格式化工具：所有格式化集中在这里，组件里不出现裸数字 */
import type { Unit } from '../types/weather'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 2026-11-09T16:00 -> "16时"（接口返回的已经是城市当地时间，直接截取即可） */
export function hourLabel(isoTime: string): string {
  const hour = isoTime.slice(11, 13)
  return `${Number(hour)}时`
}

/** 2026-11-09 -> "11/09" */
export function shortDate(isoDate: string): string {
  return isoDate.slice(5).replace('-', '/')
}

/** 第 index 天 -> 今天 / 明天 / 周三 */
export function dayLabel(index: number, isoDate: string): string {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  const date = new Date(`${isoDate}T00:00:00`)
  return Number.isNaN(date.getTime()) ? isoDate : WEEKDAYS[date.getDay()]
}

/** 日出/日落：只取时间部分 07:12 */
export function clockLabel(isoTime: string): string {
  return isoTime.slice(11, 16)
}

export function windDirectionLabel(degree: number): string {
  const sectors = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const index = Math.round(((degree % 360) / 45)) % 8
  return `${sectors[index]}风`
}

export function windSpeedLabel(kmh: number): string {
  return `${Math.round(kmh)} km/h`
}

export function humidityLabel(percent: number): string {
  return `${Math.round(percent)}%`
}

export function displayTemp(celsius: number, unit: Unit): string {
  const value = unit === 'c' ? celsius : (celsius * 9) / 5 + 32
  return String(Math.round(value))
}

export function unitLabel(unit: Unit): string {
  return unit === 'c' ? '°C' : '°F'
}
