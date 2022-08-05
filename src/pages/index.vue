<script setup lang="ts">
import { useUser } from '~/composables/user'
import { useUsers } from '~/composables/users'

const token = ref(useToken())
const username = ref(useUser())
const usersQuery = useUsers()
const users = computed(() => usersQuery.result.value?.users.nodes.map(u => ({ value: u.username })))

watch(token, () => {
  setToken(token.value ?? '')
  usersQuery.refetch()
})

const router = useRouter()
const go = () => {
  if (token.value && username.value) {
    setUser(username.value)
    router.push('/calendar')
  }
}
</script>

<template>
  <div mx-auto py-10 max-w="320px">
    <a-typography-title :level="4">
      GitLab worklogs calendar
    </a-typography-title>
    <a-input
      id="input"
      v-model:value="token"
      placeholder="Personal token"
      autofocus
      type="text"
      w="320px"
    />
    <a-auto-complete
      v-if="token"
      id="user"
      v-model:value="username"
      :options="users"
      class="mt-2"
      placeholder="username"
      autofocus
      type="text"
      w="320px"
      @search="onSearch"
    />

    <a-button
      :disabled="!(token && username)"
      class="mt-2"
      type="primary"
      @click="go"
    >
      go
    </a-button>
  </div>
</template>
