<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '../stores/preferences'
import { useWeatherStore } from '../stores/weather'
import { citySubtitle } from '../utils/cities'
import type { City } from '../types/weather'

/** 最近搜索：数据存在 localStorage，点击即重新加载，不用再打一次地理编码 */
const preferences = usePreferencesStore()
const weather = useWeatherStore()
const { recentCities } = storeToRefs(preferences)

function pick(city: City): void {
  void weather.loadForecast(city)
}
</script>

<template>
  <section class="panel recent">
    <header class="panel__head">
      <h2>最近搜索</h2>
      <button type="button" class="panel__link" @click="preferences.clearRecent()">清空</button>
    </header>
    <ul class="recent__list">
      <li v-for="city in recentCities" :key="city.id">
        <button type="button" class="recent__item" @click="pick(city)">
          <span class="recent__name">{{ city.name }}</span>
          <span class="recent__meta">{{ citySubtitle(city) }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>
