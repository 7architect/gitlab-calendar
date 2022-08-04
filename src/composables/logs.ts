import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useUser } from '~/composables/user'

export interface TimeLog {
  issue?: {
    iid: string
    title: string
    webUrl: string
  }
  mergeRequest?: {
    iid: string
    title: string
    webUrl: string
  }
  note: {
    body: string
  }
  timeSpent: number
  spentAt: string
  user: {
    name: string
    username: string
  }
}

interface Nodes<T> { nodes: T[] }

interface TimeLogs {
  group: {
    timelogs: Nodes<TimeLog>
  }
}

const QUERY = gql`
    query logs($start: Time!, $end: Time!, $user: String!) {
        group(fullPath: "ktteam") {
            timelogs (startDate: $start, endDate: $end, username: $user) {
                nodes {
                    user {
                        username,
                        name
                    }
                    mergeRequest {
                        iid
                        webUrl
                        title
                    }
                    issue {
                        iid
                        webUrl
                        title
                    }
                    spentAt
                    timeSpent
                    note {
                        body
                    }
                }
            }
        }
    }
`

export const useLogs = (params?: { startDate?: Dayjs; endDate?: Dayjs }) => {
  const formatDate = (date: Dayjs) => date.format('YYYY-MM-DD')
  return useQuery<TimeLogs, { start: string; end: string; user: string }>(QUERY, {
    start: params?.startDate ? formatDate(params.startDate) : formatDate(dayjs().startOf('year')),
    end: params?.endDate ? formatDate(params.endDate) : formatDate(dayjs().endOf('year')),
    user: useUser(),
  }, {
    fetchPolicy: 'no-cache',
  })
}
