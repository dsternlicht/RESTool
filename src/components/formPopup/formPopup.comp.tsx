import React, { useState, useEffect } from 'react';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import { toast } from 'react-toastify';

import { Popup } from '../popup/popup.comp';
import {
  IConfigInputField,
  IConfigGetSingleMethod,
  IConfigPostMethod,
  IConfigPutMethod,
  ICustomLabels,
  IQueryParam
} from '../../common/models/config.model';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { fileHelpers } from '../../helpers/file.helpers';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';

import './formPopup.scss';

const unflatten = require('flat').unflatten;

interface IProps {
  context: IAppContext
  title: string
  type: string
  successMessage: string
  fields: IConfigInputField[]
  rawData?: any
  getSingleConfig?: IConfigGetSingleMethod
  methodConfig: IConfigPostMethod | IConfigPutMethod
  closeCallback: (reloadData: boolean) => void
  submitCallback: (body: any, containFiles: boolean, queryParams: IQueryParam[]) => void
}

export const FormPopup = withAppContext(({ context, title, type, successMessage, fields, rawData, getSingleConfig, methodConfig, submitCallback, closeCallback }: IProps) => {
  const fieldsCopy: IConfigInputField[] = fields.map(field => ({
    ...field,
    showFieldWhen: field.showFieldWhen
  }));
  const { httpService, activePage, config } = context;
  const { translatePage } = usePageTranslation(activePage?.id);
  const [loading, setLoading] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<IConfigInputField[]>([]);
  const [finalRawData, setFinalRawData] = useState<any>(null);
  const pageHeaders: any = activePage?.requestHeaders || {};
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels };

  async function initFormFields() {
    let finalRawData: any = rawData || {};

    if (getSingleConfig && getSingleConfig.url) {
      try {
        const { url, requestHeaders, actualMethod, dataPath, queryParams, responseType, dataTransform } = getSingleConfig;
        const result = await httpService.fetch({
          method: actualMethod || 'get',
          origUrl: url,
          queryParams,
          headers: Object.assign({}, pageHeaders, requestHeaders || {}),
          rawData,
          responseType
        });

        let extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

        if (typeof dataTransform === 'function') {
          extractedData = await dataTransform(extractedData);
        }

        if (extractedData && (typeof extractedData === 'object' || typeof extractedData === 'string')) {
          finalRawData = extractedData;
        }
      } catch (e) {
        console.error(translatePage('forms.errors.loadItemFailed'), e);
        toast.error(translatePage('forms.errors.loadItemFailed'));
      }
    }

    setFinalRawData(finalRawData); // Store the raw data for later.

    setFormFields(fieldsCopy.map((field) => {
      let key = field.name;

      field.originalName = field.name;

      let dataPathSplit: string[] = [];

      if (field.dataPath) {
        dataPathSplit = field.dataPath.split('.');
        key = `${field.dataPath}.${field.name}`;
      }

      const lookup = () => {
        let objToLookIn = finalRawData;
        for (const pathElem of dataPathSplit) {
          if (objToLookIn[pathElem] !== undefined && objToLookIn[pathElem] !== null) {
            objToLookIn = objToLookIn[pathElem];
          } else {
            return undefined;
          }
        }
        return objToLookIn[field.name];
      }

      const lookupValue = lookup();

      // Changing field name to include datapath
      // This will use us later for unflatten the final object
      field.name = key;

      if (dataHelpers.checkIfFieldIsObject(field)) {
        if (lookupValue || field.value) {
          field.value = JSON.stringify(lookupValue || field.value, null, '  ') || '';
        }
        return field;
      }

      if (field.type === 'array') {
        field.value = lookupValue || field.value || [];
        return field;
      }

      if (typeof lookupValue !== 'undefined') {
        field.value = lookupValue;
      } else {
        // important in order to prevent controlled / uncontrolled components error
        field.value = typeof field.value === 'undefined' ? '' : field.value;
      }

      if ((field.type === 'long-text' || field.type === 'text') && typeof finalRawData === 'string') {
        field.value = finalRawData;
      }

      return field;
    }));

    setLoading(false);
  }

  async function submitForm(e: any) {
    e.preventDefault();

    const finalObject: any = (methodConfig as IConfigPutMethod).includeOriginalFields ? Object.assign({}, finalRawData) : {};
    const formData = new FormData();
    const containFiles: boolean = fileHelpers.isMultipartForm(formFields);
    let validationError = null;

    var queryParams: IQueryParam[] = [];

    formFields.forEach((field) => {

      if (field.type === 'file') {
        const fileInput: any = document.querySelector(`input[name="${field.name || 'file'}"]`) as HTMLInputElement;

        if (fileInput.files.length > 0) {
          const firstFile = fileInput.files[0];
          formData.append(field.name || 'file', firstFile, firstFile.name);
        }
        return;
      }

      // Add null value for fields that should not be visible
      if (!shouldFieldBeVisible(field, formFields)) {
        finalObject[field.name] = null;
        return;
      }

      finalObject[field.name] = field.value;

      if (containFiles && !field.useInUrl) {
        formData.append(field.name, field.value ?? '');
      }

      const isFieldValueEmpty = (field: IConfigInputField): boolean => {
        if (field.value === 0 || field.value === false) return false;
        if (field.value === '' || field.value === null || field.value === undefined) return true;
        if (Array.isArray(field.value)) return field.value.length === 0;
        return false;
      }

      // Replace the validation code with:
      if (field.required && field.type !== 'boolean' && isFieldValueEmpty(field)) {
        validationError = translatePage('forms.errors.requiredFields');
      }

      if (dataHelpers.checkIfFieldIsObject(field) && field.value) {
        try {
          finalObject[field.name] = JSON.parse(field.value);
        } catch (e) {
          validationError = translatePage('forms.errors.invalidJson', { field: field.name });
        }
      }

      if (field.type === 'boolean') {
        finalObject[field.name] = field.value || false;
      }

      if (field.type === 'encode') {
        finalObject[field.name] = encodeURIComponent(field.value);
      }

      // check if integer/number fields are empty;
      // if so, set value to 'null' (otherwise would be rendered as string)
      if ((field.type === 'integer' || field.type === 'number') && field.value === "") {
        finalObject[field.name] = null;
      }

      if (field.useInUrl) {
        queryParams.push({ name: field.name, value: field.value });
      }

    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      let body = containFiles ? formData : unflatten(finalObject);
      await submitCallback(body, containFiles, queryParams);
      if (successMessage) {
        toast.success(successMessage);
      }

      closeCallback(true);
    } catch (e) {
      toast.error(e.message);
    }

    setLoading(false);
  }

  function formChanged(fieldName: string, value: any) {
    let updatedFormFields: IConfigInputField[] = [...formFields];

    updatedFormFields = dataHelpers.updateInputFieldFromFields(fieldName, value, updatedFormFields)

    setFormFields(updatedFormFields);
  }

  // Check if field should be visible based on showFieldWhen condition
  function shouldFieldBeVisible(field: IConfigInputField, fields: IConfigInputField[]): boolean {
    if (!field.showFieldWhen) return true;
    if (typeof field.showFieldWhen !== 'function') {
      console.warn(translatePage('common.warnings.showFieldWhenFunction'));
      return true;
    }
    return field.showFieldWhen(fields);
  }

  useEffect(() => {
    initFormFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popup
      show={true}
      className="form-popup"
      closeCallback={() => closeCallback(false)}
      customLabels={customLabels}
    >
      <React.Fragment>
        <h2>{title}</h2>
        <section>
          {
            loading ?
              <Loader /> :
              <form onSubmit={submitForm}>
                {
                  formFields.map((field, idx) => {
                    if (!shouldFieldBeVisible(field, formFields)) return null;
                    return (
                      <FormRow
                        key={`field_${idx}`}
                        field={field}
                        onChange={formChanged}
                        showReset={!field.type || field.type === 'text'}
                      />
                    );
                  })
                }
                <div className="buttons-wrapper center">
                  <Button type="submit" onClick={submitForm}>
                    {(customLabels?.buttons?.submitItem ||
                      type === 'add' ? translatePage('buttons.submitAdd') :
                      type === 'action' ? translatePage('buttons.submitAction') :
                        type === 'update' ? translatePage('buttons.submitUpdate') :
                          '')
                    }
                  </Button>
                </div>
              </form>
          }
        </section>
      </React.Fragment>
    </Popup>
  );
});
