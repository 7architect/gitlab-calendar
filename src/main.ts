import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { provideApolloClient } from '@vue/apollo-composable'
import isBetween from 'dayjs/plugin/isBetween'
import { createPinia } from 'pinia'
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import dayjs from 'dayjs'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import 'uno.css'

import App from './App.vue'
import { apolloClient } from '~/apollo'
import './styles/main.css'
import { useUser } from '~/stores/userStore'

dayjs.extend(isBetween)

if (!import.meta.env.DEV) {
  import('logrocket').then((LogRocket) => {
    LogRocket.init('pet/gitlab-calendar')
  })
}

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersistedState)

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const user = useUser()
  if (user.authenticated && to.path === '/')
    return '/calendar'

  if (!user.authenticated && to.path === '/calendar')
    return '/'
})

provideApolloClient(apolloClient)

app.use(router)
app.use(pinia)
app.use(PerfectScrollbar)
app.mount('#app')
