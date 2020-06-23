import React from 'react';

import { IConfigDisplayField, ICustomLabels } from '../../common/models/config.model';
import { dataHelpers } from '../../helpers/data.helpers';

import './details.scss';

interface IProps {
  item?: any
  fields: IConfigDisplayField[]
  customLabels?: ICustomLabels
}

export const Details = ({ item, fields, customLabels }: IProps) => {
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
        return value ? <img src={value || ''} alt={value || origField.label || origField.name} /> : null;
      case 'url':
        const url: string = (origField.url || value || '').replace(`:${origField.name}`, value);
        return <a href={url} target="_blank" rel="noopener noreferrer">{value}</a>;
      case 'colorbox':
        return <div className="colorbox" style={{ backgroundColor: value }}></div>;
      default:
        return value;
    }
  }

  return (
    <div className="details" key={`details`}>
      {
        item &&
        fields.map((field, fieldIdx) => {
          const value = dataHelpers.extractDataByDataPath(item, field.dataPath, field.name);
          return (
            <div className={`details-row ${field.type}`} key={`details_${fieldIdx}`}>
              {
                field.type !== 'image' &&
                <label>{field.label || field.name}: </label>
              }
              {renderRow(field, value)}
            </div>
          );
        })
      }
    </div>
  );
}