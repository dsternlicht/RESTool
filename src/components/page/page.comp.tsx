import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';
import { orderBy } from 'natural-orderby';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField, IConfigCustomAction, IConfigGetSingleMethod } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { Table } from '../table/table.comp';
import { Cards } from '../cards/cards.comp';
import { QueryParams } from '../queryParams/queryParams.comp';
import { Button } from '../button/button.comp';
import { FormPopup } from '../formPopup/formPopup.comp';

import './page.scss';

interface IProps {
  context: IAppContext
}

interface IPopupProps {
  type: 'add' | 'update' | 'action'
  title: string
  config: IConfigPostMethod | IConfigPutMethod
  submitCallback: (body: any) => void
  getSingleConfig?: IConfigGetSingleMethod
  rawData?: {}
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService } = context;
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const customActions: IConfigCustomAction[] = activePage?.customActions || [];
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(getAllConfig?.queryParams || []);
  const [items, setItems] = useState<any[]>([]);
  
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
      title: 'Update Item', 
      config: putConfig as IConfigPutMethod,
      getSingleConfig, 
      submitCallback: async (body: any) => {
        return await updateItem(body, rawData);
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
      submitCallback: async (body: any) => {
        return await performAction(body, rawData, action);
      }
    };

    setOpenedPopup(params);
  }

  async function performAction(body: any, rawData: any, action: IConfigCustomAction) {
    const { url, requestHeaders, actualMethod } = action;
    
    return await httpService.fetch({
      method: actualMethod || 'put', 
      origUrl: url, 
      rawData,
      body,
      headers: requestHeaders,
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
      
      const { url, requestHeaders, actualMethod, dataPath, sortBy } = getAllConfig;
      const result = await httpService.fetch({
        method: actualMethod || 'get', 
        origUrl: url, 
        queryParams: extractQueryParams(), 
        headers: requestHeaders
      });
      const extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

      if (!extractedData) {
        throw new Error('Could not extract data from response.');
      }

      if (!Array.isArray(extractedData)) {
        throw new Error('Extracted data is invalid.');
      }

      const orderedItems = orderBy(extractedData, typeof sortBy === 'string' ? [sortBy] : (sortBy || []));
      
      setItems(orderedItems);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  }

  async function addItem(data: any) {
    if (!postConfig) {
      throw new Error('Post method is not defined.');
    }
      
    const { url, requestHeaders, actualMethod } = postConfig;
    
    return await httpService.fetch({
      method: actualMethod || 'post', 
      origUrl: url, 
      body: data,
      headers: requestHeaders,
      responseType: 'boolean'
    });
  }

  async function updateItem(body: any, rawData: any) {
    if (!putConfig) {
      throw new Error('Put method is not defined.');
    }
    
    const { url, requestHeaders, actualMethod } = putConfig;
    
    return await httpService.fetch({
      method: actualMethod || 'put', 
      origUrl: url, 
      rawData,
      body,
      headers: requestHeaders,
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
        headers: requestHeaders, 
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

    if (!items.length) {
      return <div className="app-error">Nothing to see here. Result is empty.</div>;
    }

    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];

    if (getAllConfig?.display.type === 'cards') {
      return (
        <Cards 
          callbacks={{
            delete: deleteConfig ? deleteItem : () => {},
            put: putConfig ? openEditPopup : () => {},
            action: customActions.length ? openCustomActionPopup : () => {},
          }}
          fields={fields}
          items={items} 
          customActions={customActions}
        />
      );
    }

    return (
      <Table 
        callbacks={{
          delete: deleteConfig ? deleteItem : () => {},
          put: putConfig ? openEditPopup : () => {},
          action: customActions.length ? openCustomActionPopup : () => {},
        }}
        fields={fields}
        items={items} 
        customActions={customActions}
      />
    );
  }

  function renderPageContent() {
    return (
      <React.Fragment>
        <QueryParams 
          initialParams={queryParams}
          submitCallback={submitQueryParams}
        />
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
          <Button className="add-item" color="green" onClick={() => setOpenedPopup({ type: 'add', title: 'Add Item', config: postConfig, submitCallback: addItem })}>+ Add Item</Button>
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
        />
      }
    </div>
  );
}

export const Page = withAppContext(PageComp);