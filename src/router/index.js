import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DishView from '../views/DishView.vue'
import AdminView from '../views/AdminView.vue'

// hash 模式：静态托管（Netlify/Vercel/GitHub Pages）无需服务端配置
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/dish/:id', name: 'dish', component: DishView, props: true },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  },
})

export default router
