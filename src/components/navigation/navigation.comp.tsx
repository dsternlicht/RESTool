import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';
import { Button } from '../button/button.comp';
import { toast } from 'react-toastify';

import './navigation.scss';

interface IProps {
  context: IAppContext
}

const NavigationComp = ({ context: { config, authService, loggedInUsername, setLoggedInUsername } }: IProps) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const { replace } = useHistory();

  async function logout() {
    try {
      await authService.logout();
      setLoggedInUsername(null);
      toast.info('Logged out successfully');
      replace('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  }

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
            (config?.pages || []).map((page, idx) => {
              return page?.customLink ?
                <a href={page?.customLink} target="_blank" key={`page_${idx}`}>{page.name}</a> :
                <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}
                  onClick={() => setIsOpened(false)}>{page.name}</NavLink>
            })
          }
        </div>
        {!!loggedInUsername && (
          <div className="app-nav-logout">
            <NavLink to="/login" onClick={logout} className="logout-link">Logout
              ({loggedInUsername})
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export const Navigation = withAppContext(NavigationComp);