import type { City } from '../types/weather'

/** 常用城市：首屏默认城市 + 搜索不可用时的本地兜底 + 快捷标签 */
export const POPULAR_CITIES: City[] = [
  { id: 1796236, name: '上海', admin1: '上海市', country: '中国', latitude: 31.2304, longitude: 121.4737 },
  { id: 1816670, name: '北京', admin1: '北京市', country: '中国', latitude: 39.9042, longitude: 116.4074 },
  { id: 1795565, name: '广州', admin1: '广东省', country: '中国', latitude: 23.1291, longitude: 113.2644 },
  { id: 1795564, name: '深圳', admin1: '广东省', country: '中国', latitude: 22.5431, longitude: 114.0579 },
  { id: 1815286, name: '成都', admin1: '四川省', country: '中国', latitude: 30.5728, longitude: 104.0668 },
  { id: 1850147, name: '东京', admin1: '東京都', country: '日本', latitude: 35.6762, longitude: 139.6503 },
  { id: 5128581, name: '纽约', admin1: 'New York', country: '美国', latitude: 40.7128, longitude: -74.006 },
  { id: 2643743, name: '伦敦', admin1: 'England', country: '英国', latitude: 51.5072, longitude: -0.1276 }
]

export const DEFAULT_CITY: City = POPULAR_CITIES[0]

/** 本地兜底搜索：只按中文名/拼音前缀做简单匹配 */
export function matchLocalCities(keyword: string): City[] {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) return []
  return POPULAR_CITIES.filter((city) => city.name.toLowerCase().includes(normalized)).slice(0, 6)
}

export function citySubtitle(city: City): string {
  return [city.admin1, city.country].filter(Boolean).join(' · ')
}

