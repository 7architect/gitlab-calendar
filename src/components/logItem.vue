<script setup lang="ts">
import type { TimeLog } from '~/composables/logs'

const props = defineProps<{ item: TimeLog }>()

const { item } = toRefs(props)

const isMr = computed(() => item.value?.mergeRequest)
const title = computed(() => isMr.value ? item.value.mergeRequest!.title : item.value.issue!.title)
const text = computed(() => item.value?.note?.body)
const status = computed(() => isMr.value ? 'warning' : 'success')
const url = computed(() => isMr.value ? item.value.mergeRequest!.webUrl : item.value.issue!.webUrl || '')
const spent = computed(() => item.value.timeSpent.toFixed(1))
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
        <span class="w-[50px] inline-block"><a-tag>{{ spent }}h</a-tag></span>

        <a-typography-link
          class="mr-1"
          :href="url"
          target="_blank"
        >
          {{ isMr ? `!${item.mergeRequest.iid}` : `#${item.issue.iid}` }}
        </a-typography-link>
        <span>{{ text }}</span>
      </span>
    </div>
  </a-tooltip>
</template>
