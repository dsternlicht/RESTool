import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';
import { orderBy } from 'natural-orderby';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField, IConfigCustomAction, IConfigGetSingleMethod, ICustomLabels } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { Table } from '../table/table.comp';
import { Cards } from '../cards/cards.comp';
import { QueryParams } from '../queryParams/queryParams.comp';
import { Button } from '../button/button.comp';
import { FormPopup } from '../formPopup/formPopup.comp';
import { FilterField } from '../filterField/filterField.comp';

import './page.scss';

interface IProps {
  context: IAppContext
}

interface IPopupProps {
  type: 'add' | 'update' | 'action'
  title: string
  config: IConfigPostMethod | IConfigPutMethod
  submitCallback: (body: any, containFiles: boolean) => void
  getSingleConfig?: IConfigGetSingleMethod
  rawData?: {}
}

interface IPaginationParams {
  page: number,
}

interface IPaginationState {
  page: number,
  limit: number,
  descending?: boolean,
  total?: number,
  sortBy?: string,
  hasPreviousPage?: boolean,
  hasNextPage?: boolean,
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService, config } = context;
  const pageHeaders: any = activePage?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const customActions: IConfigCustomAction[] = activePage?.customActions || [];
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const paginationConfig = getAllConfig?.pagination;
  const infiniteScroll = paginationConfig?.type === 'lazy-loading';
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels };
  const addItemLabel = customLabels?.buttons?.addItem || '+ Add Item';
  const addItemFormTitle = customLabels?.formTitles?.addItem || 'Add Item';
  const editItemFormTitle = customLabels?.formTitles?.editItem || 'Update Item';
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(getAllConfig?.queryParams || []);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const initialPagination = paginationConfig ? {
    page: parseInt(paginationConfig?.params.page.value || '1'),
    limit: parseInt(paginationConfig?.params.limit?.value || '10'),
    descending: paginationConfig?.params.descending?.value === 'true' || false,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: paginationConfig?.params.sortBy?.value,
  } : null;
  const [paginationParams, setPaginationParams] = useState<IPaginationParams | null>(initialPagination ? { page: initialPagination.page } : null);
  const [pagination, setPagination] = useState<IPaginationState | null>(initialPagination);

  function closeFormPopup(refreshData: boolean = false) {
    setOpenedPopup(null);

    if (refreshData === true) {
      getAllRequest();
    }
  }

  async function openEditPopup(rawData: any) {
    const params: IPopupProps = {
      rawData,
      type: 'update',
      title: editItemFormTitle,
      config: putConfig as IConfigPutMethod,
      getSingleConfig,
      submitCallback: async (body: any, containFiles: boolean) => {
        return await updateItem(body, rawData, containFiles);
      }
    };

    setOpenedPopup(params);
  }

  function openCustomActionPopup(rawData: any, action: IConfigCustomAction) {
    const params: IPopupProps = {
      rawData,
      type: 'action',
      title: action.name || 'Custom Action',
      config: action as IConfigCustomAction,
      submitCallback: async (body: any, containFiles: boolean) => {
        return await performAction(body, rawData, action, containFiles);
      }
    };

    setOpenedPopup(params);
  }

  async function performAction(body: any, rawData: any, action: IConfigCustomAction, containFiles: boolean) {
    const { url, requestHeaders, actualMethod } = action;

    return await httpService.fetch({
      method: actualMethod || 'put',
      origUrl: url,
      rawData,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  function extractQueryParams(): IConfigInputField[] {
    const parsedParams = QueryString.parse(location.search);
    const paginationQueryParams: IConfigInputField[] = paginationConfig && paginationParams ? [
      { name: paginationConfig.params.page.name, value: paginationParams.page },
    ] : [];
    if (pagination && paginationConfig) {
      if (paginationConfig?.params.limit) {
        paginationQueryParams.push({ name: paginationConfig?.params.limit.name, value: pagination.limit });
      }
      if (paginationConfig?.params.descending) {
        paginationQueryParams.push({ name: paginationConfig.params.descending.name, value: pagination.descending });
      }
      if (paginationConfig?.params.sortBy) {
        paginationQueryParams.push({ name: paginationConfig.params.sortBy.name, value: pagination.sortBy });
      }
    }
    const queryParams = (getAllConfig?.queryParams || [])
    const params = [...queryParams, ...paginationQueryParams];
    const finalQueryParams = params.map((queryParam) => {
      if (typeof parsedParams[queryParam.name] !== 'undefined') {
        queryParam.value = queryParam.type === 'boolean' ? (parsedParams[queryParam.name] === 'true') : decodeURIComponent(parsedParams[queryParam.name] as any);
      } else {
        queryParam.value = queryParam.value || '';
      }
      return queryParam;
    });

    return finalQueryParams
  }

  async function getAllRequest() {
    if (infiniteScroll && pagination?.page !== 1) {
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
      }

      if (paginationConfig && !paginationParams) {
        throw new Error('Pagination params not initialized.');
      }

      if (paginationConfig && !pagination) {
        throw new Error('Pagination not initialized.');
      }

      const { url, requestHeaders, actualMethod, dataPath, sortBy, dataTransform } = getAllConfig;
      const result = await httpService.fetch({
        method: actualMethod || 'get',
        origUrl: url,
        queryParams: extractQueryParams(),
        headers: Object.assign({}, pageHeaders, requestHeaders || {})
      });
      let extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

      if (!extractedData) {
        throw new Error('Could not extract data from response.');
      }

      if (!Array.isArray(extractedData)) {
        throw new Error('Extracted data is invalid.');
      }

      if (typeof dataTransform === 'function') {
        extractedData = await dataTransform(extractedData);
      }

      const orderedItems = orderBy(extractedData, typeof sortBy === 'string' ? [sortBy] : (sortBy || []));

      if (paginationConfig) {
        const currentPage = paginationConfig.fields?.page ? dataHelpers.extractDataByDataPath(result, paginationConfig.fields.page.dataPath) : paginationParams?.page;
        const currentLimit = parseInt(paginationConfig?.params.limit?.value || '10');
        if (paginationConfig.fields?.total && pagination?.limit) {
          const total = dataHelpers.extractDataByDataPath(result, paginationConfig.fields.total.dataPath);
          const hasPreviousPage = currentPage > 1;
          const hasNextPage = currentPage * pagination.limit < total;
          setPagination({
            ...pagination,
            page: currentPage,
            total,
            hasPreviousPage,
            hasNextPage,
          });
        } else {
          setPagination({
            ...pagination,
            page: currentPage,
            limit: currentLimit,
            hasPreviousPage: currentPage > 1,
            hasNextPage: true,
          });
        }
      }

      if (infiniteScroll) {
        setItems([...items, ...orderedItems]);
      } else {
        setItems(orderedItems);
      }

    } catch (e) {
      console.error('from getall ', e)
      setError(e.message);
    }

    setLoading(false);
  }

  async function addItem(body: any, containFiles?: boolean) {
    if (!postConfig) {
      throw new Error('Post method is not defined.');
    }

    const { url, requestHeaders, actualMethod } = postConfig;

    return await httpService.fetch({
      method: actualMethod || 'post',
      origUrl: url,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  async function updateItem(body: any, rawData: any, containFiles?: boolean) {
    if (!putConfig) {
      throw new Error('Put method is not defined.');
    }

    const { url, requestHeaders, actualMethod } = putConfig;

    return await httpService.fetch({
      method: actualMethod || 'put',
      origUrl: url,
      rawData,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  async function deleteItem(item: any) {
    const approved: boolean = window.confirm('Are you sure you want to delete this item?');

    if (!approved) {
      return;
    }

    try {
      if (!deleteConfig) {
        throw new Error('Delete method is not defined.');
      }

      const { url, requestHeaders, actualMethod } = deleteConfig;
      const success = await httpService.fetch({
        method: actualMethod || 'delete',
        origUrl: url,
        rawData: item,
        headers: Object.assign({}, pageHeaders, requestHeaders || {}),
        responseType: 'boolean'
      });

      if (success) {
        getAllRequest();
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  function submitQueryParams(updatedParams: IConfigInputField[]) {
    setQueryParams(updatedParams);

    if (loading) {
      return;
    }

    // Building query string
    const queryState: string = queryParams.map((queryParam, idx) => {
      return `${idx === 0 ? '?' : ''}${queryParam.name}=${encodeURIComponent(queryParam.value || '')}`;
    }).join('&');

    // Pushing query state to url
    push(queryState);
  }

  function renderTable() {
    if (loading) {
      return <Loader />;
    }

    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];
    const fieldsToFilter = fields.filter((field) => (field.filterable)).map((field) => field.name);
    let filteredItems = items;

    if (filter && fieldsToFilter.length) {
      filteredItems = items.filter((item) => {
        let passFilter = false;
        fieldsToFilter.forEach((fieldName) => {
          const value = item[fieldName];
          if (typeof value === 'string' && value.toLowerCase().indexOf(filter) >= 0) {
            passFilter = true;
          }
        })
        return passFilter;
      });
    }

    if (!filteredItems.length) {
      return <div className="app-error">Nothing to see here. Result is empty.</div>;
    }

    const getNextPage = paginationConfig ? () => {
      if (pagination?.page) {
        setPaginationParams({
          page: pagination.page + 1,
        })
      }
    } : null;

    const getPreviousPage = paginationConfig ? () => {
      if (pagination?.page && pagination.page > 1) {
        setPaginationParams({
          page: pagination.page - 1,
        })
      }
    } : null;

    const callbacks = {
      delete: deleteConfig ? deleteItem : null,
      put: putConfig ? openEditPopup : null,
      action: customActions.length ? openCustomActionPopup : () => { },
      getNextPage,
      getPreviousPage,
    };

    if (getAllConfig?.display.type === 'cards') {
      return (
        <Cards
          pagination={paginationConfig?.type}
          limit={pagination?.limit}
          hasNextPage={pagination?.hasNextPage}
          hasPreviousPage={pagination?.hasPreviousPage}
          callbacks={callbacks}
          fields={fields}
          items={filteredItems}
          customActions={customActions}
          customLabels={customLabels}
        />
      );
    }

    return (
      <Table
        pagination={paginationConfig?.type}
        hasNextPage={pagination?.hasNextPage}
        hasPreviousPage={pagination?.hasPreviousPage}
        callbacks={callbacks}
        fields={fields}
        items={filteredItems}
        customActions={customActions}
        customLabels={customLabels}
      />
    );
  }

  function renderPageContent() {
    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];
    const fieldsToFilter = fields.filter((field) => (field.filterable)).map((field) => field.name);

    return (
      <React.Fragment>
        <QueryParams
          initialParams={queryParams}
          paginationConfig={paginationConfig}
          submitCallback={submitQueryParams}
        />
        {
          fieldsToFilter.length > 0 &&
          <FilterField onChange={setFilter} />
        }
        {
          error ?
            <div className="app-error">{error}</div> :
            renderTable()
        }
      </React.Fragment>
    )
  }

  useEffect(() => {
    const nextActivePage: IConfigPage | null = context?.config?.pages?.filter((p, pIdx) => p.id === page || (pIdx + 1) === parseInt(page || ''))[0] || null;
    context.setActivePage(nextActivePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setItems([]);
    setPagination(initialPagination);
    setPaginationParams(initialPagination ? { page: initialPagination.page } : null);
    setQueryParams(extractQueryParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    // Load data when query params 
    getAllRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, paginationParams]);

  return (
    <div className="app-page">
      <header className="app-page-header">
        <hgroup>
          <h2>{activePage?.name}</h2>
          {
            activePage?.description &&
            <h4>{activePage?.description}</h4>
          }
        </hgroup>
        {
          postConfig &&
          <Button className="add-item" color="green" onClick={() => setOpenedPopup({ type: 'add', title: addItemFormTitle, config: postConfig, submitCallback: addItem })}>{addItemLabel}</Button>
        }
      </header>
      <main className="app-page-content">
        {renderPageContent()}
      </main>
      {
        openedPopup &&
        <FormPopup
          title={openedPopup.title}
          closeCallback={closeFormPopup}
          submitCallback={openedPopup.submitCallback}
          fields={openedPopup.config?.fields || []}
          rawData={openedPopup.rawData}
          getSingleConfig={openedPopup.getSingleConfig}
          methodConfig={openedPopup.config}
        />
      }
    </div>
  );
}

export const Page = withAppContext(PageComp);
