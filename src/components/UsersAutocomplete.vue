<script setup lang="ts">
import { debounce } from 'lodash'
import { useUsers } from '~/composables/users'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': string }>()

const { modelValue: value } = toRefs(props)

const usersQuery = useUsers()
const users = computed(() => usersQuery.result.value?.users.nodes.map(u => ({ value: u.username })))

const onSearch = debounce((input: string) => {
  return usersQuery.refetch({
    search: input.toLowerCase(),
  })
}, 300)
</script>

<template>
  <a-auto-complete
    v-if="token"
    id="user"
    :value="value"
    :options="users"
    class="mt-2"
    placeholder="username"
    autofocus
    type="text"
    w="320px"
    @change="emit('update:modelValue', $event)"
    @search="onSearch"
  />
</template>
