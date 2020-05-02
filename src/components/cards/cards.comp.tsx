import React from 'react';

import InfiniteScroll from 'react-infinite-scroll-component';
import { IConfigDisplayField, IConfigCustomAction, ICustomLabels } from '../../common/models/config.model';
import { dataHelpers } from '../../helpers/data.helpers';
import { Button } from '../button/button.comp';

import './cards.scss';

interface IProps {
  items: any[]
  hasMore: boolean
  callbacks: {
    delete: ((item: any) => void) | null
    put: ((item: any) => void) | null
    action: (item: any, action: IConfigCustomAction) => void
    getNextPage: (() => void) | null
  }
  fields: IConfigDisplayField[]
  customActions?: IConfigCustomAction[]
  customLabels?: ICustomLabels
}

export const Cards = ({ items, fields, callbacks, customActions, customLabels, hasMore }: IProps) => {
  function renderRow(origField: IConfigDisplayField, value: any) {
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
        const url: string = (origField.url || value || '').replace(`:${origField.name}`, value);
        return <a href={url} target="_blank" rel="noopener noreferrer">{value}</a>;
      case 'colorbox':
        return <div className="colorbox" style={{ backgroundColor: value }}></div>;
      default:
        return value;
    }
  }

  const editLabel: string = customLabels?.buttons?.editItem || 'Edit';
  const deleteLabel: string = customLabels?.buttons?.deleteItem || 'Delete';

  return (
    <InfiniteScroll className="cards-wrapper"
      dataLength={items.length}
      next={callbacks.getNextPage || (() => null)}
      hasMore={hasMore}
      loader={<div></div>} // TODO: find a elegant solution
    >
      {
        items.map((item, cardIdx) => {
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
                      {renderRow(field, value)}
                    </div>
                  );
                })
              }
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
            </div>
          );
        })
      }
    </InfiniteScroll>
  );
}