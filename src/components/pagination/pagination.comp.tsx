import React from 'react';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import { ICustomLabels } from '../../common/models/config.model';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';
import { IPaginationState } from '../../common/models/states.model';
import { Button } from '../button/button.comp';

import './pagination.scss';

interface IProps {
  context: IAppContext;
  pagination: IPaginationState;
  callbacks: {
    previousPage: () => void;
    nextPage: () => void;
  };
  customLabels?: ICustomLabels;
}

const PaginationComp = ({ context, callbacks, pagination, customLabels }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);
  const previousTitle = customLabels?.pagination?.previousPageTitle || translatePage('pagination.previousPage');
  const nextTitle = customLabels?.pagination?.nextPageTitle || translatePage('pagination.nextPage');

  return (
    <div className="pagination-wrapper">
      <Button 
        disabled={!pagination.hasPreviousPage} 
        onClick={() => callbacks.previousPage()} 
        title={previousTitle}
      >
        <i className="fa fa-arrow-left" aria-hidden="true" />
      </Button>
      <Button 
        disabled={!pagination.hasNextPage} 
        onClick={() => callbacks.nextPage()} 
        title={nextTitle}
      >
        <i className="fa fa-arrow-right" aria-hidden="true" />
      </Button>
    </div>
  );
};

export const Pagination = withAppContext(PaginationComp);
