<script setup lang="ts">
import { useUser } from '~/stores/userStore'

const user = useUser()
const token = ref(user.token)
const username = ref(user.username)

const router = useRouter()
const go = () => {
  if (user.token && user.username)
    router.push('/calendar')
}
</script>

<template>
  <div mx-auto py-10 max-w="320px">
    <a-typography-title :level="4">
      GitLab worklogs calendar
    </a-typography-title>
    <a-input
      id="input"
      v-model:value="user.token"
      placeholder="Personal token"
      autofocus
      type="text"
      w="320px"
    />

    <users-autocomplete v-if="user.token" v-model="user.username" />

    <a-button
      :disabled="!(user.token && user.username)"
      class="mt-2"
      type="primary"
      @click="go"
    >
      go
    </a-button>
  </div>
</template>
