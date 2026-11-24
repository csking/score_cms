<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import StarRating from '../components/StarRating.vue'
import { dishes, getScore } from '../store'

const query = ref('')

const hotDishes = computed(() => dishes.value.filter((d) => d.hot))

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return dishes.value.filter((d) => {
    const hay = [d.nameZh, d.nameEn, d.category, ...(d.restaurants || []).map((r) => r.nameZh)]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

function topScore(dish) {
  const scores = (dish.restaurants || []).map((r) => getScore(dish, r).avg)
  return scores.length ? Math.max(...scores) : 0
}
</script>

<template>
  <div class="container">
    <!-- Hero 搜索 -->
    <section class="hero">
      <h1>今天想吃什么菜？</h1>
      <p class="sub">搜「菜名」，直接看哪家做得好 —— 别再让奶茶拉低一家好店的评分</p>
      <div class="search">
        <input
          v-model="query"
          type="search"
          placeholder="试试：麻婆豆腐 / Mapo Tofu / 小笼包…"
          autofocus
        />
      </div>

      <!-- 搜索结果 -->
      <div v-if="query.trim()" class="results">
        <template v-if="results.length">
          <p class="muted">找到 {{ results.length }} 道菜：</p>
          <RouterLink
            v-for="d in results"
            :key="d.id"
            :to="`/dish/${d.id}`"
            class="card dish-card"
          >
            <span class="dish-emoji">{{ d.emoji }}</span>
            <div class="dish-info">
              <div class="dish-name">{{ d.nameZh }} <small>{{ d.nameEn }}</small></div>
              <div class="muted">{{ (d.restaurants || []).length }} 家推荐 · 最高 {{ topScore(d).toFixed(1) }} 分</div>
            </div>
            <StarRating :value="topScore(d)" />
          </RouterLink>
        </template>
        <p v-else class="empty">
          没找到「{{ query }}」🥲<br />
          <span class="muted">数据还在完善中，换个菜名试试？</span>
        </p>
      </div>
    </section>

    <!-- 热门菜推荐 -->
    <section v-if="!query.trim()" class="hot">
      <h2>🔥 热门菜</h2>
      <div class="grid">
        <RouterLink
          v-for="d in hotDishes"
          :key="d.id"
          :to="`/dish/${d.id}`"
          class="card hot-card"
        >
          <span class="dish-emoji">{{ d.emoji }}</span>
          <div class="dish-name">{{ d.nameZh }}</div>
          <div class="muted dish-en">{{ d.nameEn }}</div>
          <div class="hot-foot">
            <StarRating :value="topScore(d)" />
            <span class="score-num">{{ topScore(d).toFixed(1) }}</span>
          </div>
        </RouterLink>
      </div>

      <h2 style="margin-top:36px;">🍽️ 全部菜品</h2>
      <div class="grid">
        <RouterLink
          v-for="d in dishes"
          :key="d.id"
          :to="`/dish/${d.id}`"
          class="chip"
        >{{ d.emoji }} {{ d.nameZh }}</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 36px 0 24px; }
.hero h1 { font-size: 34px; margin: 0 0 8px; }
.sub { color: var(--muted); margin: 0 0 24px; }
.search input {
  max-width: 480px; margin: 0 auto; padding: 14px 20px;
  font-size: 17px; border-radius: 999px; text-align: center;
}
.results { text-align: left; max-width: 640px; margin: 20px auto 0; }
.dish-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; margin-bottom: 10px;
  transition: transform 0.12s, box-shadow 0.12s;
}
.dish-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(80,50,20,.12); }
.dish-emoji { font-size: 30px; }
.dish-info { flex: 1; min-width: 0; }
.dish-name { font-weight: 700; }
.dish-name small { color: var(--muted); font-weight: 500; }
.empty { padding: 30px; font-size: 17px; }

.hot h2 { font-size: 20px; margin: 8px 0 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 12px; }
.hot-card {
  padding: 18px 14px; text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  transition: transform 0.12s, box-shadow 0.12s;
}
.hot-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(80,50,20,.12); }
.hot-card .dish-emoji { font-size: 38px; }
.hot-card .dish-name { font-weight: 700; font-size: 16px; }
.hot-card .dish-en { font-size: 12px; min-height: 32px; }
.hot-foot { display: flex; align-items: center; gap: 6px; margin-top: 4px; }

.chip {
  background: #fff; border: 1px solid var(--line); border-radius: 999px;
  padding: 8px 16px; text-align: center; font-size: 14px; font-weight: 600;
  transition: background 0.12s;
}
.chip:hover { background: var(--brand-soft); border-color: var(--brand); }

@media (max-width: 600px) {
  .hero h1 { font-size: 26px; }
  .hero .sub { font-size: 14px; }
}
</style>
