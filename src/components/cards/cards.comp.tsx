import React, { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';

import { IConfigDisplayField, IConfigCustomAction, ICustomLabels } from '../../common/models/config.model';
import { IPaginationState } from '../../common/models/states.model';
import { dataHelpers } from '../../helpers/data.helpers';
import { Button } from '../button/button.comp';
import { Pagination } from '../pagination/pagination.comp';

import './cards.scss';

interface IProps {
  items: any[]
  pagination?: IPaginationState
  callbacks: {
    delete: ((item: any) => void) | null
    put: ((item: any) => void) | null
    action: (item: any, action: IConfigCustomAction) => void
    getNextPage: (() => void) | null
    getPreviousPage: (() => void) | null
  }
  fields: IConfigDisplayField[]
  customActions?: IConfigCustomAction[]
  customLabels?: ICustomLabels
}

export const Cards = ({ items, fields, callbacks, customActions, customLabels, pagination }: IProps) => {
  const editLabel: string = customLabels?.buttons?.editItem || 'Edit';
  const deleteLabel: string = customLabels?.buttons?.deleteItem || 'Delete';
  const paginationCallbacks = {
    nextPage: callbacks.getNextPage || (() => { return; }),
    previousPage: callbacks.getPreviousPage || (() => { return; }),
  };

  function renderRow(origField: IConfigDisplayField, origItem: any, value: any) {
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
        if (!value) {
          return <React.Fragment></React.Fragment>;
        }
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

  function renderActions(item: any, cardIdx: number) {
    return (
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
            <Button key={`action_${cardIdx}_${idx}`} onClick={() => callbacks.action(item, action)} title={action.name}>
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
    );
  }

  function renderCard(item: any, cardIdx: number) {
    return (
      <div className="card" key={`card_${cardIdx}`}>
        {
          fields.map((field, fieldIdx) => {
            const value = dataHelpers.extractDataByDataPath(item, field.dataPath, field.name);
            return (
              <div className={`card-row ${field.type}`} key={`card_${cardIdx}_${fieldIdx}`}>
                {
                  field.type !== 'image' &&
                  <label>{field.label || field.name}: </label>
                }
                {renderRow(field, item, value)}
              </div>
            );
          })
        }
        {renderActions(item, cardIdx)}
      </div>
    );
  }

  function renderCardSkeleton(cardIdx: number) {
    return (
      <div className="card" key={`card_${cardIdx}`}>
        {
          fields.map((field, fieldIdx) => {
            return (
              <div className={`card-row ${field.type}`} key={`card_${cardIdx}_${fieldIdx}`}>
                {
                  field.type !== 'image' &&
                  <label>{field.label || field.name}: </label>
                }
                <Skeleton duration={0.6} />
              </div>
            );
          })
        }
        {renderActions({}, cardIdx)}
      </div>
    );
  }

  function renderSkeletons() {
    const startingIndex = items.length;
    const skeletonsIndexes = Array.from(Array(pagination?.limit).keys()).map(value => value + startingIndex);
    return skeletonsIndexes.map(renderCardSkeleton);
  }

  useEffect(() => {
    if (
      pagination?.type === 'infinite-scroll'
      && document.body.clientHeight <= window.innerHeight
      && callbacks.getNextPage
      && pagination?.hasNextPage
    ) {
      callbacks.getNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pagination?.type === 'infinite-scroll') {
    return (
      <InfiniteScroll className="cards-wrapper"
        dataLength={items.length}
        next={callbacks.getNextPage || (() => null)}
        hasMore={pagination?.hasNextPage || false}
        loader={renderSkeletons()}
      >
        {items.map(renderCard)}
      </InfiniteScroll>
    );
  }

  return (
    <React.Fragment>
      <div className="cards-wrapper">
        {items.map(renderCard)}
      </div>
      {
        pagination &&
        pagination.type === 'buttons' &&
        <Pagination
          callbacks={paginationCallbacks}
          pagination={pagination}
        ></Pagination>
      }
    </React.Fragment>
  )
}
