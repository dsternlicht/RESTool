import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';
import { Button } from '../button/button.comp';

import './navigation.scss';

interface IProps {
  context: IAppContext
}

const NavigationComp = ({ context: { config } }: IProps) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  return (
    <nav className="app-nav">
      <Button className="app-nav-opener" onClick={() => setIsOpened(!isOpened)}>
        {
          isOpened ? 
          <i className="fa fa-times" aria-hidden="true"></i> : 
          <i className="fa fa-bars" aria-hidden="true"></i>
        }
      </Button>

      <div className={`app-nav-wrapper ${isOpened ? 'opened' : ''}`}>
        <div className="app-nav-links">
          {
            (config?.pages || []).map((page, idx) => (
              <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`} onClick={() => setIsOpened(false)}>{page.name}</NavLink>
            ))
          }
        </div>
      </div>
    </nav>
  );
}

export const Navigation = withAppContext(NavigationComp);