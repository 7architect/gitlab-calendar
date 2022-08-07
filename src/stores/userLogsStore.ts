import { defineStore } from 'pinia'
import { useApolloClient } from '@vue/apollo-composable'
import type { Dayjs, OpUnitType } from 'dayjs'
import dayjs from 'dayjs'
import type { LogsQuery, LogsQueryVariables } from '../../graphql-operations'
import { Logs } from '../../graphql-operations'
import type { TimelogEdge } from '../../graphql'
import type { AsyncStore } from '~/stores/stores'

export interface UserLogsState extends AsyncStore {
  logs: TimelogEdge[]
}

interface logFilter { issues: boolean; mrs: boolean }

const client = useApolloClient().client

const fetchTimeLogs = async (variables: LogsQueryVariables) => {
  const result = await client.query<LogsQuery, LogsQueryVariables>({ query: Logs, variables, fetchPolicy: 'network-only' })
  return result.data.timelogs
}

export const userLogsStore = defineStore('userLogs', {
  state: (): UserLogsState => ({
    logs: [],
    _loading: false,
  }),
  getters: {
    onlyMergeRequests: state => state.logs.filter(log => log.node?.mergeRequest),
    onlyIssues: state => state.logs.filter(log => log.node?.issue),
    only: state => ({ issues = true, mrs = true }: logFilter) => {
      return state.logs.filter((log) => {
        let show = true
        if (issues)
          show &&= !!log.node?.issue
        if (mrs)
          show &&= !!log.node?.mergeRequest
        return show
      })
    },
    day: state => (date: Dayjs) => {
      if (!state.logs.length)
        return []

      const dayStart = date.startOf('day')
      const dayEnd = date.endOf('day')

      return state.logs.filter((log) => {
        const logDate = dayjs(log.node?.spentAt)
        return logDate.isBetween(dayStart, dayEnd, 'minutes')
      })
    },
    hoursOf: state => (date: Dayjs, { range = 'month' }: { range: OpUnitType }): number => {
      if (!state.logs.length)
        return 0

      const dateStart = date.startOf(range)
      const dateEnd = date.endOf(range)

      const logs = state.logs.filter((log) => {
        const logDate = dayjs(log.node!.spentAt)
        return logDate.isBetween(dateStart, dateEnd, 'days', '[]')
      })

      const hours = logs.reduce((acc, log) => {
        acc += log.node!.timeSpent
        return acc
      }, 0) / 60 / 60

      return +hours.toFixed(2)
    },
  },
  actions: {
    async fetchLogsAggregated(variables: LogsQueryVariables) {
      this._loading = true
      const timelogs = await fetchTimeLogs(variables)

      if (!timelogs?.edges)
        return

      let pageInfo = timelogs.pageInfo
      const edges = timelogs.edges
      let lastCursor = edges[edges.length - 1]?.cursor

      const moreLogs = []
      while (pageInfo.hasNextPage) {
        const moreTimelogs = await fetchTimeLogs({
          ...variables,
          after: lastCursor,
        })

        if (moreTimelogs?.edges) {
          lastCursor = moreTimelogs.edges[moreTimelogs.edges.length - 1]?.cursor
          pageInfo = moreTimelogs.pageInfo
          moreLogs.push(moreTimelogs.edges)
        }
        else {
          break
        }
      }

      const aggregatedEdges = [...timelogs.edges, ...moreLogs.flat()]
      this.logs = aggregatedEdges as TimelogEdge[]

      this._loading = false
    },
  },
})

