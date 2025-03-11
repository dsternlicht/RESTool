import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  async function logout() {
    try {
      await authService.logout();
      setLoggedInUsername(null);
      toast.info(t('auth.logoutSuccess'));
      replace('/login');
    } catch (error) {
      toast.error(t('auth.logoutFailed'));
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
              const pageName = t(`pages.${page.id}.title`) || page.name;
              return page?.customLink ?
                <a href={page?.customLink} target="_blank" key={`page_${idx}`}>{pageName}</a> :
                <NavLink to={`/${page.id || idx + 1}`} activeClassName="active" key={`page_${idx}`}
                  onClick={() => setIsOpened(false)}>{pageName}</NavLink>
            })
          }
        </div>
        {!!loggedInUsername && (
          <div className="app-nav-logout">
            <NavLink to="/change-password" className="change-password-link">
              {t('auth.changePassword')}
            </NavLink>
            <NavLink to="/login" onClick={logout} className="logout-link">
              {t('auth.logout')} ({loggedInUsername})
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export const Navigation = withAppContext(NavigationComp);
