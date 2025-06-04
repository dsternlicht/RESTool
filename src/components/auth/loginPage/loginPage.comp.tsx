import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { usePageTranslation } from '../../../hooks/usePageTranslation';
import { Button } from '../../button/button.comp';
import { toast } from 'react-toastify';

import './loginPage.scss';
import { withAppContext } from '../../withContext/withContext.comp';
import { IAppContext } from '../../app.context';

interface IProps {
  context: IAppContext
}

export const LoginPage = withAppContext(
  ({ context }: IProps) => {
    const history = useHistory();
    const location = useLocation();
    const { translate } = usePageTranslation();
    const queryParams = new URLSearchParams(location.search);
    const returnUrl = queryParams.get('return');
    const [user, setUser] = useState<string>('');
    const [pwd, setPwd] = useState<string>('');
    const { authService, setLoggedInUsername } = context;

    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      try {
        const { passwordChangeRequired } = await authService.login(user, pwd);
        setLoggedInUsername(user);
        if (passwordChangeRequired) {
          const passwordChangeMessage = translate('auth.passwordChangeRequired');
          if (passwordChangeMessage) {
            toast.info(passwordChangeMessage);
          }
          history.replace('/change-password');
          return;
        }
        // Only redirect if returnUrl exists and is not /login
        if (returnUrl && !returnUrl.startsWith('/login')) {
          history.replace(decodeURIComponent(returnUrl));
        } else {
          history.replace('/');
        }
      } catch (e) {
        const errorMessage = translate('auth.loginFailed') + (e instanceof Error ? `: ${e.message}` : '');
        toast.error(errorMessage);
        setPwd('');
        return;
      }
    }

    function handleUserChange(event: React.ChangeEvent<HTMLInputElement>) {
      setUser(event.target.value);
    }

    function handlePwdChange(event: React.ChangeEvent<HTMLInputElement>) {
      setPwd(event.target.value);
    }

    return (
      <div className="auth-page">
        <form className='form-content' onSubmit={submitForm}>
          <div className='form-row row'>
            <label>{translate('auth.labels.user')}</label>
            <input 
              type="text" 
              placeholder={translate('auth.placeholders.user')}
              value={user} 
              onChange={handleUserChange} 
            />
          </div>
          <div className='form-row row'>
            <label>{translate('auth.labels.password')}</label>
            <input 
              type="password" 
              placeholder={translate('auth.placeholders.password')}
              value={pwd} 
              onChange={handlePwdChange} 
            />
          </div>
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">
              {translate('auth.login')}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
