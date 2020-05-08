import React from 'react';
import { Button } from '../button/button.comp';

import './pagination.scss';

interface IProps {
  hasPreviousPage?: boolean,
  hasNextPage?: boolean,
  callbacks: {
    previousPage: () => void,
    nextPage: () => void,
  }
}

export const Pagination = ({ callbacks, hasNextPage, hasPreviousPage }: IProps) => {
  return (
    <div className="pagination-wrapper">
      <Button disabled={!hasPreviousPage} onClick={() => callbacks.previousPage()} title='Previous page'>
        <i className="fa fa-arrow-left" aria-hidden="true"></i>
      </Button>
      <Button disabled={!hasNextPage} onClick={() => callbacks.nextPage()} title='Next page'>
        <i className="fa fa-arrow-right" aria-hidden="true" ></i>
      </Button>
    </div>
  );
};