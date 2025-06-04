import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { usePageTranslation } from '../../../hooks/usePageTranslation';
import { Button } from '../../button/button.comp';
import { toast } from 'react-toastify';

import './changePasswortPage.scss';
import { withAppContext } from '../../withContext/withContext.comp';
import { IAppContext } from '../../app.context';

interface IProps {
  context: IAppContext
}

export const ChangePasswordPage = withAppContext(
  ({ context }: IProps) => {
    const { replace } = useHistory();
    const [oldPwd, setOldPwd] = useState<string>('');
    const [newPwd, setNewPwd] = useState<string>('');
    const [confirmPwd, setConfirmPwd] = useState<string>('');
    const { authService } = context;
    const { translate } = usePageTranslation();

    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (newPwd !== confirmPwd) {
        toast.error(translate('auth.passwordMismatch'));
        return;
      }
      try {
        await authService.changePassword(oldPwd, newPwd);
        const successMessage = translate('auth.passwordChangeSuccess');
        if (successMessage) {
          toast.success(successMessage);
        }
        replace('/');
      } catch (e) {
          const errorMessage = translate('auth.passwordChangeFailed') + (e instanceof Error ? `: ${e.message}` : '');
          toast.error(errorMessage);
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
        <h3>{translate('auth.changePasswordHeading')}</h3>
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
