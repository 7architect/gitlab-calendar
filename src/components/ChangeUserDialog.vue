<script setup lang="ts">
import { useUser } from '~/stores/userStore'

const props = defineProps<{ visible: boolean; loading?: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'changed', value: string): void
}>()

const user = useUser()

const proxyVisible = computed({
  get: () => props.visible,
  set(value) {
    emit('update:visible', value)
  },
})

const newUser = ref('')
const changeUser = () => {
  proxyVisible.value = false
  emit('changed', newUser.value)
  newUser.value = ''
}
</script>

<template>
  <a-modal
    v-model:visible="proxyVisible"
    :confirm-loading="props.loading"
    title="Change user" @ok="changeUser"
  >
    <div flex justify-center>
      <users-autocomplete v-model="newUser" />
    </div>
  </a-modal>
</template>
