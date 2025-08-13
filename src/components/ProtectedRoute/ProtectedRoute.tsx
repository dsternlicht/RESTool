import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';

interface IProps {
  children: React.ReactNode;
  context: IAppContext;
  authChecked: boolean;
  requiresAuth: boolean;
}

const ProtectedRouteComponent = ({ children, context, authChecked, requiresAuth }: IProps) => {
  const location = useLocation();
  const { loggedInUsername } = context;

  // If auth is not required, allow access
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="app-error">
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!loggedInUsername) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Redirect to={`/login?return=${returnUrl}`} />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export const ProtectedRoute = withAppContext(ProtectedRouteComponent);