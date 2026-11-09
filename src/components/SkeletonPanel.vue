<template>
  <div class="skeleton" aria-busy="true" aria-label="正在加载天气数据">
    <div class="skeleton__head">
      <span class="sk sk--place"></span>
      <span class="sk sk--pill"></span>
    </div>
    <div class="skeleton__body">
      <span class="sk sk--temp"></span>
      <span class="sk sk--art"></span>
    </div>
    <div class="skeleton__meta">
      <span v-for="index in 5" :key="index" class="sk sk--cell"></span>
    </div>
    <div class="skeleton__panel">
      <span v-for="index in 12" :key="index" class="sk sk--bar" :style="{ height: `${40 + ((index * 13) % 50)}%` }"></span>
    </div>
  </div>
</template>
