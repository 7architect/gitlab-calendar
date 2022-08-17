<script setup lang="ts">
import { useUser } from '~/stores/userStore'

const user = useUser()

const router = useRouter()
const go = async () => {
  try {
    const username = await user.getUser()
    if (username)
      await router.push('/calendar')
  }
  catch (e) {
    console.error(e)
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

    <!--    <users-autocomplete v-if="user.token" v-model="username" /> -->

    <a-button
      :disabled="!user.token"
      class="mt-2"
      type="primary"
      @click="go"
    >
      go
    </a-button>
  </div>
</template>
