import React, { useState } from 'react';
import { orderBy } from 'natural-orderby';
import { toast } from 'react-toastify';

import { IConfigInputField, IConfigOptionSource, ICustomLabels } from '../../common/models/config.model';
import { Button } from '../button/button.comp';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';
import { dataHelpers } from '../../helpers/data.helpers';

import './formRow.scss';

interface IProps {
  context: IAppContext
  field: IConfigInputField
  onChange: (fieldName: string, value: any, submitAfterChange?: boolean) => void
  showReset?: boolean
  direction?: 'row' | 'column'
}

export const FormRow = withAppContext(({ context, field, direction, showReset, onChange }: IProps) => {
  const [optionSources, setOptionSources] = useState<any>({});
  const { httpService, activePage, config } = context;
  const pageHeaders: any = activePage?.requestHeaders || {};
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels };
  const addArrayItemLabel = customLabels?.buttons?.addArrayItem || 'Add Item';
  const clearLabel = customLabels?.buttons?.clearInput || 'Clear';

  async function loadOptionSourceFromRemote(fieldName: string, optionSource: IConfigOptionSource) {
    try {
      const { url, dataPath, actualMethod, requestHeaders, displayPath, valuePath } = optionSource;

      if (!url) {
        throw new Error(`URL option source (for field "${fieldName}") is empty.`);
      }

      const result = await httpService.fetch({
        method: actualMethod || 'get',
        origUrl: url,
        queryParams: [],
        headers: Object.assign({}, pageHeaders, requestHeaders || {}),
      });

      const extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

      if (!extractedData || !extractedData.length) {
        throw new Error(`Option source data is empty (for field "${fieldName}")`);
      }


      // Map option source to fields
      const optionSourceData = extractedData.map((option: any, idx: number) => {

        const valueDataPath = dataHelpers.extractDataByDataPath(extractedData[idx], valuePath);
        if (!valueDataPath || !valueDataPath.length) {
          throw new Error(`Option source data is empty (for field "${valuePath}")`);
        }

        const displayDataPath = dataHelpers.extractDataByDataPath(extractedData[idx], displayPath);
        if (!displayDataPath || !displayDataPath.length) {
          throw new Error(`Option source data is empty (for field "${displayPath}")`);
        }

        option[valueDataPath] = valueDataPath;
        option[displayDataPath] = displayDataPath;

        if (typeof option === 'string') {
          return option;
        }

        return {
          display: displayDataPath && option[displayDataPath] ? option[displayDataPath] : `Option ${idx + 1}`,
          value: valueDataPath && option[valueDataPath] ? option[valueDataPath] : `${idx}`,
        };
      });

      setOptionSources({
        ...optionSources,
        [fieldName]: optionSourceData
      });
    } catch (e) {
      toast.error(e.message);
    }
  }

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
                <i title={clearLabel} onClick={() => removeItemToFieldArray(originalField, itemIdx)} aria-label="Remove" className="clear-input fa fa-times"></i>
              </div>
            )
          })
        }
        <Button className="add-array-item" onClick={(e) => addItemToFieldArray(e, originalField)} title={addArrayItemLabel}>
          <i className="fa fa-plus" aria-hidden="true"></i>
        </Button>
      </div>
    );
  }

  function renderFieldInput(field: IConfigInputField, changeCallback: (fieldName: string, value: any, submitAfterChange?: boolean) => void) {
    const inputProps = (defaultPlaceholder: string = '') => {
      return {
        value: field.value,
        placeholder: field.placeholder || defaultPlaceholder,
        disabled: field.readonly,
        required: field.required,
        onChange: (e: any) => changeCallback(field.name, e.target.value),
      };
    };

    switch (field.type) {
      case 'boolean':
        return <input type="checkbox" {...inputProps()} checked={field.value} onChange={(e) => changeCallback(field.name, e.target.checked, true)} />;
      case 'select':
        {
          const { optionSource } = field;

          if (optionSource && !optionSources[field.name]) {
            loadOptionSourceFromRemote(field.name, optionSource);
            return <select {...inputProps()}><option>-- Loading Options... --</option></select>
          }

          const sortBy = field.optionSource?.sortBy;
          const finalOptions: { value: string, display: string }[] = optionSources[field.name] || field.options || [];
          const sortedOptions = orderBy(finalOptions, typeof sortBy === 'string' ? [sortBy] : (sortBy || []));

          return (
            <select {...inputProps()}>
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
        return <textarea {...inputProps(customLabels?.placeholders?.object || 'Enter JSON...')}></textarea>;
      case 'array': {
        const { arrayType, value } = field;
        if (!value || !arrayType || arrayType === 'object') {
          return <textarea {...inputProps(customLabels?.placeholders?.array || 'Enter JSON array...')}></textarea>;
        }
        return renderArrayItems(field);
      }
      case 'long-text':
        return <textarea {...inputProps(customLabels?.placeholders?.text || 'Enter text...')}></textarea>;
      case 'number':
      case 'integer':
        return <input type="number" {...inputProps(customLabels?.placeholders?.number || '0')} onChange={(e) => changeCallback(field.name, e.target.valueAsNumber)} />;
      case 'color':
        return <input type="color" {...inputProps(customLabels?.placeholders?.color || 'Enter color...')} />;
      case 'email':
        return <input type="email" {...inputProps(customLabels?.placeholders?.email || 'Enter email...')} />;
      case 'password':
        return <input type="password" {...inputProps(customLabels?.placeholders?.password || 'Enter password...')} />;
      case 'hidden':
        return <input type="hidden" value={field.value} />;
      case 'file':
        return <input type="file" accept={field.accept || '*'} placeholder={field.placeholder || customLabels?.placeholders?.file || 'Select file...'} name={field.name || 'file'} disabled={field.readonly} required={field.required} />;
      case 'note':
        return <p className="note">{field.value}</p>;
      case 'date':
        return <input type="date" {...inputProps(customLabels?.placeholders?.date || 'Enter date...')} />;
      case 'text':
      default:
        return <input type="text" {...inputProps(customLabels?.placeholders?.text || 'Enter text...')} />;
    }
  }

  return (
    <div className={`form-row ${direction || 'row'}`}>
      {
        field.type !== 'hidden' &&
        <label>{field.label || field.originalName}{field.required ? ' *' : ''}</label>
      }
      {renderFieldInput(field, onChange)}
      {
        (showReset && !field.readonly && field.value && field.value.length > 0) &&
        <i title={clearLabel} onClick={() => onChange(field.name, '', true)} aria-label="Clear" className="clear-input fa fa-times"></i>
      }
    </div>
  );
});
