import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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

export default router
