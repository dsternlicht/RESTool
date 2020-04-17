import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';
import { orderBy } from 'natural-orderby';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField, IConfigCustomAction, IConfigGetSingleMethod, ICustomLabels, ICustomFormTitleLabels } from '../../common/models/config.model';
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

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService, config } = context;
  const pageHeaders: any = activePage?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const customActions: IConfigCustomAction[] = activePage?.customActions || [];
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const customLabels: ICustomLabels | undefined = config?.customLabels;
  const pageFormTitles: ICustomFormTitleLabels | undefined = activePage?.customFormTitles;
  const addItemLabel = activePage?.customAddButtonTitle || customLabels?.buttons?.addItem || '+ Add Item';
  const addItemFormTitle = pageFormTitles?.addItem || customLabels?.formTitles?.addItem || 'Add Item';
  const editItemFormTitle = pageFormTitles?.editItem || customLabels?.formTitles?.editItem || 'Update Item';
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(getAllConfig?.queryParams || []);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');

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
    const finalQueryParams: IConfigInputField[] = (getAllConfig?.queryParams || []).map((queryParam) => {
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
    setLoading(true);
    setError(null);

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
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

      setItems(orderedItems);
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

    const callbacks = {
      delete: deleteConfig ? deleteItem : null,
      put: putConfig ? openEditPopup : null,
      action: customActions.length ? openCustomActionPopup : () => { },
    };

    if (getAllConfig?.display.type === 'cards') {
      return (
        <Cards
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
    setQueryParams(extractQueryParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  useEffect(() => {
    // Load data when query params changed
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
