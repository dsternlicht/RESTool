import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import { IAppContext } from '../app.context';
import { withAppContext } from '../withContext/withContext.comp';
import { Button } from '../button/button.comp';
import { notificationService } from '../../services/notification.service';

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
      replace('/login');
    } catch (e) {
      const errorMessage = translate('auth.logoutFailed') + (e instanceof Error ? `: ${e.message}` : '');
      notificationService.error(errorMessage);
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
                const icon = page.icon ? <i className={`fa fa-${page.icon}`} aria-hidden="true"></i> : null;

                return page?.customLink ?
                  <a href={page?.customLink} target="_blank" key={`page_${idx}`} className={`app-nav-link app-nav-link-${page.id}`}>
                    {icon}
                    <span className="nav-item-text">
                  {pageName}
                </span>
                  </a> :
                  <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}
                    className={`app-nav-link app-nav-link-${page.id}`}
                  onClick={() => setIsOpened(false)}>
                    {icon}
                    <span className="nav-item-text">{pageName}</span>
                  </NavLink>
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
              <NavLink to="/change-password" className="app-nav-link app-nav-link-change-password">
                {config?.auth?.icons?.changePassword && (
                  <i className={`fa fa-${config.auth.icons.changePassword}`} aria-hidden="true"></i>
                )}{' '}
                {translate('auth.changePassword')}
              </NavLink>
              <NavLink to="/login" onClick={logout} className="app-nav-link app-nav-link-logout">
                {config?.auth?.icons?.logout && (
                  <i className={`fa fa-${config.auth.icons.logout}`} aria-hidden="true"></i>
                )}{' '}
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
