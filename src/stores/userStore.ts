import { defineStore } from 'pinia'
import LogRocket from 'logrocket'
import { router } from '~/main'

interface IUserSate {
  username: string
  token: string
}
export const useUser = defineStore('users', {
  state: (): IUserSate => {
    return {
      username: '',
      token: '',
    }
  },
  getters: {
    authenticated: state => state.token && state.username,
  },
  actions: {
    async logout() {
      this.$reset()
      await router.push('/')
    },
    setUser(username: string) {
      LogRocket.identify(username, { username })
      this.$patch({ username })
    },
  },
  persist: true,
})
