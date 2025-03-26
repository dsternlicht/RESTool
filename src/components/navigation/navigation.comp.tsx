import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { usePageTranslation } from '../../hooks/usePageTranslation';
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
  const { translate } = usePageTranslation();

  async function logout() {
    try {
      await authService.logout();
      setLoggedInUsername(null);
      toast.info(translate('auth.logoutSuccess'));
      replace('/login');
    } catch (error) {
      toast.error(translate('auth.logoutFailed'));
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
        <div className="app-nav-section">
          {!!translate('navigation.pages') && (
            <div className="app-nav-section-header">
              {translate('navigation.pages')}
            </div>
          )}
          <div className="app-nav-links">
            {
              (config?.pages || []).map((page, idx) => {
                const pageName = translate(`pages.${page.id}.title`) || page.id;
                return page?.customLink ?
                  <a href={page?.customLink} target="_blank" key={`page_${idx}`}>{pageName}</a> :
                  <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}
                    onClick={() => setIsOpened(false)}>{pageName}</NavLink>
              })
            }
          </div>
        </div>
        {!!loggedInUsername && (
          <div className="app-nav-section">
            {!!translate('navigation.userManagement') && (
              <div className="app-nav-section-header">
                {translate('navigation.userManagement')}
              </div>
            )}
            <div className="app-nav-logout">
              <NavLink to="/change-password" className="change-password-link">
                {translate('auth.changePassword')}
              </NavLink>
              <NavLink to="/login" onClick={logout} className="logout-link">
                {translate('auth.logout')} ({loggedInUsername})
              </NavLink>
            </div>
          </div>
        )}
        {!loggedInUsername && (
          <div className="app-nav-section" />
        )}
      </div>
    </nav>
  );
}

export const Navigation = withAppContext(NavigationComp);
