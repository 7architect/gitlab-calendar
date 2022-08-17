<script setup lang="ts">
import { LoadingOutlined } from '@ant-design/icons-vue'
import { useUser } from '~/stores/userStore'

const indicator = h(LoadingOutlined, {
  style: { fontSize: '24px' },
  spin: true,
})
const user = useUser()
</script>

<template>
  <a-spin :spinning="user.loading" :indicator="indicator" min-h-screen min-w-screen tip="Loading user">
    <main>
      <a-config-provider>
        <router-view v-if="!user.loading" />
      </a-config-provider>
    </main>
  </a-spin>
</template>
