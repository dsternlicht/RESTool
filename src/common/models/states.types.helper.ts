import { IPaginationState, IQueryPaginationState, IBodyPaginationState } from "./states.model";

export const isQueryPaginationState = (obj: IPaginationState): obj is IQueryPaginationState => {
    return obj.source === 'query';
}

export const isBodyPaginationState = (obj: IPaginationState): obj is IBodyPaginationState => {
    return obj.source === 'body';
}