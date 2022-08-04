import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

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
    query logs($start: Time!, $end: Time!) {
        group(fullPath: "ktteam") {
            timelogs (startDate: $start, endDate: $end, username:"a.katkov") {
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

  return useQuery<TimeLogs, { start: string; end: string }>(QUERY, {
    start: params?.startDate ? formatDate(params.startDate) : formatDate(dayjs().startOf('month')),
    end: params?.endDate ? formatDate(params.endDate) : formatDate(dayjs().endOf('month')),
  })
}
