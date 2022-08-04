<script setup lang="ts">
const token = $ref('')

const router = useRouter()
const go = () => {
  if (token) {
    setToken(token)
    router.push('/calendar')
  }
}
</script>

<template>
  <div flex justify-center>
    <div py-4 />

    <input
      id="input"
      v-model="token"
      placeholder="app token"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
      @keydown.enter="go"
    >

    <button
      class="m-3 text-sm btn"
      :disabled="!token"
      @click="go"
    >
      Go
    </button>
  </div>
</template>
