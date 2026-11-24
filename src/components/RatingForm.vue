<script setup>
import { ref, computed } from 'vue'
import StarRating from './StarRating.vue'
import { submitRating } from '../store'

const props = defineProps({
  dish: { type: Object, required: true },
  restaurant: { type: Object, required: true },
  existing: { type: Object, default: null },
})
const emit = defineEmits(['submitted', 'cancel'])

const rating = ref(props.existing?.rating || 0)
const comment = ref(props.existing?.comment || '')
const answer = ref('')
const error = ref('')

// 轻量验证码：随机算术题
const captcha = ref(makeCaptcha())
function makeCaptcha() {
  const a = 2 + Math.floor(Math.random() * 8)
  const b = 1 + Math.floor(Math.random() * 9)
  return { a, b, sum: a + b }
}
function refreshCaptcha() {
  captcha.value = makeCaptcha()
  answer.value = ''
}

const isUpdate = computed(() => !!props.existing)

function submit() {
  error.value = ''
  if (!rating.value) {
    error.value = '请先选择星级 ⭐'
    return
  }
  if (Number(answer.value) !== captcha.value.sum) {
    error.value = '验证码不对，请再算一次'
    refreshCaptcha()
    return
  }
  submitRating(props.dish.id, props.restaurant.id, rating.value, comment.value)
  emit('submitted')
}
</script>

<template>
  <form class="rating-form" @submit.prevent="submit">
    <div class="rf-head">
      <div class="rf-title">{{ isUpdate ? '修改我的评分' : '给这道菜打分' }}</div>
      <div class="muted rf-target">
        {{ restaurant.nameZh }} 的「{{ dish.nameZh }}」
      </div>
    </div>

    <div class="rf-row">
      <StarRating :value="rating" editable size="lg" @change="(v) => (rating = v)" />
      <span v-if="rating" class="score-num">{{ rating }} 星</span>
    </div>

    <textarea
      v-model="comment"
      rows="3"
      maxlength="200"
      placeholder="这道菜怎么样？（选填，200字以内）"
    ></textarea>

    <div class="captcha-row">
      <span class="captcha-q">防刷验证：{{ captcha.a }} + {{ captcha.b }} =</span>
      <input
        v-model="answer"
        class="captcha-input"
        inputmode="numeric"
        placeholder="?"
        autocomplete="off"
      />
      <button type="button" class="btn ghost small" @click="refreshCaptcha">换一题</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="rf-actions">
      <button type="submit" class="btn">{{ isUpdate ? '更新评分' : '提交评分' }}</button>
      <button type="button" class="btn ghost" @click="emit('cancel')">取消</button>
    </div>

    <p class="muted rf-tip">
      无需注册。同一浏览器对同一家的同一道菜仅保存一条评分（重复提交为覆盖），提交记录仅存于本机。
    </p>
  </form>
</template>

<style scoped>
.rating-form {
  background: var(--brand-soft);
  border: 1px dashed var(--brand);
  border-radius: var(--radius);
  padding: 18px;
  margin-top: 14px;
  display: flex; flex-direction: column; gap: 12px;
}
.rf-title { font-weight: 700; font-size: 16px; }
.rf-target { font-size: 14px; }
.rf-row { display: flex; align-items: center; gap: 10px; }
.captcha-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.captcha-q { font-weight: 600; }
.captcha-input { width: 90px; text-align: center; }
.rf-actions { display: flex; gap: 10px; }
.rf-tip { font-size: 12px; margin: 0; }
.error { color: #d0342c; font-size: 14px; margin: 0; font-weight: 600; }
</style>
