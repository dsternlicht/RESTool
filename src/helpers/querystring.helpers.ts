class QuerystringHelpers {
  public encodeValue(name:string, value:any): string {
    if (Array.isArray(value)) {
      return value.map((v: any) => {
        return `${name}=${encodeURIComponent(v)}`
      }).join("&")
    }

    return `${name}=${encodeURIComponent(value || '')}`
  }
}

export const querystringHelpers = new QuerystringHelpers();
