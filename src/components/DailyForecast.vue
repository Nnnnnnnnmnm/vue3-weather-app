<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import WeatherIcon from './WeatherIcon.vue'
import { usePreferencesStore } from '../stores/preferences'
import { dayLabel, displayTemp, shortDate } from '../utils/format'
import type { DailyPoint } from '../types/weather'

/** 7 天预报：每一行用一条区间条表示当日最低/最高，横向位置对齐全周温度区间 */
const props = defineProps<{ days: DailyPoint[] }>()

const preferences = usePreferencesStore()
const { unit } = storeToRefs(preferences)

const span = computed(() => {
  if (!props.days.length) return { min: 0, range: 1 }
  const min = Math.min(...props.days.map((day) => day.min))
  const max = Math.max(...props.days.map((day) => day.max))
  return { min, range: max - min < 1 ? 1 : max - min }
})

function barStyle(day: DailyPoint): Record<string, string> {
  const left = ((day.min - span.value.min) / span.value.range) * 100
  const width = ((day.max - day.min) / span.value.range) * 100
  return { left: `${left}%`, width: `${Math.max(width, 6)}%` }
}
</script>

<template>
  <section class="panel daily">
    <header class="panel__head">
      <h2>7 天预报</h2>
      <span class="panel__hint">{{ unit === 'c' ? '摄氏' : '华氏' }}</span>
    </header>

    <ul class="daily__list">
      <li v-for="(day, index) in days" :key="day.date" class="daily__row">
        <span class="daily__day">
          {{ dayLabel(index, day.date) }}
          <em>{{ shortDate(day.date) }}</em>
        </span>
        <WeatherIcon class="daily__icon" :code="day.code" :size="22" />
        <span class="daily__min">{{ displayTemp(day.min, unit) }}°</span>
        <span class="daily__track"><i :style="barStyle(day)" /></span>
        <span class="daily__max">{{ displayTemp(day.max, unit) }}°</span>
      </li>
    </ul>
  </section>
</template>
