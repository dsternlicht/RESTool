import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';
import { orderBy } from 'natural-orderby';
import { find, remove } from 'lodash';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField, IConfigCustomAction, IConfigGetSingleMethod, ICustomLabels, IConfigPagination } from '../../common/models/config.model';
import { IPaginationState } from '../../common/models/states.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { paginationHelpers } from '../../helpers/pagination.helpers';
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

const buildInitQueryParamsAndPaginationState = (
  initQueryParams: IConfigInputField[],
  paginationConfig?: IConfigPagination,
): {
  initQueryParams: IConfigInputField[],
  initialPagination?: IPaginationState,
} => {
  const initialPagination: IPaginationState | undefined = paginationConfig ? {
    type: paginationConfig.type,
    page: parseInt(paginationConfig.params?.page?.value || '1'),
    limit: parseInt(paginationConfig.params?.limit?.value || '10'),
    descending: paginationConfig.params?.descending?.value === 'true' || false,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: paginationConfig.params?.sortBy?.value,
  } : undefined;

  if (paginationConfig) {
    if (!find(initQueryParams, { name: 'page' })) {
      initQueryParams.push({
        name: paginationConfig?.params?.page?.name,
        label: paginationConfig?.params?.page?.label || 'Page',
        value: initialPagination?.page
      });
    }

    if (paginationConfig?.params?.limit && !find(initQueryParams, { name: 'limit' })) {
      initQueryParams.push({
        name: paginationConfig.params.limit.name,
        label: paginationConfig.params.limit.label || 'Limit',
        value: initialPagination?.limit
      });
    }

    if (paginationConfig?.params?.descending && !find(initQueryParams, { name: 'descending' })) {
      initQueryParams.push({
        name: paginationConfig.params.descending.name,
        label: paginationConfig.params.descending.label || 'Descending',
        value: initialPagination?.descending
      });
    }

    if (paginationConfig?.params?.sortBy && !find(initQueryParams, { name: 'sortBy' })) {
      initQueryParams.push({
        name: paginationConfig.params.sortBy.name,
        label: 'Sort by',
        value: initialPagination?.sortBy
      });
    }
  }

  return {
    initQueryParams,
    initialPagination
  };
};

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location, } = useHistory();

  const { activePage, error, setError, httpService, config } = context;

  const authConfig = config?.auth;

  if(authConfig && authConfig.type && !localStorage.getItem('Authorization')) {
        const redirectUrl: string = config?.unauthorizedRedirectUrl.replace(':returnUrl', encodeURIComponent(document.location.href)) || 'login';
        document.location.href = redirectUrl;
  }

  const pageHeaders: any = activePage?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const customActions: IConfigCustomAction[] = activePage?.customActions || [];
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const paginationConfig = getAllConfig?.pagination;
  const infiniteScroll = paginationConfig?.type === 'infinite-scroll';
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels };
  const addItemLabel = customLabels?.buttons?.addItem || '+ Add Item';
  const addItemFormTitle = customLabels?.formTitles?.addItem || 'Add Item';
  const editItemFormTitle = customLabels?.formTitles?.editItem || 'Update Item';
  const { initQueryParams, initialPagination } = buildInitQueryParamsAndPaginationState(getAllConfig?.queryParams || [], paginationConfig);
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(initQueryParams);
  const [pagination, setPagination] = useState<IPaginationState | undefined>(initialPagination);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');

  function closeFormPopup(refreshData: boolean = false) {
    setOpenedPopup(null);

    if (refreshData === true) {
      if (pagination?.type === 'infinite-scroll') {
        setItems([]);
        const updatedParams = [...queryParams];
        remove(updatedParams, param => ['page', 'limit'].includes(param.name));
        setQueryParams(buildInitQueryParamsAndPaginationState(updatedParams, paginationConfig).initQueryParams);
      } else {
        getAllRequest();
      }
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

  function extractQueryParams(params: IConfigInputField[]): IConfigInputField[] {
    const parsedParams = QueryString.parse(location.search);
    const finalQueryParams = params.map((queryParam) => {
      if (typeof parsedParams[queryParam.name] !== 'undefined') {
        queryParam.value = queryParam.type === 'boolean' ? (parsedParams[queryParam.name] === 'true') : decodeURIComponent(parsedParams[queryParam.name] as any);
      } else {
        queryParam.value = queryParam.value || '';
      }
      return queryParam;
    });

    setPagination(getUpdatedPaginationState(finalQueryParams))

    return finalQueryParams;
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

      if (paginationConfig && !pagination) {
        throw new Error('Pagination not initialized.');
      }

      const { url, requestHeaders, actualMethod, dataPath, sortBy, dataTransform } = getAllConfig;
      const result = await httpService.fetch({
        method: actualMethod || 'get',
        origUrl: url,
        queryParams,
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
        const total = paginationConfig.fields?.total ? dataHelpers.extractDataByDataPath(result, paginationConfig.fields.total.dataPath) : undefined;
        const newPaginationState = getUpdatedPaginationState(queryParams, total);
        if (newPaginationState) {
          setPagination(newPaginationState);
        }
      }

      if (infiniteScroll) {
        setItems([...items, ...orderedItems]);
      } else {
        setItems(orderedItems);
      }

    } catch (e) {
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
        if (pagination?.type === 'infinite-scroll') {
          setItems([]);
          const updatedParams = [...queryParams];
          remove(updatedParams, param => ['page', 'limit'].includes(param.name));
          setQueryParams(buildInitQueryParamsAndPaginationState(updatedParams, paginationConfig).initQueryParams);
        } else {
          getAllRequest();
        }
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  function submitQueryParams(updatedParams: IConfigInputField[], reset?: boolean) {
    if (loading) {
      return;
    }
    
    if (reset) {
      setItems([]);
      remove(updatedParams, param => ['page', 'limit'].includes(param.name));
      updatedParams = buildInitQueryParamsAndPaginationState(updatedParams, paginationConfig).initQueryParams;
    }

    setQueryParams(updatedParams);
    setPagination(getUpdatedPaginationState(updatedParams));

    let paramsToUrl = [...updatedParams];

    if (paginationConfig?.type === 'infinite-scroll') {
      paramsToUrl = paramsToUrl.filter(param => !['page', 'limit'].includes(param.name));
    }

    // Building query string
    const queryState: string = paramsToUrl.map((queryParam, idx) => {
      let value = queryParam.value;

      if (queryParam.type === 'select' && value === '-- Select --') {
          // default value means nothing was selected and thus we explicitly
          // empty out the value in this case; otherwise the string '-- Select --'
          // is used as the value for the given queryParams
          value = '';
      }

      return `${idx === 0 ? '?' : ''}${queryParam.name}=${encodeURIComponent(value || '')}`;
    }).join('&');

    // Pushing query state to url
    if (page && queryState) {
      push(queryState);
    }
  }

  function getUpdatedPaginationState(updatedParams: IConfigInputField[], total?: number): IPaginationState | undefined {
    if (!paginationConfig) {
      return;
    }

    const newState: IPaginationState = pagination ? pagination : {
      type: paginationConfig.type,
      page: parseInt(paginationConfig.params?.page?.value || '1'),
      limit: parseInt(paginationConfig.params?.limit?.value || '10'),
      descending: paginationConfig.params?.descending?.value === 'true' || false,
      hasPreviousPage: false,
      hasNextPage: false,
      sortBy: paginationConfig.params?.sortBy?.value,
    };

    newState.total = total || pagination?.total;
    newState.page = parseInt(updatedParams.find(param => param.name === paginationConfig?.params?.page?.name)?.value) || newState.page;
    newState.limit = parseInt(updatedParams.find(param => param.name === paginationConfig?.params?.limit?.name)?.value) || newState.limit;
    newState.descending = updatedParams.find(param => param.name === paginationConfig?.params?.descending?.name)?.value === 'true' || newState.descending;
    newState.sortBy = updatedParams.find(param => param.name === paginationConfig?.params?.sortBy?.name)?.value || newState.sortBy;
    newState.hasPreviousPage = paginationHelpers.hasPreviousPage(newState.page);
    newState.hasNextPage = paginationHelpers.hasNextPage(newState.page, newState.limit, newState.total);
    
    return newState;
  }

  function renderItemsUI() {
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
      if (pagination?.page && queryParams.length > 0) {
        const newPage = pagination?.page + 1;
        const updatedParams = queryParams.map((param) => {
          if (param.name === paginationConfig.params?.page?.name) {
            return {
              ...param,
              value: newPage
            }
          }
          return param;
        });
        submitQueryParams(updatedParams);
      }
    } : null;

    const getPreviousPage = paginationConfig ? () => {
      if (pagination?.page && pagination.page > 1 && queryParams.length > 0) {
        const newPage = pagination?.page - 1;
        const updatedParams = queryParams.map((param) => {
          if (param.name === paginationConfig.params?.page?.name) {
            return {
              ...param,
              value: newPage
            }
          }
          return param;
        });
        submitQueryParams(updatedParams);
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
          pagination={pagination}
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
        pagination={pagination}
        callbacks={callbacks}
        fields={fields}
        items={filteredItems}
        customActions={customActions}
        customLabels={customLabels}
      />
    );
  }

  function renderPaginationStateLabel() {
    if (loading || !items.length) {
      return;
    }

    const currentCountFrom = (((pagination?.page || 1) - 1) * (pagination?.limit || 10)) + 1;
    const currentCountTo = currentCountFrom + items.length - 1;
    let label: string = `Showing results ${currentCountFrom}-${currentCountTo} out of ${pagination?.total} items`;

    if (pagination?.type === 'infinite-scroll') {
      label = `Showing ${pagination?.total} items`;
    }

    if (customLabels?.pagination?.itemsCount) {
      label = customLabels?.pagination?.itemsCount
              .replace(':currentCountFrom', currentCountFrom as any)
              .replace(':currentCountTo', currentCountFrom as any)
              .replace(':totalCount', pagination?.total as any);
    }

    return (
      <p className="center pagination-state">
        {label}
      </p>
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
          pagination?.total &&
          renderPaginationStateLabel()
        }
        {
          error ?
          <div className="app-error">{error}</div> :
          renderItemsUI()
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
    const { initQueryParams, initialPagination } = buildInitQueryParamsAndPaginationState(getAllConfig?.queryParams || [], paginationConfig);

    setItems([]);
    setQueryParams(extractQueryParams(initQueryParams));
    setPagination(initialPagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    // Load data when query params 
    getAllRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

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
