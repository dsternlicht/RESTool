import React from 'react';
import { IConfig, IConfigPage } from '../common/models/config.model';
import HttpService from '../services/http.service';

export interface IAppContext {
  config: IConfig | null
  activePage: IConfigPage | null
  error: string | null
  setError: (error: string | null) => void
  setActivePage: (activePage: IConfigPage | null) => void
  httpService: HttpService
}

export const AppContext = React.createContext<IAppContext>({
  config: null,
  activePage: null,
  error: null,
  setError: () => {},
  setActivePage: () => {},
  httpService: new HttpService()
});