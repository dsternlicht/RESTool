import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigQueryParam } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { Table } from '../table/table.comp';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';

import './page.scss';

interface IProps {
  context: IAppContext
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService } = context;
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);
  const [queryParams, setQueryParams] = useState<IConfigQueryParam[]>(getAllConfig?.queryParams || []);

  async function getAllRequest() {
    setLoading(true);
    setError(null);

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
      }
      
      const { url, requestHeaders, actualMethod, dataPath } = getAllConfig;
      const result = await httpService[actualMethod || 'get'](url, queryParams, requestHeaders);
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

  function renderTable() {
    if (loading) {
      return <Loader />;
    }

    if (!items.length) {
      return <div className="app-error">Nothing to see here. Data result is empty.</div>;
    }

    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];

    return <Table fields={fields} items={items} />;
  }

  function submitForm(e: any) {
    e.preventDefault();

    const queryState: string = queryParams.map((queryParam, idx) => {
      return `${idx === 0 ? '?' : ''}${queryParam.name}=${encodeURIComponent(queryParam.value || '')}`;
    }).join('&');

    // Pushing query state to url
    push(queryState);

    getAllRequest();
  }

  function formChanged(fieldName: string, value: any) {
    const updatedQueryParams: IConfigQueryParam[] = [...queryParams].map((field) => {
      if (field.name === fieldName) {
        field.value = value;
      }

      return field;
    });

    setQueryParams(updatedQueryParams);
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
    const updatedQueryParams: IConfigQueryParam[] = queryParams.map((queryParam) => {
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
      </header>
      <main className="app-page-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export const Page = withAppContext(PageComp);