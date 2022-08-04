<script setup lang="ts">
import type { Dayjs, OpUnitType } from 'dayjs'
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

const hoursOf = (date: Dayjs, { range = 'month' }: { range: OpUnitType }) => {
  const dateStart = date.startOf(range)
  const dateEnd = date.endOf(range)

  if (range === 'day')
    console.log(dateStart.format(), dateEnd.format())

  const logs = data.value.filter((log) => {
    const logDate = dayjs(log.spentAt)
    return logDate.isBetween(dateStart, dateEnd, 'days', '[]')
  })

  return logs.reduce((acc, log) => {
    acc += log.timeSpent
    return acc
  }, 0)
}

const onDateChange = (date: Dayjs) => {
  router.replace({
    path: '/calendar',
    query: { ...route.query, date: date.format('YYYY-MM-DD') },
  })

  query.refetch({
    start: formatDate(date.startOf('month')),
    end: formatDate(date.endOf('month')),
  })
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
      <a-spin :spinning="query.loading.value">
        <a-calendar :value="displayDate" :mode="displayMode" @panelChange="onPanelChange" @change="onDateChange">
          <template #monthCellRender="{ current }">
            <log-item-count :hours="hoursOf(current, { range: 'month' })" />
          </template>
          <template #dateCellRender="{ current }">
            <perfect-scrollbar>
              <div class="mb-4! ml-3.5!">
                <a-tag :color="hoursOf(current, { range: 'day' }) !== 8 ? 'red' : 'blue'">
                  {{ hoursOf(current, { range: 'day' }) }}h
                </a-tag>
                <span class="text-xs underline">Всего (часов)</span>
              </div>
              <template v-for="(log, i) of getLogByDay(current)" :key="i">
                <log-item :item="log" />
              </template>
            </perfect-scrollbar>
          </template>
        </a-calendar>
      </a-spin>
    </a-layout-content>
  </a-layout>
</template>

<style>
.ps {
  height: 100%;
}
</style>
