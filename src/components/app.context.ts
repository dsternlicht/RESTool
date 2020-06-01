import React from 'react';
import { IConfig, IConfigResource } from '../common/models/config.model';
import HttpService from '../services/http.service';

export interface IAppContext {
  config: IConfig | null
  detailPagesConfig: { resource: IConfigResource, route: string }[] | null
  activeResource: IConfigResource | null
  activeItem: any | null
  activePathVars: { [key: string]: string }
  error: string | null
  setError: (error: string | null) => void
  setActiveResource: (activeResource: IConfigResource | null) => void
  setActiveItem: (activeItem: any | null) => void
  setActivePathVars: (activePathVars: { [key: string]: string }) => void
  httpService: HttpService
}

export const AppContext = React.createContext<IAppContext>({
  config: null,
  detailPagesConfig: null,
  activeResource: null,
  activeItem: null,
  activePathVars: {},
  error: null,
  setError: () => { },
  setActiveResource: () => { },
  setActiveItem: () => { },
  setActivePathVars: () => { },
  httpService: new HttpService()
});