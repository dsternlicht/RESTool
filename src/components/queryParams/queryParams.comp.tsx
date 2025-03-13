import React, { useState, useEffect } from 'react';

import { IConfigInputField, IConfigPagination } from '../../common/models/config.model';
import { FormRow } from '../formRow/formRow.comp';
import { Button } from '../button/button.comp';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';
import { dataHelpers } from "../../helpers/data.helpers";

import './queryParams.scss';

interface IProps {
  context: IAppContext;
  initialParams: IConfigInputField[];
  paginationConfig?: IConfigPagination;
  submitCallback: (queryParams: IConfigInputField[], reset?: boolean) => void;
}

const QueryParamsComp = ({ context, initialParams, paginationConfig, submitCallback }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(initialParams);

  function submit(e?: React.FormEvent) {
    if (e) {
      e.preventDefault();
    }

    if (paginationConfig && paginationConfig.type === 'infinite-scroll') {
      submitCallback(queryParams, true);
    } else {
      submitCallback(queryParams);
    }
  }

  function formChanged(fieldName: string, value: any, submitAfterChange?: boolean) {
    const updatedQueryParams: IConfigInputField[] = [...queryParams];

    dataHelpers.updateInputFieldFromFields(fieldName, value, updatedQueryParams);

    setQueryParams(updatedQueryParams);

    if (submitAfterChange) {
      submit();
    }
  }

  useEffect(() => {
    if (paginationConfig && paginationConfig.type === 'infinite-scroll') {
      const filteredParams = initialParams.filter(param => !['page', 'limit'].includes(param.name));
      setQueryParams(filteredParams);
    } else {
      setQueryParams(initialParams);
    }
  }, [paginationConfig, initialParams]);

  if (!queryParams.length) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <section className="query-params-form">
      <h5>{translatePage('forms.queryParams.title')}</h5>
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
        <Button type="submit" onClick={submit}>{translatePage('buttons.submit')}</Button>
      </form>
    </section>
  );
};

export const QueryParams = withAppContext(QueryParamsComp);
