<script setup lang="ts">
import { debounce } from 'lodash'
import { useUsers } from '~/composables/users'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { modelValue: value } = toRefs(props)
const searchValue = ref('')
const usersQuery = useUsers()
const users = computed(() => usersQuery.result.value?.users.nodes.map(u => ({ value: u.username })))

const onSearch = debounce((input: string) => {
  return usersQuery.refetch({
    search: input.toLowerCase(),
  })
}, 300)

const onSelect = (value: string) => emit('update:modelValue', value)
</script>

<template>
  <a-auto-complete
    id="user"
    v-model:value="searchValue"
    :value="value"
    :options="users"
    class="mt-2"
    placeholder="username"
    autofocus
    type="text"
    w="320px"
    @select="onSelect"
    @search="onSearch"
  />
</template>
