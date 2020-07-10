export type IPaginationState = IQueryPaginationState | IJSONBodyPaginationState;

export const isQueryPaginationState = (obj: IPaginationState): obj is IQueryPaginationState => {
  return obj.source === 'query';
}

export const isJSONBodyPaginationState = (obj: IPaginationState): obj is IJSONBodyPaginationState => {
  return obj.source === 'json-body';
}

export type IQueryPaginationState = _IPaginationState<'query', {
  page: number
  limit: number
  descending?: boolean
  total?: number
  sortBy?: string
}>;

export type IJSONBodyPaginationState = _IPaginationState<'json-body', {
  next: string | null
  previous: string | null
  limit: number
}>;

type _IPaginationState<src extends string, AdditionalProperties> = {
  source: src
  type: 'infinite-scroll' | 'buttons'
  hasPreviousPage?: boolean
  hasNextPage?: boolean
} & AdditionalProperties