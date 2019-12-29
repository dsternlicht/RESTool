import React from 'react';

import { IConfigInputField, IConfigQueryParam } from '../../common/models/config.model';

import './formRow.scss';

interface IProps {
  field: IConfigInputField | IConfigQueryParam
  onChange: (fieldName: string, value: any) => void
  showReset?: boolean
  direction?: 'row' | 'column'
}

export const FormRow = ({ field, direction, showReset, onChange }: IProps) => {
  function renderFieldInput() {
    switch (field.type) {
      case 'boolean':
          return <input type="checkbox" checked={field.value} onChange={(e) => onChange(field.name, e.target.checked)} />;
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
        <i title="Clear" onClick={() => onChange(field.name, '')} aria-label="Clear" className="clear-input fa fa-times"></i>
      }
    </div>
  );
};