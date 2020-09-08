import React, { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { IConfigDisplayField, IConfigCustomAction, ICustomLabels } from '../../common/models/config.model';
import { dataHelpers } from '../../helpers/data.helpers';
import { Button } from '../button/button.comp';
import { InfiniteLoader } from '../infiniteLoader/infiniteLoader.comp';
import { IPaginationState } from '../../common/models/states.model';
import { Pagination } from '../pagination/pagination.comp';

import './table.scss';

interface IProps {
  items: any[]
  pagination?: IPaginationState
  callbacks: {
    delete: ((item: any) => void) | null
    put: ((item: any) => void) | null
    action: (item: any, action: IConfigCustomAction) => void
    getPreviousPage: (() => void) | null
    getNextPage: (() => void) | null
  }
  fields: IConfigDisplayField[]
  customActions?: IConfigCustomAction[]
  customLabels?: ICustomLabels
}

export const Table = ({ items, fields, pagination, callbacks, customActions, customLabels }: IProps) => {
  const editLabel = customLabels?.buttons?.editItem || 'Edit';
  const deleteLabel = customLabels?.buttons?.deleteItem || 'Delete';
  const actionColumnHeader = customLabels?.tableColumnHeaders?.actions || 'Actions';
  const paginationCallbacks = {
    nextPage: callbacks.getNextPage || (() => { return; }),
    previousPage: callbacks.getPreviousPage || (() => { return; }),
  };

  function renderTableCell(origField: IConfigDisplayField, origItem: any, value: any) {
    if (origField.type === 'boolean') {
      value = value ? true : false;
    }

    if (value && typeof value === 'object') {
      return 'object';
    }

    switch (origField.type) {
      case 'text':
        return <span>{value}</span>;
      case 'boolean':
        return <div className={`bool ${value ? 'true' : 'false'}`}></div>;
      case 'image':
        return <img src={value || ''} alt={value || origField.label || origField.name} />;
      case 'url':
        let url: string = origField.url || value || '';

        // Replace all url vars
        fields.forEach((field) => {
          const fieldValue = dataHelpers.extractDataByDataPath(origItem, field.dataPath, field.name);
          url = url.replace(`:${field.name}`, fieldValue);
        });

        return <a href={url} target="_blank" rel="noopener noreferrer">{origField.urlLabel || value}</a>;
      case 'colorbox':
        return <div className="colorbox" style={{ backgroundColor: value }}></div>;
      case 'html':
        const htmlCode = origField.htmlCode || '<span>{value}</span>';
        const html =  htmlCode.replace('{value}', value);
        return <div dangerouslySetInnerHTML={{__html: html}}></div>
      default:
        return value;
    }
  }

  function renderTableRow(item: any, rowIdx: number) {
    return (
      <tr key={`tr_${rowIdx}`}>
        {
          fields.map((field, fieldIdx) => {
            const value = dataHelpers.extractDataByDataPath(item, field.dataPath, field.name);
            return (
              <td className={field.truncate ? 'truncate' : ''} key={`td_${rowIdx}_${fieldIdx}`}>
                {renderTableCell(field, item, value)}
              </td>
            );
          })
        }
        <td>
          <div className="actions-wrapper">
            {
              callbacks.put &&
              <Button onClick={() => callbacks.put?.(item)} title={editLabel}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </Button>
            }
            {
              (customActions && customActions.length > 0) &&
              customActions.map((action, idx) => (
                <Button key={`action_${rowIdx}_${idx}`} onClick={() => callbacks.action(item, action)} title={action.name}>
                  <i className={`fa fa-${action.icon || 'cogs'}`} aria-hidden="true"></i>
                </Button>
              ))
            }
            {
              callbacks.delete &&
              <Button onClick={() => callbacks.delete?.(item)} title={deleteLabel}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </Button>
            }
          </div>
        </td>
      </tr>
    );
  }

  function renderTableContent() {
    return (
      <table className="pure-table">
        <thead>
          <tr>
            {
              fields.map((field) => {
                return <th key={`th_${field.name}`}>{field.label || field.name}</th>;
              })
            }
            <th>{actionColumnHeader}</th>
          </tr>
        </thead>
        <tbody>
          {
            items.map(renderTableRow)
          }
        </tbody>
      </table>
    );
  }

  useEffect(() => {
    if (
      pagination?.type === 'infinite-scroll'
      && document.body.clientHeight <= window.innerHeight
      && pagination?.hasNextPage
    ) {
      paginationCallbacks.nextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pagination?.type === 'infinite-scroll') {
    return (
      <InfiniteScroll
        dataLength={items.length}
        next={callbacks.getNextPage || (() => null)}
        hasMore={pagination?.hasNextPage || false}
        loader={<InfiniteLoader />}
      >
        {renderTableContent()}
      </InfiniteScroll>
    );
  }

  return (
    <div className="table-wrapper">
      {renderTableContent()}
      {
        pagination &&
        pagination.type === 'buttons' &&
        <Pagination
          callbacks={paginationCallbacks}
          pagination={pagination}
          customLabels={customLabels}
        ></Pagination>
      }
    </div >
  );
}
