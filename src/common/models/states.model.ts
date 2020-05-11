export interface IPaginationState {
  type: 'infinite-scroll' | 'buttons'
  page: number
  limit: number
  descending?: boolean
  total?: number
  sortBy?: string
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}