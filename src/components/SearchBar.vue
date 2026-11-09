<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '../stores/weather'
import { usePreferencesStore } from '../stores/preferences'
import { useDebouncedValue } from '../composables/useDebouncedValue'
import { citySubtitle } from '../utils/cities'
import type { City } from '../types/weather'

/**
 * 搜索框：输入 -> 300ms 防抖 -> store 发起地理编码请求。
 * 下拉列表支持鼠标点选与键盘 ↑ ↓ Enter 选择；点击外部自动收起。
 */
const weather = useWeatherStore()
const preferences = usePreferencesStore()
const { suggestions, suggestStatus, suggestError } = storeToRefs(weather)

const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const rootRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const debouncedQuery = useDebouncedValue(query, 320)

watch(debouncedQuery, (value) => {
  activeIndex.value = -1
  if (!value.trim()) {
    weather.clearSuggestions()
    isOpen.value = false
    return
  }
  isOpen.value = true
  void weather.searchCities(value)
})

watch(isOpen, (open) => {
  if (!open) activeIndex.value = -1
})

function selectCity(city: City): void {
  query.value = ''
  isOpen.value = false
  activeIndex.value = -1
  weather.clearSuggestions()
  preferences.pushRecent(city)
  void weather.loadForecast(city)
  inputRef.value?.blur()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isOpen.value = false
    return
  }
  if (!isOpen.value || suggestions.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      (activeIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const target = suggestions.value[activeIndex.value] ?? suggestions.value[0]
    if (target) selectCity(target)
  }
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (!rootRef.value?.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="rootRef" class="search">
    <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" stroke-linecap="round" />
    </svg>
    <input
      ref="inputRef"
      v-model="query"
      class="search__input"
      type="search"
      role="combobox"
      :aria-expanded="isOpen"
      aria-controls="city-suggestions"
      placeholder="搜索城市，如 北京 / Tokyo"
      autocomplete="off"
      @keydown="onKeydown"
      @focus="isOpen = query.trim().length > 0"
    />
    <button
      v-if="query"
      class="search__clear"
      type="button"
      aria-label="清空搜索"
      @click="query = ''; weather.clearSuggestions(); inputRef?.focus()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </button>

    <div v-if="isOpen" id="city-suggestions" class="search__panel" role="listbox">
      <p v-if="suggestStatus === 'loading'" class="search__hint">正在搜索…</p>
      <p v-else-if="suggestStatus === 'empty'" class="search__hint">没有找到匹配的城市，试试别的关键词</p>
      <p v-else-if="suggestStatus === 'error'" class="search__hint search__hint--error">
        {{ suggestError }}
      </p>
      <ul v-else class="search__list">
        <li
          v-for="(item, index) in suggestions"
          :key="item.id"
          :class="['search__item', { 'is-active': index === activeIndex }]"
          role="option"
          :aria-selected="index === activeIndex"
          @pointerenter="activeIndex = index"
          @click="selectCity(item)"
        >
          <span class="search__name">{{ item.name }}</span>
          <span class="search__meta">{{ citySubtitle(item) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
