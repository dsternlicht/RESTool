import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../button/button.comp';
import { toast } from 'react-toastify';

import './loginPage.scss';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';

interface IProps {
  context: IAppContext
}

export const LoginPage = withAppContext(
  ({ context }: IProps) => {
    const { replace } = useHistory();
    const [user, setUser] = useState<string>('');
    const [pwd, setPwd] = useState<string>('');
    const { authService, setLoggedInUsername } = context;

    async function submitForm(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      try {
        const { passwordChangeRequired } = await authService.login(user, pwd);
        setLoggedInUsername(user);
        if (passwordChangeRequired) {
          toast.info('Password change required');
          replace('/change-password');
          return;
        }
        replace('/');
      } catch (error) {
        toast.error('Login failed');
        console.error(error);
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
            <label>User</label>
            <input type="text" placeholder='Enter user....' value={user} onChange={handleUserChange} />
          </div>
          <div className='form-row row'>
            <label>Password</label>
            <input type="password" placeholder='Enter password...' value={pwd} onChange={handlePwdChange} />
          </div>
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">Submit</Button>
          </div>
        </form>
      </div>
    );
  }
);