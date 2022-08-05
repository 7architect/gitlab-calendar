import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useUser } from '~/composables/user'

interface Pageinfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  endCursor: string
  startCursor: string
}

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

interface TimeLogsEdges {
  cursor: string
  node: TimeLog
}

interface TimeLogs {
  group: {
    timelogs: {
      pageInfo: Pageinfo
      edges: TimeLogsEdges[]
    }
  }
}

const QUERY = gql`
    fragment Node on Timelog {
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
    
    query logs($start: Time!, $end: Time!, $user: String!, $after: String)  {
        group(fullPath: "ktteam") {
            timelogs (startDate: $start, endDate: $end, username: $user, after: $after, first: 100)  {
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                    startCursor
                }
                edges  {
                    cursor
                    node {
                        ...Node   
                    }
                }
            }
        }
    }
`

export const useLogs = (params?: { startDate?: Dayjs; endDate?: Dayjs }) => {
  const formatDate = (date: Dayjs) => date.format('YYYY-MM-DD')
  return useQuery<TimeLogs, { start: string; end: string; user: string; after?: string }>(QUERY, {
    start: params?.startDate ? formatDate(params.startDate) : formatDate(dayjs().startOf('month')),
    end: params?.endDate ? formatDate(params.endDate) : formatDate(dayjs().endOf('month')),
    user: useUser(),
  })
}
