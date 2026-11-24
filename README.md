# 找菜吃 🥢

按「具体菜名」评分和发现餐厅的极简 Web 工具（新西兰市场测试）。
搜菜 → 看推荐餐厅 → 给这个菜打分。**无需注册。**

## 技术栈

- Vue 3（Composition API）+ Vue Router（hash 模式，纯静态可托管）
- Vite 构建，无后端、无数据库
- 数据：`src/data/dishes.json` 静态种子数据；用户评分存 localStorage

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

## 功能说明

| 功能 | 说明 |
| --- | --- |
| 首页搜索 | 支持中/英文菜名、店名、分类模糊搜索，热门菜卡片列表 |
| 菜品详情页 | 推荐餐厅按综合评分排序，含地址/城市/价位/电话与种子简评 |
| 打分 | 星级 + 简评 + 算术验证码；提交存 localStorage，同一设备对同一「菜×店」仅一条评分（重复提交即覆盖，轻量防刷） |
| 综合评分 | `(初始评分 × 初始人数 + 我的评分) / (初始人数 + 1)` |
| 简易后台 `/admin` | 添加菜品、给菜品关联餐厅、导出 `dishes.json`、清空本地数据 |

## 数据维护流程

1. 本地 `npm run dev` → 打开 `#/admin` 添加菜品和餐厅（存于浏览器 localStorage）
2. 点击「导出 dishes.json」
3. 用导出的文件替换 `src/data/dishes.json`
4. `npm run build` 并部署，数据即对所有人可见

也可以直接手改 `src/data/dishes.json`，字段结构：

```json
{
  "dishes": [{
    "id": "mapo-tofu", "nameZh": "麻婆豆腐", "nameEn": "Mapo Tofu",
    "emoji": "🌶️", "category": "川菜", "desc": "...", "hot": true,
    "restaurants": [{
      "id": "cd-restaurant", "nameZh": "老川王", "nameEn": "...",
      "address": "...", "city": "Auckland", "price": "$$", "phone": "...",
      "baseRating": 4.6, "baseCount": 48,
      "baseReviews": [{ "author": "...", "rating": 5, "comment": "..." }]
    }]
  }]
}
```

## 部署

- **Netlify**：构建命令 `npm run build`，发布目录 `dist`
- **Vercel**：框架选 Vite，其余默认
- **GitHub Pages**：`vite.config.js` 中设置 `base: '/<仓库名>/'`，推送 `dist` 内容

> 当前演示数据为虚构种子数据，仅用于市场测试。
