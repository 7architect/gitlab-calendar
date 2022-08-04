<script setup lang="ts">
import type { TimeLog } from '~/composables/logs'

const props = defineProps<{ item: TimeLog }>()

const { item } = toRefs(props)

const isMr = computed(() => item.value?.mergeRequest)
const title = computed(() => isMr.value ? item.value.mergeRequest!.title : item.value.issue!.title)
const text = computed(() => item.value?.note?.body)
const status = computed(() => isMr.value ? 'warning' : 'success')
const url = computed(() => isMr.value ? item.value.mergeRequest!.webUrl : item.value.issue!.webUrl || '')
</script>

<template>
  <a-tooltip placement="left">
    <template #title>
      <div class="font-bold">
        <a-tag v-if="isMr" color="orange">
          merge request #{{ item.mergeRequest.iid }}
        </a-tag>
        <a-tag v-else color="green">
          issue #{{ item.issue.iid }}
        </a-tag>

        <br>

        <b>{{ title }}</b>
      </div>
      <br>
      {{ text }}
    </template>

    <div flex items-center mb-2>
      <a-badge :status="status" />
      <span
        class="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full"
        style="text-overflow: ellipsis"
      >
        <a-tag>{{ item.timeSpent }}h</a-tag>

        <a class="text-black! opacity-80!" :href="url" target="_blank">
          <span v-if="text">{{ text }}</span>
          <span v-else class="opacity-50">без текста</span>
        </a>
      </span>
    </div>
  </a-tooltip>
</template>
