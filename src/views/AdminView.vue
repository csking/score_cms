<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dishes, saveDish, deleteCustomDish, slugify, exportJSON, resetLocalData, myRatingCount } from '../store'

const router = useRouter()

/* ---------- 添加菜品 ---------- */
const newDish = ref({ nameZh: '', nameEn: '', emoji: '🍲', category: '家常菜', desc: '', hot: false })
const dishMsg = ref('')

function addDish() {
  const d = newDish.value
  if (!d.nameZh.trim()) { dishMsg.value = '菜名（中文）必填'; return }
  const dish = {
    id: slugify(d.nameEn || d.nameZh),
    nameZh: d.nameZh.trim(),
    nameEn: (d.nameEn || '').trim(),
    emoji: d.emoji || '🍲',
    category: d.category || '其他',
    desc: d.desc.trim(),
    hot: !!d.hot,
    restaurants: [],
  }
  if (dishes.value.some((x) => x.id === dish.id)) {
    dishMsg.value = 'ID 重复，请换一个英文名'
    return
  }
  saveDish(dish)
  dishMsg.value = ''
  newDish.value = { nameZh: '', nameEn: '', emoji: '🍲', category: '家常菜', desc: '', hot: false }
  router.push(`/dish/${dish.id}`)
}

/* ---------- 给菜品添加餐厅 ---------- */
const selectedDishId = ref(dishes.value[0]?.id || '')
const newRest = ref({ nameZh: '', nameEn: '', address: '', city: 'Auckland', price: '$$', phone: '', baseRating: 4, baseCount: 0 })
const restMsg = ref('')

const selectedDish = computed(() => dishes.value.find((d) => d.id === selectedDishId.value))

function addRestaurant() {
  const dish = selectedDish.value
  const r = newRest.value
  if (!dish) { restMsg.value = '请先选择菜品'; return }
  if (!r.nameZh.trim() || !r.address.trim()) { restMsg.value = '店名和地址必填'; return }
  const rest = {
    id: slugify(r.nameEn || r.nameZh),
    nameZh: r.nameZh.trim(),
    nameEn: (r.nameEn || '').trim(),
    address: r.address.trim(),
    city: r.city || 'Auckland',
    price: r.price || '$$',
    phone: r.phone.trim(),
    baseRating: Math.min(5, Math.max(0, Number(r.baseRating) || 0)),
    baseCount: Math.max(0, Number(r.baseCount) || 0),
    baseReviews: [],
  }
  // 保存为“自定义菜品”：种子数据 + 新餐厅合并
  const merged = JSON.parse(JSON.stringify(dish))
  merged.restaurants = [...(merged.restaurants || []), rest]
  saveDish(merged)
  restMsg.value = ''
  newRest.value = { nameZh: '', nameEn: '', address: '', city: 'Auckland', price: '$$', phone: '', baseRating: 4, baseCount: 0 }
}

/* ---------- 导出 / 重置 ---------- */
function exportData() {
  const blob = new Blob([exportJSON()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'dishes.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

function resetData() {
  if (confirm('确定清空本地自定义数据与本机所有评分？')) {
    resetLocalData()
    router.push('/')
  }
}
</script>

<template>
  <div class="container">
    <header class="admin-head">
      <div>
        <h1>简易后台</h1>
        <p class="muted">添加菜品 / 关联餐厅。数据保存在浏览器 localStorage，可导出为 JSON 固化到 `src/data/dishes.json`。</p>
      </div>
    </header>

    <section class="card block">
      <h2>➕ 添加菜品</h2>
      <div class="form-grid">
        <label>菜名（中文）* <input v-model="newDish.nameZh" placeholder="例：酸菜鱼" /></label>
        <label>菜名（英文） <input v-model="newDish.nameEn" placeholder="例：Suancai Fish" /></label>
        <label>Emoji <input v-model="newDish.emoji" placeholder="🐟" /></label>
        <label>分类
          <select v-model="newDish.category">
            <option v-for="c in ['川菜','粤菜','家常菜','点心','面食','火锅','烧腊','其他']" :key="c">{{ c }}</option>
          </select>
        </label>
        <label class="full">简介 <textarea v-model="newDish.desc" rows="2" placeholder="一句话介绍这道菜"></textarea></label>
        <label class="check full"><input type="checkbox" v-model="newDish.hot" /> 加入首页热门推荐</label>
      </div>
      <p v-if="dishMsg" class="err">{{ dishMsg }}</p>
      <button class="btn" @click="addDish">保存并前往</button>
    </section>

    <section class="card block">
      <h2>🏪 给菜品关联餐厅</h2>
      <label class="sel-dish">
        选择菜品
        <select v-model="selectedDishId">
          <option v-for="d in dishes" :key="d.id" :value="d.id">{{ d.emoji }} {{ d.nameZh }}（{{ (d.restaurants || []).length }} 家）</option>
        </select>
      </label>
      <div class="form-grid">
        <label>店名（中文）* <input v-model="newRest.nameZh" placeholder="例：锦里小馆" /></label>
        <label>店名（英文） <input v-model="newRest.nameEn" placeholder="例：Jinli Bistro" /></label>
        <label class="full">地址 * <input v-model="newRest.address" placeholder="例：12 Queen St, Auckland CBD" /></label>
        <label>城市
          <select v-model="newRest.city">
            <option v-for="c in ['Auckland','Wellington','Christchurch','Hamilton','Dunedin','Queenstown','其他']" :key="c">{{ c }}</option>
          </select>
        </label>
        <label>价位
          <select v-model="newRest.price">
            <option v-for="p in ['$','$$','$$$']" :key="p">{{ p }}</option>
          </select>
        </label>
        <label>电话 <input v-model="newRest.phone" placeholder="09-xxx xxxx" /></label>
        <label>初始评分（0-5） <input v-model="newRest.baseRating" type="number" min="0" max="5" step="0.1" /></label>
        <label>初始评分数 <input v-model="newRest.baseCount" type="number" min="0" /></label>
      </div>
      <p v-if="restMsg" class="err">{{ restMsg }}</p>
      <button class="btn" @click="addRestaurant">添加到「{{ selectedDish?.nameZh || '请选择' }}」</button>
    </section>

    <section class="card block">
      <h2>📦 数据管理</h2>
      <p class="muted">
        当前共 {{ dishes.length }} 道菜；本机评分记录 {{ myRatingCount() }} 条。
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn ghost" @click="exportData">⬇️ 导出 dishes.json</button>
        <button class="btn ghost danger" @click="resetData">🗑️ 清空本地数据</button>
      </div>
      <p class="muted small">
        导出后替换 <code>src/data/dishes.json</code> 重新构建，即可将数据固化给所有用户。
      </p>
    </section>

    <section class="card block">
      <h2>📋 菜品一览</h2>
      <table class="dtable">
        <thead><tr><th>菜</th><th>餐厅数</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="d in dishes" :key="d.id">
            <td>{{ d.emoji }} {{ d.nameZh }}</td>
            <td>{{ (d.restaurants || []).length }}</td>
            <td>
              <router-link :to="`/dish/${d.id}`" class="lnk">查看</router-link>
              <a v-if="d.restaurants?.length === 0" class="lnk del" href="#" @click.prevent="deleteCustomDish(d.id)">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="muted small">仅能删除无餐厅关联的自定义菜品（避免误删种子数据）。</p>
    </section>
  </div>
</template>

<style scoped>
.admin-head h1 { margin: 0 0 4px; font-size: 24px; }
.admin-head { margin-bottom: 24px; }
.block { padding: 22px; margin-bottom: 18px; }
.block h2 { margin: 0 0 16px; font-size: 17px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #5d5042; }
.form-grid .full { grid-column: 1 / -1; }
.form-grid .check { flex-direction: row; align-items: center; gap: 8px; }
.form-grid .check input { width: auto; }
.sel-dish { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; max-width: 340px; margin-bottom: 14px; }
.err { color: #d0342c; font-weight: 600; font-size: 14px; margin: 0 0 10px; }
.small { font-size: 12px; }
.dtable { width: 100%; border-collapse: collapse; font-size: 14px; }
.dtable th, .dtable td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); }
.dtable th { color: var(--muted); font-size: 12px; }
.lnk { color: var(--brand); font-weight: 600; margin-right: 12px; }
.lnk.del { color: #d0342c; }
.btn.danger { border-color: #d0342c; color: #d0342c; }
.btn.danger:hover { background: #fdeceb; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
