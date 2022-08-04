<script setup lang="ts">
import { useUser } from '~/composables/user'

const token = $ref(useToken())
const username = $ref(useUser())

const router = useRouter()
const go = () => {
  if (token && username) {
    setToken(token)
    setUser(username)
    router.push('/calendar')
  }
}
</script>

<template>
  <div mx-auto py-10 max-w="320px">
    <a-typography-title :level="4">
      GitLab Worklogs Calendar
    </a-typography-title>
    <a-input
      id="input"
      v-model:value="token"
      placeholder="Personal token"
      autofocus
      type="text"
      w="320px"
    />
    <a-input
      id="user"
      v-model:value="username"
      class="mt-2"
      placeholder="username"
      autofocus
      type="text"
      w="320px"
    />

    <a-button
      :disabled="!(token && username)"
      class="mt-2"
      type="primary"
      @click="go"
    >
      sign in
    </a-button>
  </div>
</template>
