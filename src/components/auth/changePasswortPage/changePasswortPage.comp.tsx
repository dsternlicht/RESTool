import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { usePageTranslation } from '../../../hooks/usePageTranslation';
import { Button } from '../../button/button.comp';
import { notificationService } from '../../../services/notification.service';

import './changePasswortPage.scss';
import { withAppContext } from '../../withContext/withContext.comp';
import { NotificationBanner } from '../../notificationBanner/notificationBanner.comp';
import { IAppContext } from '../../app.context';

interface IProps {
  context: IAppContext
}

export const ChangePasswordPage = withAppContext(
  ({ context }: IProps) => {
    const history = useHistory();
    const location = useLocation();
    const [oldPwd, setOldPwd] = useState<string>('');
    const [newPwd, setNewPwd] = useState<string>('');
    const [confirmPwd, setConfirmPwd] = useState<string>('');
    const { authService } = context;
    const { translate } = usePageTranslation();

    // Show notification if coming from login page
    React.useEffect(() => {
      const params = new URLSearchParams(location.search);
      if (params.get('showPasswordMessage') === 'true') {
        notificationService.info(translate('auth.passwordChangeRequired'));
      }
    }, [location.search, translate, history]);

    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (newPwd !== confirmPwd) {
        notificationService.error(translate('auth.passwordMismatch'));
        return;
      }
      try {
        await authService.changePassword(oldPwd, newPwd);
        history.replace('/');
      } catch (error) {
        const errorMessage = translate('auth.passwordChangeFailed') + (error instanceof Error ? `: ${error.message}` : '');
        notificationService.error(errorMessage);
      }
    }

    function handleOldPwdChange(event: React.ChangeEvent<HTMLInputElement>) {
      setOldPwd(event.target.value);
    }

    function handleNewPwdChange(event: React.ChangeEvent<HTMLInputElement>) {
      setNewPwd(event.target.value);
    }

    function handleConfirmPwdChange(event: React.ChangeEvent<HTMLInputElement>) {
      setConfirmPwd(event.target.value);
    }

    return (
      <div className="change-pwd-page">
        {context.config?.notificationStyle === 'banner' && <NotificationBanner />}
        <form className='form-content' onSubmit={submitForm}>
          <div className='form-row row'>
            <label>{translate('auth.labels.oldPassword')}</label>
            <input 
              type="password" 
              placeholder={translate('auth.placeholders.oldPassword')}
              onChange={handleOldPwdChange} 
            />
          </div>
          <div className='form-row row'>
            <label>{translate('auth.labels.newPassword')}</label>
            <input 
              type="password" 
              placeholder={translate('auth.placeholders.newPassword')}
              onChange={handleNewPwdChange} 
            />
          </div>
          <div className='form-row row'>
            <label>{translate('auth.labels.confirmPassword')}</label>
            <input 
              type="password" 
              placeholder={translate('auth.placeholders.confirmPassword')}
              onChange={handleConfirmPwdChange} 
            />
          </div>
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">
              {translate('auth.changePassword')}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
