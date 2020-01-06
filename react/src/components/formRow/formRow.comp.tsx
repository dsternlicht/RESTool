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
        return <input type="checkbox" checked={field.value} onChange={(e) => onChange(field.name, e.target.checked, true)} disabled={field.readonly} />;
      case 'select':
        return (
          <select value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required}>
            <option>-- Select --</option>
            {
              (field.options || []).map((option, idx) => {
                const key = `option_${idx}_`;
                if (typeof option !== 'object') {
                  return <option key={`${key}_${option}`} value={option}>{option}</option>  
                }
                return <option key={`${key}_${option.value}`} value={option.value}>{option.display || option.value}</option>
              })
            }
          </select>
        );
      case 'object':
      case 'array': // TODO: add arrayType support
        return <textarea placeholder={field.placeholder || 'Enter JSON...'} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} value={field.value}></textarea>;
      case 'long-text':
        return <textarea placeholder={field.placeholder || 'Enter text...'} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} value={field.value}></textarea>;
      case 'number':
      case 'integer':
        return <input type="number" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => onChange(field.name, e.target.valueAsNumber)} disabled={field.readonly} required={field.required} />;
      case 'color':
        return <input type="color" placeholder={field.placeholder || 'Select color...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'email':
        return <input type="email" placeholder={field.placeholder || 'Enter email...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'password':
        return <input type="password" placeholder={field.placeholder || 'Enter email...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'hidden':
        return <input type="hidden" value={field.value} />;
      case 'file':
        return <input type="file" accept={field.accept || '*'} placeholder={field.placeholder || 'Select file...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'note':
        return <p className="note">{field.value}</p>;
      case 'text':
      default:
        return <input type="text" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => onChange(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
    }
  }
  
  return (
    <div className={`form-row ${direction || 'row'}`}>
      <label>{field.label || field.originalName}{field.required ? '* ' : ''}</label>
      {renderFieldInput()}
      {
        (showReset && !field.readonly && field.value && field.value.length > 0) &&
        <i title="Clear" onClick={() => onChange(field.name, '', true)} aria-label="Clear" className="clear-input fa fa-times"></i>
      }
    </div>
  );
};