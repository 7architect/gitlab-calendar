import { defineStore } from 'pinia'
import LogRocket from 'logrocket'
import { useApolloClient } from '@vue/apollo-composable'
import type { CurrentUserQuery } from '../../graphql'
import { CurrentUser } from '../../graphql-operations'
import { router } from '~/main'

interface IUserSate {
  username: string
  token: string
  loading: boolean
}

export const useUser = defineStore('users', {
  state: (): IUserSate => {
    return {
      username: '',
      token: '',
      loading: false,
    }
  },
  getters: {
    authenticated: state => !!(state.token && state.username),
  },
  actions: {
    async logout() {
      this.$reset()
      await router.push('/')
    },
    async getUser() {
      try {
        this.loading = true
        const result = await useApolloClient().client.query<CurrentUserQuery>({
          query: CurrentUser,
        })

        await new Promise(resolve => setTimeout(resolve, 500))

        if (result.data.currentUser?.username) {
          this.username = result.data.currentUser.username
          LogRocket.identify(this.username)
        }

        return this.username
      }
      finally {
        this.loading = false
      }

      return null
    },
  },
  persist: {
    afterRestore(context) {
      context.store.getUser()
    },
  },
})
