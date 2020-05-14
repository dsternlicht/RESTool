import React from 'react';
import { ICustomLabels } from '../../common/models/config.model';
import { IPaginationState } from '../../common/models/states.model';
import { Button } from '../button/button.comp';

import './pagination.scss';

interface IProps {
  pagination: IPaginationState
  callbacks: {
    previousPage: () => void,
    nextPage: () => void,
  }
  customLabels?: ICustomLabels
}

export const Pagination = ({ callbacks, pagination, customLabels }: IProps) => {
  const previousTitle = customLabels?.pagination?.previousPageTitle || 'Previous page';
  const nextTitle = customLabels?.pagination?.nextPageTitle || 'Next page';
  return (
    <div className="pagination-wrapper">
      <Button disabled={!pagination.hasPreviousPage} onClick={() => callbacks.previousPage()} title={previousTitle}>
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Button>
      <Button disabled={!pagination.hasNextPage} onClick={() => callbacks.nextPage()} title={nextTitle}>
        <i className="fa fa-arrow-right" aria-hidden="true" ></i>
      </Button>
    </div>
  );
};