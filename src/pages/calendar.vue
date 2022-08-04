<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { useLogs } from '~/composables/logs'
import { formatDate } from '~/composables/utils'

const router = useRouter()
const route = useRoute()
const displayDate = computed(() => dayjs((route.query?.date as string) || Date.now()))
const displayMode = computed(() => route.query.mode || 'month')

const query = useLogs({
  startDate: displayDate.value.startOf('month'),
  endDate: displayDate.value.endOf('month'),
})
const data = computed(() => {
  const _logs = query.result.value?.group.timelogs.nodes

  if (!_logs)
    return []

  return _logs.map((log) => {
    return {
      ...log,
      spentAt: dayjs(log.spentAt).format(),
      timeSpent: log.timeSpent / 60 / 60,
    }
  })
})

const getLogByDay = (date: Dayjs) => {
  const dayStart = date.startOf('day')
  const dayEnd = date.endOf('day')

  return data.value.filter((log) => {
    const logDate = dayjs(log.spentAt)
    return logDate.isBetween(dayStart, dayEnd, 'hours')
  })
}

const hoursOf = (date: Dayjs) => {
  const dateStart = date.startOf('month')
  const dateEnd = date.endOf('month')

  const monthLogs = data.value.filter((log) => {
    const logDate = dayjs(log.spentAt)
    return logDate.isBetween(dateStart, dateEnd, 'days')
  })

  return monthLogs.reduce((acc, log) => {
    acc += log.timeSpent
    return acc
  }, 0)
}

const onPanelChange = (date: Dayjs, mode: string) => {
  router.replace({
    path: '/calendar',
    query: { date: date.format('YYYY-MM-DD'), mode },
  })

  query.refetch(mode === 'month'
    ? {
        start: formatDate(date.startOf('month')),
        end: formatDate(date.endOf('month')),
      }
    : {
        start: formatDate(date.startOf('year')),
        end: formatDate(date.endOf('year')),
      },
  )
}
</script>

<template>
  <a-layout>
    <a-layout-content>
      <a-spin :spinning="query.loading">
        <a-calendar :value="displayDate" :mode="displayMode" @panelChange="onPanelChange">
          <template #monthCellRender="{ current }">
            <log-item-count :hours="hoursOf(current)" />
          </template>
          <template #dateCellRender="{ current }">
            <template v-for="(log, i) of getLogByDay(current)" :key="i">
              <log-item :item="log" />
            </template>
          </template>
        </a-calendar>
      </a-spin>
    </a-layout-content>
  </a-layout>
</template>
