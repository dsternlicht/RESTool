import React from 'react';
import { IPaginationState } from '../../common/models/states.model';
import { Button } from '../button/button.comp';

import './pagination.scss';

interface IProps {
  pagination: IPaginationState
  callbacks: {
    previousPage: () => void,
    nextPage: () => void,
  }
}

export const Pagination = ({ callbacks, pagination }: IProps) => {
  return (
    <div className="pagination-wrapper">
      <Button disabled={!pagination.hasPreviousPage} onClick={() => callbacks.previousPage()} title="Previous page">
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Button>
      <Button disabled={!pagination.hasNextPage} onClick={() => callbacks.nextPage()} title="Next page">
        <i className="fa fa-arrow-right" aria-hidden="true" ></i>
      </Button>
    </div>
  );
};