<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ (event: 'retry'): void }>()
</script>

<template>
  <div class="error" role="alert">
    <svg class="error__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" stroke-linecap="round" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" stroke="none" />
    </svg>
    <h2>天气数据加载失败</h2>
    <p>{{ message }}</p>
    <button type="button" class="error__retry" @click="$emit('retry')">重新加载</button>
    <p class="error__hint">提示：错误状态是作业要求的一部分，可点击右下角「模拟网络失败」重现。</p>
  </div>
</template>
