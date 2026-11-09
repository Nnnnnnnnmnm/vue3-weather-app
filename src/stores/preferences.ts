import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { City, Unit } from '../types/weather'

const UNIT_KEY = 'weather:unit'
const RECENT_KEY = 'weather:recent'
const MAX_RECENT = 6

function readUnit(): Unit {
  try {
    return localStorage.getItem(UNIT_KEY) === 'f' ? 'f' : 'c'
  } catch {
    return 'c'
  }
}

function readRecent(): City[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as City[]).slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 隐私模式或配额满时静默失败，不影响主流程
  }
}

/** 用户偏好：温度单位 + 最近搜索。localStorage 失败时退化为内存态 */
export const usePreferencesStore = defineStore('preferences', () => {
  const unit = ref<Unit>(readUnit())
  const recentCities = ref<City[]>(readRecent())

  watch(unit, (value) => safeWrite(UNIT_KEY, value))
  watch(
    recentCities,
    (value) => safeWrite(RECENT_KEY, JSON.stringify(value)),
    { deep: true }
  )

  function toggleUnit(): void {
    unit.value = unit.value === 'c' ? 'f' : 'c'
  }

  function setUnit(value: Unit): void {
    unit.value = value
  }

  function pushRecent(city: City): void {
    const rest = recentCities.value.filter((item) => item.id !== city.id)
    recentCities.value = [city, ...rest].slice(0, MAX_RECENT)
  }

  function clearRecent(): void {
    recentCities.value = []
  }

  return { unit, recentCities, toggleUnit, setUnit, pushRecent, clearRecent }
})
