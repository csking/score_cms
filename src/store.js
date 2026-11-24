import { reactive, computed } from 'vue'
import seedData from './data/dishes.json'

const LS_CUSTOM = 'zcc_custom_dishes' // 后台手动添加/覆盖的菜品
const LS_RATINGS = 'zcc_my_ratings'   // 本机打分记录（防刷：一菜一店一条）

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/** 合并：JSON 种子数据 + 后台自定义数据（同 id 覆盖） */
export const store = reactive({
  seedDishes: seedData.dishes,
  customDishes: readJSON(LS_CUSTOM, []),
  myRatings: readJSON(LS_RATINGS, {}),
})

export const dishes = computed(() => {
  const map = new Map()
  store.seedDishes.forEach((d) => map.set(d.id, d))
  store.customDishes.forEach((d) => map.set(d.id, d))
  return [...map.values()]
})

export function findDish(id) {
  return dishes.value.find((d) => d.id === id)
}

export const ratingKey = (dishId, restId) => `${dishId}::${restId}`

/** 综合评分 = 种子评分加权 + 本机用户评分 */
export function getScore(dish, rest) {
  const mine = store.myRatings[ratingKey(dish.id, rest.id)]
  const base = (rest.baseRating || 0) * (rest.baseCount || 0)
  if (!mine) {
    return { avg: rest.baseRating || 0, count: rest.baseCount || 0, mine: null }
  }
  const count = (rest.baseCount || 0) + 1
  return { avg: (base + mine.rating) / count, count, mine }
}

/** 提交打分（覆盖本机同一条记录，实现轻量防刷） */
export function submitRating(dishId, restId, rating, comment) {
  store.myRatings[ratingKey(dishId, restId)] = {
    rating,
    comment: comment.trim(),
    ts: Date.now(),
  }
  writeJSON(LS_RATINGS, store.myRatings)
}

export function myRatingCount() {
  return Object.keys(store.myRatings).length
}

/* ---------- 后台 CMS ---------- */

export function saveDish(dish) {
  const idx = store.customDishes.findIndex((d) => d.id === dish.id)
  if (idx >= 0) store.customDishes[idx] = dish
  else store.customDishes.push(dish)
  writeJSON(LS_CUSTOM, store.customDishes)
}

export function deleteCustomDish(id) {
  store.customDishes = store.customDishes.filter((d) => d.id !== id)
  writeJSON(LS_CUSTOM, store.customDishes)
}

export function slugify(name) {
  const base = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || 'dish'}-${Math.random().toString(36).slice(2, 6)}`
}

/** 导出合并后的完整数据 JSON（可直接替换 src/data/dishes.json） */
export function exportJSON() {
  return JSON.stringify({ dishes: dishes.value }, null, 2)
}

export function resetLocalData() {
  localStorage.removeItem(LS_CUSTOM)
  localStorage.removeItem(LS_RATINGS)
  store.customDishes = []
  store.myRatings = {}
}
