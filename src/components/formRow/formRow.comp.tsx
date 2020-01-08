import React from 'react';
import { orderBy } from 'natural-orderby';

import { IConfigInputField } from '../../common/models/config.model';
import { Button } from '../button/button.comp';

import './formRow.scss';

interface IProps {
  field: IConfigInputField
  onChange: (fieldName: string, value: any, submitAfterChange?: boolean) => void
  showReset?: boolean
  direction?: 'row' | 'column'
}

export const FormRow = ({ field, direction, showReset, onChange }: IProps) => {
  function addItemToFieldArray(e: any, originalField: IConfigInputField) {
    e.preventDefault();

    onChange(field.name, [
      ...(originalField.value || []),
      ''
    ]);
  }

  function removeItemToFieldArray(originalField: IConfigInputField, idx: number) {
    const updatedArray = [
      ...(originalField.value || [])
    ];

    updatedArray.splice(idx, 1);

    onChange(field.name, updatedArray);
  }

  function renderArrayItems(originalField: IConfigInputField) {
    const array: any[] = originalField.value || [];

    return (
      <div className="array-form">
        {
          array.map((item, itemIdx) => {
            const inputField = renderFieldInput({
              value: item,
              name: `${originalField.name}.${itemIdx}`,
            } as IConfigInputField, (fieldName, value) => {
              const updatedArray = (originalField.value || []).map((localValue: any, idx: number) => {
                if (idx === itemIdx) {
                  return value;
                }
                return localValue;
              });
              
              onChange(originalField.name, updatedArray);
            });

            return (
              <div className="array-form-item" key={`array_form_${itemIdx}`}>
                {inputField}
                <i title="Clear" onClick={() => removeItemToFieldArray(originalField, itemIdx)} aria-label="Remove" className="clear-input fa fa-times"></i>
              </div>
            )
          })
        }
        <Button className="add-array-item" onClick={(e) => addItemToFieldArray(e, originalField)} title="Add Item">
          <i className="fa fa-plus" aria-hidden="true"></i>
        </Button>
      </div>
    );
  }

  function renderFieldInput(field: IConfigInputField, changeCallback: (fieldName: string, value: any, submitAfterChange?: boolean) => void) {
    switch (field.type) {
      case 'boolean':
        return <input type="checkbox" checked={field.value} onChange={(e) => changeCallback(field.name, e.target.checked, true)} disabled={field.readonly} />;
      case 'select':
        {
          const sortBy = field.optionSource?.sortBy;
          const sortedOptions = orderBy(field.options || [], typeof sortBy === 'string' ? [sortBy] : (sortBy || []));

          return (
            <select value={field.value} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required}>
              <option>-- Select --</option>
              {
                sortedOptions.map((option, idx) => {
                  const key = `option_${idx}_`;
                  if (typeof option !== 'object') {
                    return <option key={`${key}_${option}`} value={option}>{option}</option>  
                  }
                  return <option key={`${key}_${option.value}`} value={option.value}>{option.display || option.value}</option>
                })
              }
            </select>
          );
        };
      case 'object':
          return <textarea placeholder={field.placeholder || 'Enter JSON...'} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} value={field.value}></textarea>;
      case 'array': {
        const { arrayType, value } = field;
        if (!value || !arrayType || arrayType === 'object') {
          return <textarea placeholder={field.placeholder || 'Enter JSON array...'} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} value={field.value}></textarea>;
        }
        return renderArrayItems(field);
      }
      case 'long-text':
        return <textarea placeholder={field.placeholder || 'Enter text...'} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} value={field.value}></textarea>;
      case 'number':
      case 'integer':
        return <input type="number" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => changeCallback(field.name, e.target.valueAsNumber)} disabled={field.readonly} required={field.required} />;
      case 'color':
        return <input type="color" placeholder={field.placeholder || 'Select color...'} value={field.value} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'email':
        return <input type="email" placeholder={field.placeholder || 'Enter email...'} value={field.value} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'password':
        return <input type="password" placeholder={field.placeholder || 'Enter email...'} value={field.value} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
      case 'hidden':
        return <input type="hidden" value={field.value} />;
      case 'file':
        return <input type="file" accept={field.accept || '*'} placeholder={field.placeholder || 'Select file...'} name={field.name || 'file'} disabled={field.readonly} required={field.required} />;
      case 'note':
        return <p className="note">{field.value}</p>;
      case 'text':
      default:
        return <input type="text" placeholder={field.placeholder || 'Enter text...'} value={field.value} onChange={(e) => changeCallback(field.name, e.target.value)} disabled={field.readonly} required={field.required} />;
    }
  }
  
  return (
    <div className={`form-row ${direction || 'row'}`}>
      <label>{field.label || field.originalName}{field.required ? ' *' : ''}</label>
      {renderFieldInput(field, onChange)}
      {
        (showReset && !field.readonly && field.value && field.value.length > 0) &&
        <i title="Clear" onClick={() => onChange(field.name, '', true)} aria-label="Clear" className="clear-input fa fa-times"></i>
      }
    </div>
  );
};