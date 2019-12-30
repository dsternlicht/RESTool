import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { Table } from '../table/table.comp';
import { FormRow } from '../formRow/formRow.comp';
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
  submitCallback: (body: any, rawData: any) => void
  rawData?: {}
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService } = context;
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [items, setItems] = useState<any[]>([]);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(getAllConfig?.queryParams || []);

  function closeFormPopup(refreshData: boolean = false) {
    setOpenedPopup(null);

    if (refreshData === true) {
      getAllRequest();
    }
  }

  function openEditPopup(rawData: any) {
    const params: IPopupProps = { 
      rawData,
      type: 'update', 
      title: 'Update Item', 
      config: putConfig as IConfigPutMethod, 
      submitCallback: updateItem 
    };

    setOpenedPopup(params);
  }

  async function getAllRequest() {
    setLoading(true);
    setError(null);

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
      }
      
      const { url, requestHeaders, actualMethod, dataPath } = getAllConfig;
      const result = await httpService.fetch({
        method: actualMethod || 'get', 
        origUrl: url, 
        queryParams, 
        headers: requestHeaders
      });
      const extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

      if (!extractedData) {
        throw new Error('Could not extract data from response.');
      }

      if (!Array.isArray(extractedData)) {
        throw new Error('Extracted data is invalid.');
      }

      setItems(extractedData);
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

  function submitForm(e?: any) {
    if (e) {
      e.preventDefault();
    }

    if (loading) {
      return;
    }

    const queryState: string = queryParams.map((queryParam, idx) => {
      return `${idx === 0 ? '?' : ''}${queryParam.name}=${encodeURIComponent(queryParam.value || '')}`;
    }).join('&');

    // Pushing query state to url
    push(queryState);

    getAllRequest();
  }

  function formChanged(fieldName: string, value: any, submitAfterChange?: boolean) {
    const updatedQueryParams: IConfigInputField[] = [...queryParams].map((field) => {
      if (field.name === fieldName) {
        field.value = value;
      }

      return field;
    });

    setQueryParams(updatedQueryParams);

    if (submitAfterChange) {
      submitForm();
    }
  }

  function renderQueryParamsForm() {
    if (!queryParams.length) {
      return <React.Fragment></React.Fragment>;
    }

    return (
      <section className="query-params-form">
        <h5>Query Params:</h5>
        <form onSubmit={submitForm}>
          {
            queryParams.map((queryParam, idx) => {
              return (
                <FormRow 
                  key={`query_param_${idx}`}
                  field={queryParam} 
                  onChange={formChanged}
                  showReset={!queryParam.type || queryParam.type === 'text'}
                />
              );
            })
          }
          <Button onClick={submitForm}>Submit</Button>
        </form>
      </section>
    );
  }

  function renderTable() {
    if (loading) {
      return <Loader />;
    }

    if (!items.length) {
      return <div className="app-error">Nothing to see here. Result is empty.</div>;
    }

    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];

    return (
      <Table 
        callbacks={{
          delete: deleteConfig ? deleteItem : () => {},
          put: putConfig ? openEditPopup : () => {},
        }}
        fields={fields}
        items={items} 
      />
    );
  }

  function renderPageContent() {
    if (error) {
      return <div className="app-error">{error}</div>;
    }

    return (
      <React.Fragment>
        {renderQueryParamsForm()}
        {renderTable()}
      </React.Fragment>
    )
  }

  useEffect(() => {
    const nextActivePage: IConfigPage | null = context?.config?.pages?.filter((p, pIdx) => p.id === page || (pIdx + 1) === parseInt(page || ''))[0] || null;
    context.setActivePage(nextActivePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  useEffect(() => {
    // Converting query state to local data
    const params = QueryString.parse(location.search);
    const updatedQueryParams: IConfigInputField[] = queryParams.map((queryParam) => {
      if (typeof params[queryParam.name] !== 'undefined') {
        queryParam.value = queryParam.type === 'boolean' ? (params[queryParam.name] === 'true') : decodeURIComponent(params[queryParam.name] as any);
      }
      return queryParam;
    });
    
    setQueryParams(updatedQueryParams);

    // Load data
    getAllRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

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
        />
      }
    </div>
  );
}

export const Page = withAppContext(PageComp);