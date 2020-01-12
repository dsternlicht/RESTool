import React from 'react';
import { AppContext } from '../app.context';

export const withAppContext = (Component: any) => {
  return (props: any) => (
    <AppContext.Consumer>    
      {(context) => {
        return <Component {...props} context={context} />
      }}
    </AppContext.Consumer>
  );
};