import React from 'react';

import { IConfigInputField } from '../../common/models/config.model';

import './formRow.scss';

interface IProps {
  field: IConfigInputField
  onChange: (fieldName: string, value: any, submitAfterChange?: boolean) => void
  showReset?: boolean
  direction?: 'row' | 'column'
}

export const FormRow = ({ field, direction, showReset, onChange }: IProps) => {
  function renderFieldInput() {
    switch (field.type) {
      case 'boolean':
          return <input type="checkbox" checked={field.value} onChange={(e) => onChange(field.name, e.target.checked, true)} />;
      case 'select':
          return (
            <select value={field.value} onChange={(e) => onChange(field.name, e.target.value)}>
              {
                (field.options || [])
              }
            </select>
          );
      case 'number':
          return <input type="number" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} />;
      case 'text':
      default:
        return <input type="text" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} />;
    }
  }
  
  return (
    <div className={`form-row ${direction || 'row'}`}>
      <label>{field.label}</label>
      {renderFieldInput()}
      {
        (showReset && field.value.length > 0) &&
        <i title="Clear" onClick={() => onChange(field.name, '', true)} aria-label="Clear" className="clear-input fa fa-times"></i>
      }
    </div>
  );
};