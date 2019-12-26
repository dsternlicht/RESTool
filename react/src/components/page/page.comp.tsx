import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, TConfigDisplayField, IConfigGetAllMethod } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';

import './page.scss';

interface IProps {
  context: IAppContext
}

const PageComp = ({ context }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);
  const { page } = useParams();
  const { activePage, error, setError, httpService } = context;
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const getAllConfig: IConfigGetAllMethod | undefined = pageMethods?.getAll;

  async function getAllRequest() {
    setLoading(true);
    setError(null);

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
      }
      
      const { url, queryParams, requestHeaders, actualMethod, dataPath } = getAllConfig;
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

  function renderTableCell(type: TConfigDisplayField, value: any) {
    switch (type) {
      case 'text':
        return value;
      case 'boolean':
        return <div className={`bool ${value ? 'true' : 'false'}`}></div>;
      case 'image':
        return <img src={value} alt={value} />
      case 'url':
        return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
      default:
        return value;
    }
  }

  function renderPageContent() {
    if (error) {
      return <div className="app-error">{error}</div>;
    }

    if (loading) {
      return <Loader />;
    }

    if (!items.length) {
      return <div className="app-error">Nothing to see here. Data is empty.</div>;
    }

    const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];

    return (
      <div className="table-wrapper">
        <table className="pure-table pure-table-horizontal">
          <thead>
            <tr>
              {
                fields.map((field) => {
                  return <th key={`th_${field.name}`}>{field.label || field.name}</th>;
                })
              }
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              items.map((item, rowIdx) => {
                return (
                  <tr key={`tr_${rowIdx}`}>
                    {
                      fields.map((field, fieldIdx) => {
                        const value = dataHelpers.extractDataByDataPath(item, field.dataPath, field.name);
                        return <td key={`td_${rowIdx}_${fieldIdx}`}>{renderTableCell(field.type, value)}</td>
                      })
                    }
                    <td>
                      actions
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }

  useEffect(() => {
    const nextActivePage: IConfigPage | null = context?.config?.pages?.filter((p, pIdx) => p.id === page || (pIdx + 1) === parseInt(page || ''))[0] || null;
    context.setActivePage(nextActivePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  useEffect(() => {
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