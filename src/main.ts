import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { provideApolloClient } from '@vue/apollo-composable'
import isBetween from 'dayjs/plugin/isBetween'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'
import dayjs from 'dayjs'
import App from './App.vue'
import { apolloClient } from '~/apollo'

dayjs.extend(isBetween)

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
provideApolloClient(apolloClient)

app.use(router)
app.mount('#app')
