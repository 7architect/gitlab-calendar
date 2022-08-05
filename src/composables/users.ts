import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

interface Users {
  users: {
    nodes: Array<{ username: string }>
  }
}

const QUERY = gql`
    query Users($search: String) {
        users(search: $search) {
            nodes {
                username
            }
        }
    }`

export const useUsers = (params?: { search?: string }) => {
  return useQuery<Users, { search?: string }>(QUERY, params ?? {}, {
    fetchPolicy: 'network-only',
  })
}
