export type IPaginationState = IQueryPaginationState | IBodyPaginationState;

export type IQueryPaginationState = _IPaginationState<'query', {
  page: number
  limit: number
  descending?: boolean
  total?: number
  sortBy?: string
}>;

export type IBodyPaginationState = _IPaginationState<'body', {
  next: string | null
  previous: string | null
  limit: number
}>;

type _IPaginationState<src extends string, AdditionalProperties> = {
  source: src
  type: 'infinite-scroll' | 'buttons'
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  total?: number
} & AdditionalProperties