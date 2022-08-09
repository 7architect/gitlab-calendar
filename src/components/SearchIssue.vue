<script setup lang="ts">
import { defineProps } from 'vue'
import { debounce } from 'lodash'
import { useIssues } from '~/stores/issuesStore'

const props = defineProps<{
  modelValue: Object | null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:issue', value: string): void
}>()

const issueModel = useVModel(props, 'issue', emit)
const modelValue = useVModel(props, 'modelValue', emit)

const issues = useIssues()

const model = computed({
  get() {
    return modelValue.value
  },
  set(value) {
    modelValue.value = value
    issueModel.value = issues.issues.find(issue => issue.node?.id === value)
  },
})

const searchValue = ref('')
const search = debounce((value: string) => {
  issues.searchIssue(value)
}, 500)
const searchOptions = computed(() => issues.issues.map(issue => ({
  label: issue.node?.title,
  value: issue.node?.id,
})))
</script>

<template>
  <a-select
    v-model:value="model"
    show-search
    placeholder="Find issue by title"
    style="width: 100%"
    :default-active-first-option="false"
    :show-arrow="false"
    :filter-option="false"
    :options="searchOptions"
    @search="search"
  />
</template>
