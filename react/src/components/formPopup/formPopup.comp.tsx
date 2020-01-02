import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Popup } from '../popup/popup.comp';
import { IConfigInputField, IConfigGetSingleMethod } from '../../common/models/config.model';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';

import './formPopup.scss';

const flatten = require('flat');
const unflatten = require('flat').unflatten;

interface IProps {
  context: IAppContext
  title: string
  fields: IConfigInputField[]
  rawData?: any
  getSingleConfig?: IConfigGetSingleMethod
  closeCallback: (reloadData: boolean) => void
  submitCallback: (body: any) => void
}

export const FormPopup = withAppContext(({ context, title, fields, rawData, getSingleConfig, submitCallback, closeCallback }: IProps) => {
  const { httpService } = context;
  const [loading, setLoading] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<IConfigInputField[]>([]);

  async function initFormFields() {
    let finalRawData: any = rawData;

    if (getSingleConfig && getSingleConfig.url) {
      try {
        const { url, requestHeaders, actualMethod, dataPath, queryParams } = getSingleConfig;
        const result = await httpService.fetch({
          method: actualMethod || 'get', 
          origUrl: url, 
          queryParams, 
          headers: requestHeaders,
          rawData,
        });
        
        const extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

        if (extractedData && typeof extractedData === 'object') {
          finalRawData = extractedData;
        }
      } catch (e) {
        console.error('Could not load single item\'s data.', e);
        toast.error('Could not load single item\'s data.');
      }
    }

    const flattenData = flatten(finalRawData || {});
    
    setFormFields(fields.map((field) => {
      let key = field.name;
      
      if (field.dataPath) {
        key = `${field.dataPath}.${field.name}`;
      }
  
      // Changing field name to include datapath
      // This will use us later for unflatten the final object
      field.name = key;
  
      if (field.type === 'object') {
        field.value = JSON.stringify(finalRawData[key], null, '  ');
        return field;
      }
  
      if (flattenData[key]) {
        field.value = flattenData[key];
      } else {
        // important in order to prevent controlled / uncontrolled components error
        field.value = '';
      }
  
      return field;
    }));

    setLoading(false);
  } 

  async function submitForm(e: any) {
    e.preventDefault();

    const finalObject: any = {};
    let validationError = null;

    formFields.forEach((field) => {
      finalObject[field.name] = field.value;

      if (field.required && !field.value) {
        validationError = 'Please fill up all required fields.';
      }

      if (field.type === 'object' && field.value) {
        try {
          finalObject[field.name] = JSON.parse(field.value);
        } catch (e) {
          validationError = `Invalid JSON for field "${field.name}".`;
        }
      }
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const body = unflatten(finalObject);
      await submitCallback(body);
      
      toast.success('Great Success!');
      
      closeCallback(true);
    } catch (e) {
      toast.error(e.message);
    }

    setLoading(false);
  }

  function formChanged(fieldName: string, value: any) {
    let updatedFormFields: IConfigInputField[] = JSON.parse(JSON.stringify(formFields));
    
    updatedFormFields = updatedFormFields.map((field: IConfigInputField) => {
      if (field.name === fieldName) {
        field.value = value;
      }

      return field;
    });

    setFormFields(updatedFormFields);
  }

  useEffect(() => {
    initFormFields();
  }, []);

  return (
    <Popup
      show={true}
      className="form-popup"
      closeCallback={() => closeCallback(false)}
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
                <Button type="submit" onClick={submitForm} color="green">Submit</Button>
              </div>
            </form>
          }
        </section>
      </React.Fragment>
    </Popup>
  );
});