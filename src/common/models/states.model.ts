export interface IPaginationState {
  type: 'lazy-loading' | 'buttons'
  page: number
  limit: number
  descending?: boolean
  total?: number
  sortBy?: string
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}