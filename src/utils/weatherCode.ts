/** WMO weather code -> 中文文案 + 图标分组（做一层映射，UI 不用关心码值） */

export type WeatherGroup = 'clear' | 'partly' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog'

interface WeatherMeta {
  label: string
  group: WeatherGroup
}

const CODES: Record<number, WeatherMeta> = {
  0: { label: '晴', group: 'clear' },
  1: { label: '晴间多云', group: 'partly' },
  2: { label: '多云', group: 'partly' },
  3: { label: '阴', group: 'cloudy' },
  45: { label: '有雾', group: 'fog' },
  48: { label: '雾凇', group: 'fog' },
  51: { label: '小毛毛雨', group: 'rain' },
  53: { label: '毛毛雨', group: 'rain' },
  55: { label: '浓毛毛雨', group: 'rain' },
  56: { label: '冻毛毛雨', group: 'rain' },
  57: { label: '强冻毛毛雨', group: 'rain' },
  61: { label: '小雨', group: 'rain' },
  63: { label: '中雨', group: 'rain' },
  65: { label: '大雨', group: 'rain' },
  66: { label: '冻雨', group: 'rain' },
  67: { label: '强冻雨', group: 'rain' },
  71: { label: '小雪', group: 'snow' },
  73: { label: '中雪', group: 'snow' },
  75: { label: '大雪', group: 'snow' },
  77: { label: '雪粒', group: 'snow' },
  80: { label: '阵雨', group: 'rain' },
  81: { label: '强阵雨', group: 'rain' },
  82: { label: '暴雨', group: 'rain' },
  85: { label: '阵雪', group: 'snow' },
  86: { label: '强阵雪', group: 'snow' },
  95: { label: '雷阵雨', group: 'thunder' },
  96: { label: '雷阵雨伴冰雹', group: 'thunder' },
  99: { label: '强雷暴伴冰雹', group: 'thunder' }
}

const FALLBACK: WeatherMeta = { label: '未知天气', group: 'cloudy' }

export function describeWeather(code: number): WeatherMeta {
  return CODES[code] ?? FALLBACK
}

export function weatherGroup(code: number): WeatherGroup {
  return describeWeather(code).group
}
