import React from 'react';
import { IConfig, IConfigResource } from '../common/models/config.model';
import HttpService from '../services/http.service';

export interface IAppContext {
  config: IConfig | null
  detailPagesConfig: { resource: IConfigResource, route: string }[] | null
  activePage: IConfigResource | null
  activeItem: any | null
  activePathVars: {[key: string]: string}
  error: string | null
  setError: (error: string | null) => void
  setActivePage: (activePage: IConfigResource | null) => void
  setActiveItem: (activeItem: any | null) => void
  setActivePathVars: (activePathVars: {[key: string]: string}) => void
  httpService: HttpService
}

export const AppContext = React.createContext<IAppContext>({
  config: null,
  detailPagesConfig: null,
  activePage: null,
  activeItem: null,
  activePathVars: {},
  error: null,
  setError: () => {},
  setActivePage: () => {},
  setActiveItem: () => {},
  setActivePathVars: () => {},
  httpService: new HttpService()
});