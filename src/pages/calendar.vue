<script setup lang="ts">
import type { Dayjs, OpUnitType } from 'dayjs'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import mergeDeep from 'lodash/merge'
import { useLogs } from '~/composables/logs'
import { formatDate } from '~/composables/utils'

const router = useRouter()
const route = useRoute()
const displayDate = computed(() => dayjs((route.query?.date as string) || Date.now()))
const displayMode = computed(() => (route.query.mode as OpUnitType) || 'month')

const query = useLogs({
  startDate: unref(displayDate).startOf(displayMode.value),
  endDate: unref(displayDate).endOf(displayMode.value),
})

query.onResult(() => {
  const lastEdgeIndex = query!.result.value!.group.timelogs.edges.length - 1
  const nextCursor = query!.result.value!.group.timelogs.edges[lastEdgeIndex].cursor
  const hasMore = query!.result.value!.group.timelogs.pageInfo.hasNextPage

  if (hasMore) {
    query.fetchMore({
      variables: {
        start: formatDate(displayDate.value.startOf(displayMode.value)),
        end: formatDate(displayDate.value.endOf(displayMode.value)),
        after: nextCursor,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const prevEdges = previousResult.group?.timelogs.edges || []
        const newEdges = fetchMoreResult?.group.timelogs.edges
        const pageInfo = fetchMoreResult?.group.timelogs.pageInfo

        return newEdges
          ? {
              group: {
                __typename: 'Group',
                timelogs: {
                  __typename: 'TimelogConnection',
                  edges: [
                    ...prevEdges,
                    ...newEdges,
                  ],
                  pageInfo: fetchMoreResult.group.timelogs.pageInfo,
                },
              },
            }
          : previousResult
      },
    })
  }
},
)

watch(route, () => {
  query.refetch({
    start: formatDate(displayDate.value.startOf(displayMode.value)),
    end: formatDate(displayDate.value.endOf(displayMode.value)),
    user: useUser(),
  })
})

const user = useUser()
const data = computed(() => {
  const logs = query.result.value?.group.timelogs.edges.map(edge => edge.node)

  if (!logs)
    return []

  return logs.map((log) => {
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
    return logDate.isBetween(dayStart, dayEnd, 'minutes')
  })
}

const hoursOf = (date: Dayjs, { range = 'month' }: { range: OpUnitType }) => {
  const dateStart = date.startOf(range)
  const dateEnd = date.endOf(range)

  const logs = data.value.filter((log) => {
    const logDate = dayjs(log.spentAt)
    return logDate.isBetween(dateStart, dateEnd, 'days', '[]')
  })

  return logs.reduce((acc, log) => {
    acc += log.timeSpent
    return acc
  }, 0).toFixed(1)
}

const onDateChange = (date: Dayjs) => {
  router.replace({
    path: '/calendar',
    query: { ...route.query, date: date.format('YYYY-MM-DD') },
  })
}

const onPanelChange = (date: Dayjs, mode: string) => {
  router.replace({
    path: '/calendar',
    query: { date: date.format('YYYY-MM-DD'), mode },
  })
}

const signOut = () => {
  localStorage.removeItem('token')
  router.back()
}

const totalSpent = computed(() => hoursOf(displayDate.value, { range: 'month' }))
const displayMonthLocale = computed(() => displayDate.value.locale('ru_RU').format('MMMM'))
</script>

<template>
  <a-page-header
    ghost
    :title="`Calendar for ${displayMonthLocale}`"
    :sub-title="user"
    @back="signOut"
  >
    <a-button @click="more">
      more
    </a-button>
    <a-statistic title="Total" :value="query.loading.value ? '—' : totalSpent" :suffix="!query.loading.value && 'h'" />
  </a-page-header>

  <a-layout>
    <a-spin :spinning="query.loading.value">
      <a-layout-content>
        <a-card>
          <a-calendar :value="displayDate" :mode="displayMode" @panel-change="onPanelChange" @change="onDateChange">
            <template #monthCellRender="{ current }">
              <log-item-count :hours="hoursOf(current, { range: 'month' })" />
            </template>
            <template #dateCellRender="{ current }">
              <perfect-scrollbar v-if="getLogByDay(current).length > 0">
                <div class="mb-4! ml-3.5!">
                  <a-tag v-if="hoursOf(current, { range: 'day' }) > 8" color="orange">
                    {{ hoursOf(current, { range: 'day' }) }}h
                  </a-tag>
                  <a-tag v-else-if="hoursOf(current, { range: 'day' }) < 8" color="red">
                    {{ hoursOf(current, { range: 'day' }) }}h
                  </a-tag>
                  <a-tag v-else color="green">
                    {{ hoursOf(current, { range: 'day' }) }}h
                  </a-tag>

                  <span class="text-xs underline">Hours total</span>
                </div>
                <template v-for="(log, i) of getLogByDay(current)" :key="i">
                  <log-item :item="log" />
                </template>
              </perfect-scrollbar>
              <div v-else class="text-center my-2 text-sm opacity-20">
                —
              </div>
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
