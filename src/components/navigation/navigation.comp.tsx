import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';
import { Button } from '../button/button.comp';

import './navigation.scss';
import Accordion from '../accordion/accordion.comp';

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

              <Accordion
                allowMultipleOpen={false}
              >
              <div data-label="Alligator Mississippiensis">
                <NavLink to={`/as`} activeClassName="active" key={`page_2`} onClick={() => setIsOpened(false)}>Photoshop</NavLink>
                <NavLink to={`/as2`} activeClassName="active" key={`page_3`} onClick={() => setIsOpened(false)}>Photoshop2</NavLink>
              </div>
              <div data-label="Alligator Sinensis">
                <NavLink to={`/as3`} activeClassName="active" key={`page_2`} onClick={() => setIsOpened(false)}>Photoshop3</NavLink>
                <NavLink to={`/as4`} activeClassName="active" key={`page_3`} onClick={() => setIsOpened(false)}>Photoshop4</NavLink>
              </div>
      </Accordion>
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