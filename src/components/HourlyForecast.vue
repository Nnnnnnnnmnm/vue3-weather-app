<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import WeatherIcon from './WeatherIcon.vue'
import { usePreferencesStore } from '../stores/preferences'
import { displayTemp, hourLabel } from '../utils/format'
import type { HourlyPoint } from '../types/weather'

/** 未来 24 小时：横向滚动条 + 温度柱状，柱高按区间内的相对温度映射 */
const props = defineProps<{ points: HourlyPoint[] }>()

const preferences = usePreferencesStore()
const { unit } = storeToRefs(preferences)

const range = computed(() => {
  if (!props.points.length) return { min: 0, max: 1 }
  const values = props.points.map((point) => point.temperature)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { min, max: max - min < 1 ? min + 1 : max }
})

function barHeight(temperature: number): string {
  const ratio = (temperature - range.value.min) / (range.value.max - range.value.min)
  return `${18 + ratio * 62}%`
}

const wettest = computed(() =>
  props.points.reduce((max, point) => Math.max(max, point.precipitationProbability), 0)
)
</script>

<template>
  <section class="panel hourly">
    <header class="panel__head">
      <h2>未来 24 小时</h2>
      <span v-if="wettest > 0" class="panel__hint">最高降水概率 {{ wettest }}%</span>
    </header>

    <div class="hourly__strip">
      <div v-for="(point, index) in points" :key="point.time" class="hourly__col">
        <span class="hourly__time">{{ index === 0 ? '现在' : hourLabel(point.time) }}</span>
        <WeatherIcon :code="point.code" :is-day="point.isDay" :size="20" />
        <span class="hourly__temp">{{ displayTemp(point.temperature, unit) }}°</span>
        <span class="hourly__bar">
          <i :style="{ height: barHeight(point.temperature) }"></i>
        </span>
      </div>
    </div>
  </section>
</template>
