import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { Popup } from '../popup/popup.comp';
import { IConfigInputField } from '../../common/models/config.model';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';

import './formPopup.scss';
import { Loader } from '../loader/loader.comp';

const flatten = require('flat');
const unflatten = require('flat').unflatten;

interface IProps {
  title: string
  fields: IConfigInputField[]
  rawData?: any
  closeCallback: (reloadData: boolean) => void
  submitCallback: (body: any, rawData: any) => void
}

export const FormPopup = ({ title, fields, rawData, submitCallback, closeCallback }: IProps) => {
  const flattenData = flatten(rawData || {});
  const [loading, setLoading] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<IConfigInputField[]>(fields.map((field) => {
    let key = field.name;
    
    if (field.dataPath) {
      key = `${field.dataPath}.${field.name}`;
    }

    // Changing field name to include datapath
    // This will use us later for unflatten the final object
    field.name = key;

    if (flattenData[key]) {
      field.value = flattenData[key]
    } else {
      // important in order to prevent controlled / uncontrolled components error
      field.value = '';
    }

    return field;
  }));
  
  async function submitForm(e: any) {
    e.preventDefault();

    setLoading(true);
    
    const finalObject: any = {};

    formFields.forEach((field) => {
      finalObject[field.name] = field.value;
    });

    try {
      const body = unflatten(finalObject);
      await submitCallback(body, rawData);
      
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
                <Button onClick={submitForm} color="green">Submit</Button>
              </div>
            </form>
          }
        </section>
      </React.Fragment>
    </Popup>
  );
};