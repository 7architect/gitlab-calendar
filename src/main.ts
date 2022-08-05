import { createApp } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { provideApolloClient } from '@vue/apollo-composable'
import isBetween from 'dayjs/plugin/isBetween'

import './styles/main.css'
import 'uno.css'
import dayjs from 'dayjs'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import App from './App.vue'
import { apolloClient } from '~/apollo'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'

dayjs.extend(isBetween)

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as RouteRecordRaw[],
})

router.beforeEach((to) => {
  if (!useToken().value && to.path === '/calendar')
    return '/'
})

provideApolloClient(apolloClient)

app.use(router)
app.use(PerfectScrollbar)
app.mount('#app')
