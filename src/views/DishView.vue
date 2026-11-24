<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import StarRating from '../components/StarRating.vue'
import RatingForm from '../components/RatingForm.vue'
import { findDish, getScore } from '../store'

const props = defineProps({ id: { type: String, required: true } })
const route = useRoute()

const dish = computed(() => findDish(props.id))

// 打分面板状态：当前展开表单的餐厅 id
const activeRestId = ref(null)

watch(
  () => route.params.id,
  () => (activeRestId.value = null)
)

// 综合得分排序后的餐厅
const sortedRests = computed(() => {
  if (!dish.value) return []
  return [...(dish.value.restaurants || [])].sort(
    (a, b) => getScore(dish.value, b).avg - getScore(dish.value, a).avg
  )
})

function toggleForm(restId) {
  activeRestId.value = activeRestId.value === restId ? null : restId
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  return `${Math.floor(m / 60)} 小时前`
}
</script>

<template>
  <div class="container" v-if="dish">
    <!-- 菜品头部 -->
    <section class="dish-head card">
      <div class="dh-main">
        <div class="dh-emoji">{{ dish.emoji }}</div>
        <div>
          <h1>{{ dish.nameZh }}</h1>
          <p class="muted dh-en">{{ dish.nameEn }} · <span class="tag">{{ dish.category }}</span></p>
          <p class="dh-desc">{{ dish.desc }}</p>
        </div>
      </div>
      <RouterLink to="/" class="back">← 换个菜</RouterLink>
    </section>

    <!-- 推荐餐厅列表 -->
    <h2 class="sec-title">🍽️ 哪家做得好（按评分排序）</h2>

    <div v-if="!sortedRests.length" class="card" style="padding:28px;text-align:center;">
      这道菜还没有推荐餐厅，去 <RouterLink to="/admin" style="color:var(--brand);font-weight:600;">后台</RouterLink> 添加一家？
    </div>

    <article
      v-for="(rest, idx) in sortedRests"
      :key="rest.id"
      class="card rest-card"
    >
      <div class="rest-head">
        <div class="rank" :class="{ top: idx === 0 }">{{ idx + 1 }}</div>
        <div class="rest-info">
          <div class="rest-name">
            {{ rest.nameZh }}
            <small class="muted">{{ rest.nameEn }}</small>
          </div>
          <div class="muted rest-meta">
            📍 {{ rest.address }} · {{ rest.city }} · {{ rest.price }}
            <span v-if="rest.phone"> · ☎ {{ rest.phone }}</span>
          </div>
        </div>
        <div class="rest-score">
          <StarRating :value="getScore(dish, rest).avg" />
          <div class="score-line">
            <span class="score-num">{{ getScore(dish, rest).avg.toFixed(1) }}</span>
            <span class="muted"> / {{ getScore(dish, rest).count }} 条</span>
          </div>
        </div>
      </div>

      <!-- 已有简评（种子数据） -->
      <ul v-if="rest.baseReviews?.length" class="reviews">
        <li v-for="(rv, i) in rest.baseReviews" :key="i">
          <StarRating :value="rv.rating" />
          <span class="rv-author">{{ rv.author }}</span>
          <span class="rv-text">{{ rv.comment }}</span>
        </li>
      </ul>

      <!-- 我的评分展示 -->
      <div v-if="getScore(dish, rest).mine && activeRestId !== rest.id" class="my-rating">
        <StarRating :value="getScore(dish, rest).mine.rating" />
        <span class="rv-text">
          {{ getScore(dish, rest).mine.comment || '我打了分' }}
        </span>
        <span class="muted" style="font-size:12px;">
          （{{ timeAgo(getScore(dish, rest).mine.ts) }}）
        </span>
        <button class="btn ghost small" @click="toggleForm(rest.id)">修改</button>
      </div>

      <!-- 打分表单 -->
      <RatingForm
        v-if="activeRestId === rest.id"
        :dish="dish"
        :restaurant="rest"
        :existing="getScore(dish, rest).mine"
        @submitted="activeRestId = null"
        @cancel="activeRestId = null"
      />

      <div v-if="activeRestId !== rest.id" class="rate-bar">
        <button class="btn" @click="toggleForm(rest.id)">
          {{ getScore(dish, rest).mine ? '✍️ 修改我的评分' : '⭐ 给这家打分' }}
        </button>
      </div>
    </article>

    <p class="muted tip">
      评分 = 初始数据 + 您本机的评分综合计算。无需注册，每人（每台设备）对同一道菜 × 同一家店仅一条评分。
    </p>
  </div>

  <div v-else class="container" style="padding:60px 0;text-align:center;">
    <p style="font-size:20px;">没找到这道菜 🤔</p>
    <RouterLink to="/" class="btn" style="margin-top:12px;">回首页</RouterLink>
  </div>
</template>

<style scoped>
.dish-head { padding: 24px; margin-bottom: 28px; position: relative; }
.dh-main { display: flex; gap: 20px; }
.dh-emoji { font-size: 56px; line-height: 1; }
.dh-main h1 { margin: 0; font-size: 28px; }
.dh-en { margin: 4px 0 8px; font-size: 14px; }
.dh-desc { margin: 0; max-width: 560px; font-size: 15px; }
.back {
  position: absolute; top: 18px; right: 20px;
  color: var(--muted); font-size: 14px;
}
.back:hover { color: var(--brand); }

.sec-title { font-size: 20px; margin: 0 0 16px; }

.rest-card { padding: 20px; margin-bottom: 16px; }
.rest-head { display: flex; gap: 14px; align-items: flex-start; }
.rank {
  width: 28px; height: 28px; border-radius: 8px; flex: none;
  display: grid; place-items: center;
  background: #f1ece4; color: var(--muted); font-weight: 800; font-size: 14px;
}
.rank.top { background: var(--brand); color: #fff; }
.rest-info { flex: 1; min-width: 0; }
.rest-name { font-weight: 700; font-size: 17px; }
.rest-name small { font-weight: 500; font-size: 13px; }
.rest-meta { font-size: 13px; }
.rest-score { text-align: right; flex: none; }
.score-line { font-size: 15px; }

.reviews { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
.reviews li { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.rv-author { font-weight: 700; font-size: 14px; }
.rv-text { color: #5d5042; font-size: 14px; }

.my-rating {
  margin-top: 14px; padding: 10px 14px;
  background: var(--brand-soft); border-radius: 10px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 14px;
}

.rate-bar { margin-top: 14px; }
.tip { font-size: 12px; text-align: center; margin-top: 24px; }

@media (max-width: 600px) {
  .dh-main { flex-direction: column; gap: 10px; }
  .dh-emoji { font-size: 44px; }
  .dh-main h1 { font-size: 22px; }
  .back { position: static; display: inline-block; margin-top: 10px; }
  .rest-head { flex-wrap: wrap; }
  .rest-score { text-align: left; width: 100%; display: flex; align-items: center; gap: 10px; }
}
</style>
