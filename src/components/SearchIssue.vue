<script setup lang="ts">
import { defineProps } from 'vue'
import { debounce } from 'lodash'
import type { SelectProps } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { IssueFragment } from '../../graphql'
import { useIssues } from '~/stores/issuesStore'

const props = defineProps<{
  modelValue: Object | null
  issue: IssueFragment | null
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
    issueModel.value = issues.issues.find(issue => issue.id === value) ?? null
  },
})

const searchValue = ref('')
const search = debounce((value: string) => {
  if (value.length === 0)
    return
  issues.searchIssue(value)
}, 500)
const searchOptions = computed<SelectProps['options']>(() => issues.issues.map(issue => ({
  label: issue.title,
  value: issue.id,
  id: issue.iid,
})))
</script>

<template>
  <a-select
    v-model:value="model"
    show-search
    placeholder="Find issue by title"
    style="width: 100%"
    :loading="issues.loading"
    :default-active-first-option="false"
    :filter-option="false"
    :options="searchOptions"
    @search="search"
  >
    <template #option="{ label, id }">
      <div>
        <a class="mr-2">#{{ id }}</a> {{ label }}
      </div>
    </template>
    <template #notFoundContent>
      <div flex items-center>
        <SearchOutlined mr-4 />
        <span>Type for search issue</span>
      </div>
    </template>
  </a-select>
</template>
