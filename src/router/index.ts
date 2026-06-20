import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Which slide transition to play; set per-navigation by the guard below. */
    transition?: string
  }
}

// Hash history works inside the Capacitor Android WebView (file:// origin) where
// HTML5 history routing would 404 on reload/deep-link.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/slide/:n',
      name: 'slide',
      component: () => import('../views/SlideView.vue'),
    },
  ],
})

// Pick the horizontal slide direction by comparing page indices (Home = 0, slide n = n).
// Forward (new page from the right) when moving up the chain, back otherwise. The very
// first navigation has no real `from`, so it plays no animation.
const pageIndex = (r: RouteLocationNormalized) => (r.name === 'home' ? 0 : Number(r.params.n))
router.beforeEach((to, from) => {
  const fromIdx = pageIndex(from)
  to.meta.transition =
    from.name === undefined || Number.isNaN(fromIdx)
      ? 'none'
      : pageIndex(to) >= fromIdx
        ? 'slide-forward'
        : 'slide-back'
})

export default router
