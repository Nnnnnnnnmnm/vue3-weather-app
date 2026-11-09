<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import SearchBar from './components/SearchBar.vue'
import CurrentWeather from './components/CurrentWeather.vue'
import HourlyForecast from './components/HourlyForecast.vue'
import DailyForecast from './components/DailyForecast.vue'
import RecentSearches from './components/RecentSearches.vue'
import SkeletonPanel from './components/SkeletonPanel.vue'
import ErrorPanel from './components/ErrorPanel.vue'
import { useWeatherStore } from './stores/weather'
import { usePreferencesStore } from './stores/preferences'
import { POPULAR_CITIES } from './utils/cities'
import type { City, Unit } from './types/weather'

/**
 * 页面壳：只负责「顶部栏 + 三种视图状态」的编排，
 * 具体数据展示交给子组件，具体数据获取交给 store。
 */
const weather = useWeatherStore()
const preferences = usePreferencesStore()

const { bundle, city, status, errorMessage, notice, simulateFailure, isMockData } =
  storeToRefs(weather)
const { unit, recentCities } = storeToRefs(preferences)

onMounted(() => weather.init())

function selectCity(target: City): void {
  preferences.pushRecent(target)
  void weather.loadForecast(target)
}

function changeUnit(value: Unit): void {
  preferences.setUnit(value)
}

function toggleSimulateFailure(): void {
  weather.toggleSimulateFailure()
  if (city.value) void weather.loadForecast(city.value)
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <svg class="brand__mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <circle cx="12" cy="11" r="4.2" />
          <path d="M12 3.4v2M4.4 11h2M18.6 11h2M6.2 5.2l1.4 1.4M16.4 5.2l-1.4 1.4" stroke-linecap="round" />
          <path d="M4.6 18.6h13.2a2.7 2.7 0 0 0 .2-5.4 4.6 4.6 0 0 0-8.8-1.2 3.2 3.2 0 0 0-4.6 6.6z" stroke-linejoin="round" />
        </svg>
        <div class="brand__text">
          <strong>天气</strong>
          <span>Vue 3 Take-Home Demo</span>
        </div>
      </div>

      <SearchBar />

      <div class="unit" role="group" aria-label="温度单位">
        <button
          v-for="option in ([{ value: 'c', label: '°C' }, { value: 'f', label: '°F' }] as const)"
          :key="option.value"
          type="button"
          :class="['unit__btn', { 'is-active': unit === option.value }]"
          :aria-pressed="unit === option.value"
          @click="changeUnit(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </header>

    <p v-if="notice" class="notice" role="status">
      {{ notice }}
    </p>

    <main class="stage">
      <SkeletonPanel v-if="status === 'loading'" />
      <ErrorPanel v-else-if="status === 'error'" :message="errorMessage" @retry="weather.retry()" />

      <div v-else-if="bundle && city" class="board">
        <div class="board__main">
          <CurrentWeather :city="city" :bundle="bundle" />
          <HourlyForecast :points="bundle.hourly" />
        </div>
        <aside class="board__side">
          <DailyForecast :days="bundle.daily" />
          <RecentSearches v-if="recentCities.length" />
        </aside>
      </div>

      <section v-else class="empty">
        <h1>搜索一个城市，查看当前天气与预报</h1>
        <p>支持中文、英文与拼音，数据来自 Open-Meteo 公开接口。</p>
      </section>

      <div class="quick" aria-label="热门城市">
        <span class="quick__label">热门城市</span>
        <button
          v-for="item in POPULAR_CITIES"
          :key="item.id"
          type="button"
          class="quick__chip"
          @click="selectCity(item)"
        >
          {{ item.name }}
        </button>
      </div>
    </main>

    <footer class="footer">
      <span>
        数据来源 Open-Meteo · 地理编码 + 天气预报
        <span v-if="isMockData" class="footer__flag">当前为内置示例数据</span>
      </span>
      <button
        type="button"
        :class="['footer__toggle', { 'is-on': simulateFailure }]"
        @click="toggleSimulateFailure"
      >
        {{ simulateFailure ? '已模拟网络失败 · 点击恢复' : '模拟网络失败' }}
      </button>
    </footer>
  </div>
</template>
