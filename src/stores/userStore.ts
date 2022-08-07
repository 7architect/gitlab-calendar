import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

interface IUserSate {
  username: string
  token: string
}

export const useUser = defineStore<'users', IUserSate>('users', {
  state: () => {
    return {
      username: '',
      token: '',
    }
  },
  actions: {
    async logout() {
      this.$reset()
      await useRouter().push('/')
    },
  },
  persist: true,
})
