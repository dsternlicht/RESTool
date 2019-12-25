import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import ConfigService from '../services/config.service';
import { IConfig, IConfigPage } from '../common/models/config.model';
import { Page } from '../components/page/page.comp';
import { Navigation } from '../components/navigation/navigation.comp';
import { AppContext } from './app.context';

import './app.scss';

function App() {
  const [config, setConfig] = useState<IConfig>(require('../config.json'));
  const [activePage, setActivePage] = useState<IConfigPage | null>(config?.pages[0] || null);
  const [error, setError] = useState<string | null>(null);

  async function loadRemoteConfig() {
    try {
      const remoteConfig = await ConfigService.getRemoteConfig(config.remoteUrl);
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
    }
  }, [config]);

  return (
    <div className="restool-app">
      <AppContext.Provider value={{ config, activePage, setActivePage }}>
        <Router>
          <aside>
            <h1>{config?.name || 'RESTool App'}</h1>
            {
              <Navigation />
            }
          </aside>
          <main>
            {
              error ?
              <p>{error}</p> :
              <Switch>
                <Route exact path="/:page" component={Page} />
                <Redirect path="/" to={`/${config?.pages[0]?.id || '1'}`} />
              </Switch>
            }
          </main>
        </Router>
      </AppContext.Provider>
    </div>
  );
}

export default App;
