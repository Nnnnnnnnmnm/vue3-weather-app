<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import WeatherIcon from './WeatherIcon.vue'
import { usePreferencesStore } from '../stores/preferences'
import { describeWeather } from '../utils/weatherCode'
import { citySubtitle } from '../utils/cities'
import {
  clockLabel,
  displayTemp,
  humidityLabel,
  unitLabel,
  windDirectionLabel,
  windSpeedLabel
} from '../utils/format'
import type { City, ForecastBundle } from '../types/weather'

const props = defineProps<{
  city: City
  bundle: ForecastBundle
}>()

const preferences = usePreferencesStore()
const { unit } = storeToRefs(preferences)

const condition = computed(() => describeWeather(props.bundle.current.code))
const today = computed(() => props.bundle.daily[0])

const tempText = computed(() => displayTemp(props.bundle.current.temperature, unit.value))
const tempUnit = computed(() => unitLabel(unit.value))

const rangeText = computed(() => {
  if (!today.value) return ''
  const max = displayTemp(today.value.max, unit.value)
  const min = displayTemp(today.value.min, unit.value)
  return `最高 ${max}° · 最低 ${min}°`
})
</script>

<template>
  <section class="current" :data-group="condition.group">
    <header class="current__head">
      <div>
        <p class="current__place">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" stroke-linejoin="round" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          {{ city.name }}
        </p>
        <p class="current__sub">{{ citySubtitle(city) }}</p>
      </div>
      <p class="current__time">{{ bundle.timezone }} · {{ clockLabel(bundle.current.time) }} 更新</p>
    </header>

    <div class="current__body">
      <div class="current__reading">
        <p class="current__temp">
          <span class="current__value">{{ tempText }}</span>
          <span class="current__unit">{{ tempUnit }}</span>
        </p>
        <p class="current__condition">{{ condition.label }} · 体感 {{ displayTemp(bundle.current.feelsLike, unit) }}°</p>
        <p class="current__range">{{ rangeText }}</p>
      </div>
      <div class="current__art">
        <WeatherIcon :code="bundle.current.code" :is-day="bundle.current.isDay" :size="104" />
      </div>
    </div>

    <dl class="current__meta">
      <div class="meta">
        <dt>湿度</dt>
        <dd>{{ humidityLabel(bundle.current.humidity) }}</dd>
      </div>
      <div class="meta">
        <dt>风速</dt>
        <dd>{{ windSpeedLabel(bundle.current.windSpeed) }}</dd>
        <span class="meta__note">{{ windDirectionLabel(bundle.current.windDirection) }}</span>
      </div>
      <div class="meta">
        <dt>日出</dt>
        <dd>{{ today ? clockLabel(today.sunrise) : '—' }}</dd>
      </div>
      <div class="meta">
        <dt>日落</dt>
        <dd>{{ today ? clockLabel(today.sunset) : '—' }}</dd>
      </div>
      <div class="meta">
        <dt>降水概率</dt>
        <dd>{{ today ? `${today.precipitationProbability}%` : '—' }}</dd>
      </div>
    </dl>
  </section>
</template>
