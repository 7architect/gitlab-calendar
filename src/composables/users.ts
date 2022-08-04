import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

interface Users {
  users: {
    nodes: Array<{ username: string }>
  }
}

const QUERY = gql`
    query {
        users {
            nodes {
                username
            }
        }
    }`

export const useUsers = () => {
  return useQuery<Users>(QUERY)
}
