import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import dayjs from 'dayjs'
import { useUser } from '~/composables/user'
import { formatDate } from '~/composables/utils'

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

export interface TimeLogsEdges {
  cursor: string
  node: TimeLog
}

interface TimeLogs {
  timelogs: {
    pageInfo: Pageinfo
    edges: TimeLogsEdges[]
  }
}

const QUERY = gql`
    fragment Node on Timelog {
        __typename
        user {
            id
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
`

export const useLogs = (params?: { start?: string; end?: string; user?: string }) => {
  return useQuery<TimeLogs, { start: string; end: string; user: string; after?: string }>(QUERY, {
    start: params?.start || formatDate(dayjs().startOf('month')),
    end: params?.end || formatDate(dayjs().endOf('month')),
    user: params?.user || useUser().value,
  })
}
