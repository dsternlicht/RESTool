import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { IConfigPage } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';

import './page.scss';

interface IProps {
  context: IAppContext
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  const { activePage } = context;

  useEffect(() => {
    const nextActivePage: IConfigPage | null = context?.config?.pages?.filter((p, pIdx) => p.id === page || (pIdx + 1) === parseInt(page || ''))[0] || null;
    context.setActivePage(nextActivePage);
  }, [page]);

  // context.setActivePage();
  return (
    <div className="app-page">
      <div className="app-page-header">
        <hgroup>
          <h2>{activePage?.name}</h2>
          {
            activePage?.description &&
            <h4>{activePage?.description}</h4>
          }
        </hgroup>
      </div>
    </div>
  );
}

export const Page = withAppContext(PageComp);