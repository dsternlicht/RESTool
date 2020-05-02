import React, { useState, useEffect } from 'react';

import { IConfigInputField, IConfigPagination, IQueryParamConfig } from '../../common/models/config.model';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';

import './queryParams.scss';

interface IProps {
  initialParams: IConfigInputField[]
  paginationConfig: IConfigPagination | undefined
  submitCallback: (queryParams: IConfigInputField[]) => void
}

export const QueryParams = ({ initialParams, paginationConfig, submitCallback }: IProps) => {
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(initialParams);

  function submit(e?: any) {
    if (e) {
      e.preventDefault();
    }

    submitCallback(queryParams);
  }

  function formChanged(fieldName: string, value: any, submitAfterChange?: boolean) {
    const updatedQueryParams: IConfigInputField[] = [...queryParams].map((field) => {
      if (field.name === fieldName) {
        field.value = value;
      }

      return field;
    });

    setQueryParams(updatedQueryParams);

    if (submitAfterChange) {
      submit();
    }
  }

  useEffect(() => {
    const paramsToIgnore = paginationConfig ?
      Object.values(paginationConfig.params).map((conf: IQueryParamConfig) => {
        return conf.name;
      }) :
      [];
    const filteredParams = initialParams.filter(param => !paramsToIgnore.includes(param.name));
    setQueryParams(filteredParams);
  }, [paginationConfig, initialParams]);

  if (!queryParams.length) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <section className="query-params-form">
      <h5>Query Params:</h5>
      <form onSubmit={submit}>
        {
          queryParams.map((queryParam, idx) => {
            return (
              <FormRow
                key={`query_param_${idx}`}
                field={queryParam}
                onChange={formChanged}
                showReset={!queryParam.type || queryParam.type === 'text'}
              />
            );
          })
        }
        <Button type="submit" onClick={submit}>Submit</Button>
      </form>
    </section>
  );
};