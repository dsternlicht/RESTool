import React from 'react';
import { IConfig, IConfigPage } from '../common/models/config.model';

export interface IAppContext {
  config: IConfig | null
  activePage: IConfigPage | null
  setActivePage: (activePage: IConfigPage | null) => void
}

export const AppContext = React.createContext<IAppContext>({
  config: null,
  activePage: null,
  setActivePage: () => {}
});