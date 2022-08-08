import gql from 'graphql-tag';
export type NodeFragment = { __typename: 'Timelog', spentAt?: any | null, timeSpent: number, user: { __typename?: 'UserCore', id: string, username: string, name: string }, mergeRequest?: { __typename?: 'MergeRequest', iid: string, webUrl?: string | null, title: string } | null, issue?: { __typename?: 'Issue', iid: string, webUrl: string, title: string } | null, note?: { __typename?: 'Note', body: string } | null };

export type LogsQueryVariables = Exact<{
  start: Scalars['Time'];
  end: Scalars['Time'];
  user: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type LogsQuery = { __typename?: 'Query', timelogs?: { __typename?: 'TimelogConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, edges?: Array<{ __typename?: 'TimelogEdge', cursor: string, node?: { __typename: 'Timelog', spentAt?: any | null, timeSpent: number, user: { __typename?: 'UserCore', id: string, username: string, name: string }, mergeRequest?: { __typename?: 'MergeRequest', iid: string, webUrl?: string | null, title: string } | null, issue?: { __typename?: 'Issue', iid: string, webUrl: string, title: string } | null, note?: { __typename?: 'Note', body: string } | null } | null } | null> | null } | null };

export const Node = gql`
    fragment Node on Timelog {
  __typename
  user {
    id
    username
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
    `;
export const Logs = gql`
    query logs($start: Time!, $end: Time!, $user: String!, $after: String) {
  timelogs(
    startDate: $start
    endDate: $end
    username: $user
    after: $after
    first: 100
  ) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
    edges {
      cursor
      node {
        ...Node
      }
    }
  }
}
    ${Node}`;