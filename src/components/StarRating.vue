<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },   // 0-5 实际分值
  editable: { type: Boolean, default: false },
  size: { type: String, default: '' },   // 'lg'
})
const emit = defineEmits(['change'])

function display(val) {
  // 取半星：>=x.75 显示满，>=x.25 显示半
  return Math.round(val * 2) / 2
}
</script>

<template>
  <div
    class="stars"
    :class="[size, { editable }]"
    role="img"
    :aria-label="`${display(props.value)} / 5`"
  >
    <template v-for="i in 5" :key="i">
      <span v-if="!editable" class="star" :class="{ on: i <= display(props.value) }">★</span>
      <button
        v-else
        type="button"
        class="star star-btn"
        :class="{ on: i <= props.value }"
        :aria-label="`${i} 星`"
        @click="emit('change', i)"
      >★</button>
    </template>
  </div>
</template>

<style scoped>
.stars.lg { font-size: 28px; gap: 4px; }
.stars.lg .star-btn { font-size: 28px; }
.star-btn {
  background: none; border: none; padding: 0 2px; cursor: pointer;
  color: #ddd0bd; font-size: 22px; line-height: 1;
  transition: transform 0.1s;
}
.star-btn:hover { transform: scale(1.15); }
.stars.editable { user-select: none; }
</style>
