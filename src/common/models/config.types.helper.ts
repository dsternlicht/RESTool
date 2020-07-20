import { IConfigPagination, IConfigBodyPagination, IConfigQueryPagination } from "./config.model";

export const isQueryPagination = (obj: IConfigPagination): obj is IConfigQueryPagination => {
    return obj.source === 'query';
}

export const isBodyPagination = (obj: IConfigPagination): obj is IConfigBodyPagination => {
    return obj.source === 'body';
}
