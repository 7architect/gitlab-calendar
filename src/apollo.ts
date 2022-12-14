import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { useUser } from '~/stores/userStore'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'https://git.puls.ru/api/graphql',
})

const authLink = setContext((_, { headers, ...rest }) => {
  const token = useUser().token
  // return the headers to the context so httpLink can read them
  return {
    ...rest,
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Cache implementation
const cache = new InMemoryCache()

// persistCache({
//   cache,
//   storage: new LocalStorageWrapper(window.localStorage),
// })

// Create the apollo client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
})
