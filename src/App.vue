<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <RouterLink to="/" class="logo">
        <span class="chop">🥢</span>
        找菜吃 <small>按菜找好店 · NZ</small>
      </RouterLink>
      <nav style="display:flex;gap:18px;font-size:15px;">
        <RouterLink to="/" style="font-weight:600;">找菜</RouterLink>
        <RouterLink to="/admin" class="muted">后台</RouterLink>
      </nav>
    </div>
  </header>

  <main class="page">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>

  <footer class="footer">
    <div class="container">
      找菜吃 · 不是评店，是评菜 · 新西兰市场测试版 v0.1<br />
      数据为演示种子数据，评分记录保存在您的浏览器本地
    </div>
  </footer>
</template>
