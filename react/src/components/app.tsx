import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import ConfigService from '../services/config.service';
import { IConfig, IConfigPage } from '../common/models/config.model';
import { Page } from '../components/page/page.comp';
import { Navigation } from '../components/navigation/navigation.comp';
import { AppContext } from './app.context';
import HttpService from '../services/http.service';

import './app.scss';

// Load local config json file
const configFile = require('../config.json');
const httpService = new HttpService();

// Setting global config for httpService
httpService.baseUrl = configFile.baseUrl || '';
httpService.errorMessageDataPath = configFile.errorMessageDataPath || '';
httpService.unauthorizedRedirectUrl = configFile.unauthorizedRedirectUrl || '';
document.title = configFile.name || 'RESTool App';
if (configFile.favicon) {
  changeFavicon(configFile.favicon);
}

function changeFavicon(src: string) {
  const link = document.createElement('link');
  const oldLink = document.getElementById('favicon');
  link.id = 'favicon';
  link.rel = 'shortcut icon';
  link.href = src;
  if (oldLink) {
   document.head.removeChild(oldLink);
  }
  document.head.appendChild(link);
 }

function App() {
  const [config, setConfig] = useState<IConfig>(configFile);
  const [activePage, setActivePage] = useState<IConfigPage | null>(config?.pages?.[0] || null);
  const [error, setError] = useState<string | null>(null);

  async function loadRemoteConfig() {
    try {
      const remoteConfig: IConfig = await ConfigService.getRemoteConfig(config.remoteUrl);
      
      // Setting global config for httpService
      httpService.baseUrl = remoteConfig.baseUrl || '';
      httpService.errorMessageDataPath = remoteConfig.errorMessageDataPath || '';
      httpService.unauthorizedRedirectUrl = remoteConfig.unauthorizedRedirectUrl || '';
      
      document.title = remoteConfig.name || 'RESTool App';

      if (configFile.favicon) {
        changeFavicon(configFile.favicon);
      }

      setConfig(remoteConfig);
    } catch (e) {
      console.error('Could not load config file', e);
    }
  }

  useEffect(() => {
    if (!config) {
      return;
    }

    if (config.remoteUrl) {
      loadRemoteConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { isValid, errorMessage } = ConfigService.validateConfig(config);
    if (!isValid) {
      setError(errorMessage);
      return;
    }
  }, [config]);

  return (
    <div className="restool-app">
      <AppContext.Provider value={{ config, activePage, setActivePage, error, setError, httpService }}>
        <Router>
          <aside>
            <h1>{config?.name || 'RESTool App'}</h1>
            {
              <Navigation />
            }
          </aside>
          {
            config &&
            <Switch>
              <Route exact path="/:page" component={Page} />
              <Redirect path="/" to={`/${config?.pages?.[0]?.id || '1'}`} />
            </Switch>
          }
        </Router>
      </AppContext.Provider>
    </div>
  );
}

export default App;
