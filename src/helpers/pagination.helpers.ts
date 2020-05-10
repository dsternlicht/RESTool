class PaginationHelpers {
  public hasPreviousPage(page: string | number | undefined): boolean {
    if (page === undefined) {
      return false;
    }

    if (typeof page === 'string') {
      return parseInt(page) > 1;
    }

    return page > 1;
  }

  public hasNextPage(_page: string | number, _itemsPerPage: string | number, _total: string | number | undefined): boolean {
    if (_total === undefined) {
      return true;
    }
    const page = typeof _page === 'string' ? parseInt(_page) : _page;
    const itemsPerPage = typeof _itemsPerPage === 'string' ? parseInt(_itemsPerPage) : _itemsPerPage;
    const total = typeof _total === 'string' ? parseInt(_total) : _total;

    return page * itemsPerPage < total;
  }
}

export const paginationHelpers = new PaginationHelpers();