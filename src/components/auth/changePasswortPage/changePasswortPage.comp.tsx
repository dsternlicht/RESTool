import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../button/button.comp';
import { toast } from 'react-toastify';

import './changePasswortPage.scss';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';

interface IProps {
  context: IAppContext
}

export const ChangePasswordPage = withAppContext(
  ({ context }: IProps) => {
    const { replace } = useHistory();
    const [oldPwd, setOldPwd] = useState<string>('');
    const [newPwd, setNewPwd] = useState<string>('');
    const [confirmPwd, setConfirmPwd] = useState<string>('');
    const { authService, } = context;

    async function submitForm(e: any) {
      e.preventDefault();
      if (newPwd !== confirmPwd) {
        toast.error('Confirmed password does not match');
        return;
      }
      try {
        await authService.changePassword(oldPwd, newPwd);
        toast.success('Password changed successfully');
        replace('/');
      } catch (error) {
        toast.error('Password change failed');
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
            <label>Old Password</label>
            <input type="password" placeholder='Enter old password...' onChange={handleOldPwdChange} />
          </div>
          <div className='form-row row'>
            <label>New Password</label>
            <input type="password" placeholder='Enter new password...' onChange={handleNewPwdChange} />
          </div>
          <div className='form-row row'>
            <label>Confirm New Password</label>
            <input type="password" placeholder='Confirm new password...' onChange={handleConfirmPwdChange} />
          </div>
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">Submit</Button>
          </div>
        </form>
      </div>
    );
  }
);