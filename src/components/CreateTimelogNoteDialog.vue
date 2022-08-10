<script setup lang="ts">
import type { Signal } from 'signals'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { reactive, ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import type { IssueEdge } from '../../graphql'
import { useIssues } from '~/stores/issuesStore'

const props = defineProps<{
  doneSignal: Signal
  timelogDate: Dayjs
}>()

const data = reactive<{
  date: Dayjs
  issue: string | null
  spent: string | null
  comment: string | null
}>({
  date: props.timelogDate || dayjs(),
  issue: null,
  spent: null,
  comment: null,
})

const formRef = ref<FormInstance>()

const issues = useIssues()
const selectedIssue = ref<IssueEdge>()

const totalSpentPercent = computed(() => {
  if (!selectedIssue.value?.node)
    return 0
  const issueTotalSpent = selectedIssue.value.node.totalTimeSpent
  const estimate = selectedIssue.value.node.timeEstimate
  return (issueTotalSpent / estimate) * 100
})

const toHours = (value: number) => value / 60 / 60
const estimateTitle = computed(() => !selectedIssue.value?.node
  ? null
  : `Est: ${toHours(selectedIssue.value?.node.timeEstimate)}h, spent: ${toHours(selectedIssue.value?.node.totalTimeSpent)}`,
)

const validateSpent = v => /^((\d+mo)\s?)|((\d+w)\s?)|((\d+d)\s?)|((\d+h)\s?)|((\d+m)\s?)$/g.test(v)
const spentStringValidator = async (_, value: string) => {
  if (!validateSpent(value))
    return Promise.reject(Error('Invalid format, expected <time><time_unit>'))

  return Promise.resolve()
}

const valid = computed(() => {
  return data.date?.isValid() && data.issue !== null && validateSpent(data.spent)
})

const noteUrl = ref('')
const sent = ref(false)
const confirmLoading = ref(false)

const handleOk = async () => {
  try {
    if (!(await formRef.value?.validateFields()))
      return

    // TODO: data type same as createTimelog params
    // TODO: improve validation for empty strings
    const timelogUrl = await issues.createTimelog(data as { spent: string; issue: string; comment: string; date: Dayjs })

    if (timelogUrl?.note?.url)
      noteUrl.value = timelogUrl.note.url

    sent.value = true
  }
  catch (e) {

  }
  finally {
    confirmLoading.value = false
  }
}

const close = () => {
  props.doneSignal.dispatch()
  sent.value = false
  formRef.value?.resetFields()
}
</script>

<template>
  <a-modal :closable="false" :z-index="9999">
    <template #footer>
      <div v-if="sent">
        <a-button type="primary" :href="noteUrl" target="_blank">
          View log
        </a-button>
        <a-button @click="close">
          close
        </a-button>
      </div>
      <div v-else>
        <a-button type="outline" :disabled="confirmLoading" @click="close">
          cancel
        </a-button>
        <a-button type="primary" :loading="confirmLoading" :disabled=" !valid" ml-4 @click="handleOk">
          save
        </a-button>
      </div>
    </template>

    <div relative>
      <div v-if="sent" absolute z-50 top-0 left-0 bg-white w-full h-full flex justify-center items-center>
        <a-result
          status="success"
          title="Done"
          sub-title="Time log was saved in your Gitlab issue"
        />
      </div>

      <a-form ref="formRef" layout="vertical" :model="data">
        <a-form-item name="issue" label="Issue" :rules="[{ required: true, message: 'select an issue' }]">
          <search-issue v-model="data.issue" v-model:issue="selectedIssue" placeholder="Type for search issue" w-full />
        </a-form-item>

        <div v-if="data.issue" w-full>
          <a-progress :percent="totalSpentPercent" :show-info="false" :title="estimateTitle" />
          <div class="text-xs">
            {{ estimateTitle }}
          </div>
        </div>

        <a-form-item name="date" label="Date" :rules="[{ required: true, message: 'Date required' }]">
          <a-date-picker v-model:value="data.date" placeholder="Spent date" />
        </a-form-item>

        <a-form-item name="spent" label="Time spent" :rules="[{ required: true, validator: spentStringValidator }]">
          <a-input v-model:value="data.spent" placeholder="time<1h30m>" />
        </a-form-item>

        <a-form-item name="comment" label="Comment">
          <a-textarea v-model:value="data.comment" placeholder="Additional comment" :rows="4" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped>
.ant-picker {
  width: 100%;
}
</style>
