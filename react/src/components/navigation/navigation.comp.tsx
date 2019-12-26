import React from 'react';
import { NavLink } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';

import './navigation.scss';

interface IProps {
  context: IAppContext
}

const NavigationComp = ({ context: { config } }: IProps) => {
  return (
    <nav className="app-nav">
      {
        (config?.pages || []).map((page, idx) => (
          <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}>{page.name}</NavLink>
        ))
      }
    </nav>
  );
}

export const Navigation = withAppContext(NavigationComp);