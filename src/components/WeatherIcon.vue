<script setup lang="ts">
import { computed } from 'vue'
import { weatherGroup } from '../utils/weatherCode'

/**
 * 天气图标：按 WMO 码归到 7 个图形分组，白天/夜间只影响「晴」与「多云」。
 * 单一色 currentColor，颜色由外层通过 --accent 控制，便于统一换肤。
 */
const props = withDefaults(
  defineProps<{
    code: number
    isDay?: boolean
    size?: number
  }>(),
  { isDay: true, size: 24 }
)

const variant = computed(() => {
  const group = weatherGroup(props.code)
  if (group === 'clear' || group === 'partly') {
    return props.isDay ? group : 'night'
  }
  return group
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="variant === 'clear'">
      <circle cx="12" cy="12" r="4.6" stroke="none" />
      <g stroke-width="1.9" fill="none">
        <path d="M12 2.6v2.5M12 18.9v2.5M2.6 12h2.5M18.9 12h2.5" />
        <path d="M16.88 7.12l1.77-1.77M5.35 18.65l1.77-1.77M18.65 5.35l-1.77 1.77M5.35 5.35l1.77 1.77" />
      </g>
    </template>

    <template v-else-if="variant === 'night'">
      <path
        fill-rule="evenodd"
        stroke="none"
        d="M2.5 12a8.5 8.5 0 1 0 17 0 8.5 8.5 0 1 0-17 0zM8.5 9.5a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"
      />
    </template>

    <template v-else-if="variant === 'partly'">
      <circle cx="16.2" cy="7.6" r="3.4" stroke="none" opacity="0.55" />
      <g stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
    </template>

    <template v-else-if="variant === 'cloudy'">
      <g stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
    </template>

    <template v-else-if="variant === 'rain'">
      <g transform="translate(0 -4)" stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
      <g stroke-width="1.9" fill="none">
        <path d="M9 18.4l-1 3M13 18.6l-1 3M17 18.4l-1 3" />
      </g>
    </template>

    <template v-else-if="variant === 'snow'">
      <g transform="translate(0 -4)" stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
      <g stroke="none">
        <circle cx="9.2" cy="19.6" r="1.1" />
        <circle cx="13" cy="20.6" r="1.1" />
        <circle cx="16.8" cy="19.6" r="1.1" />
      </g>
    </template>

    <template v-else-if="variant === 'thunder'">
      <g transform="translate(0 -5) scale(0.92) translate(1 1)" stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
      <path stroke="none" d="M12.8 14.4l-3.4 5.6h2.6l-1.6 4.4 4.2-5.8h-2.6l1.6-4.2z" />
    </template>

    <template v-else>
      <g transform="translate(0 -4)" stroke="none">
        <circle cx="7.6" cy="14.6" r="3.2" />
        <circle cx="12.4" cy="11.2" r="4.4" />
        <circle cx="17.2" cy="14.4" r="3.4" />
        <rect x="7.6" y="13" width="9.6" height="4.6" />
      </g>
      <g stroke-width="1.9" fill="none">
        <path d="M6.2 19h11M8 22h8" />
      </g>
    </template>
  </svg>
</template>
