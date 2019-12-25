import React from 'react';
import { AppContext } from '../app.context';
import { NavLink } from 'react-router-dom';

import './navigation.scss';

export const Navigation = () => {
  return (
    <nav className="app-nav">
      <AppContext.Consumer>
        {
          ({ config }) => {
            return (
              (config?.pages || []).map((page, idx) => (
                <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}>{page.name}</NavLink>
              ))
            )
          }
        }
      </AppContext.Consumer>
    </nav>
  );
}