<script setup lang="ts" xmlns:hover="http://www.w3.org/1999/xhtml">
import type { Dayjs, OpUnitType } from 'dayjs'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { formatDate } from '~/composables/utils'
import { userLogsStore } from '~/stores/userLogsStore'
import { useUser } from '~/stores/userStore'

const router = useRouter()
const route = useRoute()
const user = useUser()

const displayDate = computed({
  get: () => dayjs((route.query?.date as string) || Date.now()),
  set(value: Dayjs) {
    router.replace({ ...route, query: { ...route.query, date: formatDate(value) } })
  },
})

const displayMode = computed({
  get: () => (route.query.mode as OpUnitType) || 'month',
  set(mode: OpUnitType) {
    router.replace({ ...route, query: { ...route.query, mode } })
  },
})

const displayUser = computed({
  get: () => (route.query.user as string) || toRaw(user.username),
  set(user: string) {
    router.replace({ ...route, query: { ...route.query, user } })
  },
})

const displayMonth = computed(() => displayDate.value.format('MMMM'))

const fetchVariables = computed(() => ({
  start: formatDate(displayDate.value.startOf(displayMode.value)),
  end: formatDate(displayDate.value.endOf(displayMode.value)),
  user: displayUser.value,
}))

const userLogs = userLogsStore()
userLogs.fetchLogsAggregated(fetchVariables.value)

const totalSpent = computed(() => userLogs.hoursOf(displayDate.value, { range: displayMode.value }))

watch(fetchVariables, () => {
  userLogs.fetchLogsAggregated(fetchVariables.value)
})

const getHoursColor = (hours: number) => {
  if (hours < 8)
    return 'red'
  else if (hours > 8)
    return 'orange'
  else if (hours === 8.0)
    return 'green'
  else return null
}

const onPanelChange = (_: any, mode: OpUnitType) => {
  displayMode.value = mode
}
const onChange = () => {
  if (displayMode.value === 'year')
    displayMode.value = 'month'
}

const changeUserVisibleModal = ref(false)
const onUserChanged = (user: string) => {
  displayUser.value = user
}

const indicator = h(LoadingOutlined, {
  style: { fontSize: '24px' },
  spin: true,
})

const showIssues = ref(true)
const showMrs = ref(true)

const isNow = (date: Dayjs) => dayjs().date() === date.date()
</script>

<template>
  <change-user-dialog v-model:visible="changeUserVisibleModal" :loading="userLogs._loading" @changed="onUserChanged" />

  <a-page-header
    :title="`Calendar for ${displayMonth}`"
    :sub-title="user.username !== displayUser ? `timelogs for @${displayUser}` : `@${displayUser}`"
    @back="user.logout"
  >
    <template #tags>
      <a-button size="small" type="outline" @click="changeUserVisibleModal = true">
        change user
      </a-button>
      <a-button
        v-show="user.username !== displayUser"
        size="small"
        type="outline"
        color="red"
        ml-2
        @click="displayUser = user.username"
      >
        reset user
      </a-button>
    </template>

    <a-row type="flex">
      <a-statistic title="Total spent hours" :value="userLogs._loading ? '—' : totalSpent">
        <template #formatter>
          <a-skeleton-button v-if="userLogs._loading" active block />
          <span v-else>{{ totalSpent }}</span>
        </template>
      </a-statistic>
    </a-row>
    <div my-4 />
    <a-col>
      <a-row>
        <label flex items-center mt-2>
          <a-switch v-model:checked="showIssues" size="small" />
          <a-typography-text ml-4>Show issues ({{ userLogs.onlyIssues.length }})</a-typography-text>
          <div mx-2 mt="2px">
            <a-badge status="success" />
          </div>
        </label>
      </a-row>

      <a-row>
        <label flex items-center mt-2>
          <a-switch v-model:checked="showMrs" size="small" />
          <a-typography-text ml-4>Show merge requests ({{ userLogs.onlyMergeRequests.length }})</a-typography-text>
          <div mx-2 mt="2px">
            <a-badge status="warning" />
          </div>
        </label>
      </a-row>
    </a-col>
  </a-page-header>

  <a-layout>
    <a-spin :spinning="userLogs._loading" :indicator="indicator">
      <a-layout-content>
        <a-card>
          <a-calendar v-model:value="displayDate" :mode="displayMode" @change="onChange" @panel-change="onPanelChange">
            <template #monthCellRender="{ current }">
              <log-item-count :hours="userLogs.hoursOf(current, { range: 'month' })" />
            </template>
            <template #dateFullCellRender="{ current }">
              <dialog-wrapper
                h-auto border-t-2 border-gray-200 mx-1 py="8px" px="4px" class="group"
                transition duration-1000
                hover="bg-gray-100 border-gray-400 duration-300!"
                :class="{
                  'bg-red-50! border-red-100!': ['Sa', 'Su'].includes(current.format('dd')),
                  'bg-blue-50! border-blue-500!': isNow(current),
                }"
              >
                <template #default="{ visible, doneSignal, listeners }">
                  <create-timelog-note-dialog :visible="visible" :done-signal="doneSignal" :timelog-date="current" />

                  <a-popover trigger="hover">
                    <template #content>
                      <a p-1 block v-on="listeners">
                        log time
                      </a>

                      <a p-1 disabled block>
                        show history
                      </a>
                    </template>

                    <div @click.stop.prevent>
                      <a-row mb-4>
                        <a-col justify="center">
                          <span v-if="userLogs.hoursOf(current, { range: 'day' })" ml-4>
                            <a-tag
                              :color="getHoursColor(userLogs.hoursOf(current, { range: 'day' }))"
                            >
                              {{ userLogs.hoursOf(current, { range: 'day' }) }}h
                            </a-tag>
                            <span class="text-sm underline mr-2">total</span>
                          </span>
                        </a-col>

                        <a-col flex="auto">
                          {{ current.format('DD') }}
                        </a-col>
                      </a-row>

                      <perfect-scrollbar v-if="userLogs.day(current)" style="height: 100px">
                        <template v-for="(log, i) of userLogs.day(current)" :key="i">
                          <div v-show="showIssues && !!log.node.issue">
                            <log-item :item="log.node" />
                          </div>
                          <div v-show="showMrs && !!log.node.mergeRequest">
                            <log-item :item="log.node" />
                          </div>
                        </template>
                      </perfect-scrollbar>
                    </div>
                  </a-popover>
                </template>
              </dialog-wrapper>
            </template>
          </a-calendar>
        </a-card>
      </a-layout-content>
    </a-spin>
  </a-layout>
</template>

<style>
.ps {
  height: 100%;
}
</style>
