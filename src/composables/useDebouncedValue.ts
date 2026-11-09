import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * 防抖：搜索输入用 300ms 防抖，避免每敲一个字就发一次请求。
 * 组件卸载时清理定时器，避免卸载后仍触发回调。
 */
export function useDebouncedValue<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}
