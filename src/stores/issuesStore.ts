import { defineStore } from 'pinia'
import { useApolloClient } from '@vue/apollo-composable'
import type { Dayjs } from 'dayjs'
import type {
  CreateNoteMutation,
  CreateNoteMutationVariables,
  IssueFragment,
  SearchIssuesQuery,
  SearchIssuesQueryVariables,
} from '../../graphql'
import { CreateNote, SearchIssues } from '../../graphql-operations'
import { useUser } from '~/stores/userStore'

interface IIssuesStore {
  issues: IssueFragment[]
}

const client = useApolloClient().client

export const useIssues = defineStore('issues', {
  state: (): IIssuesStore => ({
    issues: [],
  }),
  actions: {
    async createTimelog(params: { spent: string; issue: string; comment: string; date: Dayjs }) {
      const body = ['/spent', params.spent, params.date.format('YYYY-MM-DD'), '\n', params.comment].join(' ')
      const result = await client.mutate<CreateNoteMutation, CreateNoteMutationVariables>({
        mutation: CreateNote,
        variables: {
          gid: params.issue,
          body,
        },
      })

      return result.data?.createNote ?? null
    },
    async searchIssue(search: SearchIssuesQueryVariables['search']) {
      const result = await client.query<SearchIssuesQuery, SearchIssuesQueryVariables>({
        query: SearchIssues,
        variables: {
          search,
          usernames: [useUser().username],
          group: import.meta.env.VITE_APP_GITLAB_GROUP as string,
        },
      })

      if (result.data.group?.issues?.edges)
        this.issues = result.data.group.issues.edges.map(edge => edge!.node!)
    },
  },
})
