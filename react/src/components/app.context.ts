import React from 'react';
import { IConfig } from '../common/models/config.model';

export interface IAppContext {
  config: IConfig | null
}

export const AppContext = React.createContext<IAppContext>({
  config: null
});