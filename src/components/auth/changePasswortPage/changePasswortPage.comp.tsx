import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    async function submitForm(e: any) {
      e.preventDefault();
      if (newPwd !== confirmPwd) {
        toast.error(t('auth.passwordMismatch'));
        return;
      }
      try {
        await authService.changePassword(oldPwd, newPwd);
        toast.success(t('auth.passwordChanged'));
        replace('/');
      } catch (error) {
        toast.error(t('auth.passwordChangeFailed'));
      }
    }

    function handleOldPwdChange(event: any) {
      setOldPwd(event.target.value);
    }

    function handleNewPwdChange(event: any) {
      setNewPwd(event.target.value);
    }

    function handleConfirmPwdChange(event: any) {
      setConfirmPwd(event.target.value);
    }

    return (
      <div className="change-pwd-page">
        <form className='form-content' onSubmit={submitForm}>
          <div className='form-row row'>
            <label>{t('auth.labels.oldPassword')}</label>
            <input 
              type="password" 
              placeholder={t('placeholders.oldPassword')}
              onChange={handleOldPwdChange} 
            />
          </div>
          <div className='form-row row'>
            <label>{t('auth.labels.newPassword')}</label>
            <input 
              type="password" 
              placeholder={t('placeholders.newPassword')}
              onChange={handleNewPwdChange} 
            />
          </div>
          <div className='form-row row'>
            <label>{t('auth.labels.confirmPassword')}</label>
            <input 
              type="password" 
              placeholder={t('placeholders.confirmPassword')}
              onChange={handleConfirmPwdChange} 
            />
          </div>
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">
              {t('buttons.submit')}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);