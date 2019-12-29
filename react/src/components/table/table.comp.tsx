import React from 'react';

import { TConfigDisplayField, IConfigDisplayField } from '../../common/models/config.model';
import { dataHelpers } from '../../helpers/data.helpers';
import { Button } from '../button/button.comp';

import './table.scss';

interface IProps {
  items: any[]
  callbacks: {
    delete: (item: any) => void
    put: (item: any) => void
  }
  fields: IConfigDisplayField[]
}

export const Table = ({ items, fields, callbacks }: IProps) => {
  function renderTableCell(type: TConfigDisplayField, value: any) {
    switch (type) {
      case 'text':
        return value;
      case 'boolean':
        return <div className={`bool ${value ? 'true' : 'false'}`}></div>;
      case 'image':
        return <img src={value} alt={value} />;
      case 'url':
        return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
      case 'colorbox':
        return <div className="colorbox" style={{ backgroundColor: value }}></div>;
      default:
        return value;
    }
  }

  return (
    <div className="table-wrapper">
      <table className="pure-table">
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
                    <div className="actions-wrapper">
                      {
                        callbacks.put &&
                        <Button onClick={() => callbacks.put(item)} title="Edit">
                          <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                        </Button>
                      }
                      {
                        false && // TODO: Support custom actions
                        <i className="fa fa-cogs" aria-hidden="true"></i>
                      }
                      {
                        callbacks.delete &&
                        <Button onClick={() => callbacks.delete(item)} title="Delete">
                          <i className="fa fa-times" aria-hidden="true"></i>
                        </Button>
                      }
                    </div>
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