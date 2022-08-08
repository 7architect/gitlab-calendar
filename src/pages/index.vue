<script setup lang="ts">
import { useUser } from '~/stores/userStore'

const user = useUser()
const username = ref(user.username)

const router = useRouter()
const go = () => {
  if (user.token && username.value) {
    user.setUser(username.value)
    router.push('/calendar')
  }
}
</script>

<template>
  <div mx-auto py-10 max-w="320px">
    <div flex flex-col items-center justify-center mb-4>
      <img src="/android-chrome-192x192.png" alt="logo" mb-4 w-10>
      <a-typography-title :level="4">
        GitLab worklogs calendar
      </a-typography-title>
    </div>
    <a-input
      id="input"
      v-model:value="user.token"
      placeholder="Personal token"
      autofocus
      type="password"
      w="320px"
    />

    <users-autocomplete v-if="user.token" v-model="username" />

    <a-button
      :disabled="!(user.token && username)"
      class="mt-2"
      type="primary"
      @click="go"
    >
      go
    </a-button>
  </div>
</template>
