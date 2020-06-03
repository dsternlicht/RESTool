import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ConfigService from '../services/config.service';
import { IConfig, IConfigResource } from '../common/models/config.model';
import { Page } from '../components/page/page.comp';
import { DetailPage } from './detailPage/detailPage.comp';
import { Navigation } from '../components/navigation/navigation.comp';
import { AppContext } from './app.context';
import HttpService from '../services/http.service';
import { CustomStyles } from './customStyles/customStyles.comp';
import { routesHelpers } from '../helpers/routes.helpers';

import './app.scss';
import 'react-toastify/dist/ReactToastify.css';

const httpService = new HttpService();
const defaultAppName: string = 'RESTool App';

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
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [config, setConfig] = useState<IConfig | null>(null);
  const [activeResource, setActiveResource] = useState<IConfigResource | null>(config?.resources?.[0] || config?.pages?.[0] || null);
  const [activePathVars, setActivePathVars] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const appName: string = config?.name || defaultAppName;

  async function loadConfig(url?: string): Promise<void> {
    try {
      const windowConfig = (window as any).RESTool?.config;
      let remoteConfig: IConfig;
      // Try to load config from window object first
      if (!url && windowConfig) {
        remoteConfig = Object.assign({}, windowConfig, {});
      } else {
        remoteConfig = url ? await ConfigService.getRemoteConfig(url) : await ConfigService.loadDefaultConfig();
      }

      if (remoteConfig.pages && remoteConfig.resources) {
        throw new Error('Configuration is invalid, use either resources or pages (deprecated), not both');
      }

      if (remoteConfig.pages) {
        remoteConfig.resources = remoteConfig.pages;
      }

      // Setting global config for httpService
      httpService.baseUrl = remoteConfig.baseUrl || '';
      httpService.errorMessageDataPath = remoteConfig.errorMessageDataPath || '';
      httpService.unauthorizedRedirectUrl = remoteConfig.unauthorizedRedirectUrl || '';
      httpService.requestHeaders = remoteConfig.requestHeaders || {};
      document.title = remoteConfig.name || defaultAppName;

      if (remoteConfig?.favicon) {
        changeFavicon(remoteConfig.favicon);
      }

      if (remoteConfig?.remoteUrl) {
        return await loadConfig(remoteConfig.remoteUrl);
      }
      setConfig(remoteConfig);
    } catch (e) {
      console.error('Could not load config file', e);
    }

    setFirstLoad(false);
  }

  function scrollToTop(scrollDuration: number = 250) {
    var cosParameter = window.scrollY / 2,
      scrollCount = 0,
      oldTimestamp = performance.now();

    function step(newTimestamp: number) {
      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));

      if (scrollCount >= Math.PI) {
        window.scrollTo(0, 0);
      }

      if (window.scrollY === 0) {
        return;
      }

      window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)));
      oldTimestamp = newTimestamp;
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { isValid, errorMessage } = ConfigService.validateConfig(config);

    if (!isValid) {
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
  }, [config]);

  const detailPagesConfig = routesHelpers.detailRoutesConfig(config?.resources);

  const resourceRoutes: string[] = config?.resources?.map(p => `/${p.id}`) || [];
  const detailRoutes: string[] = detailPagesConfig.map(conf => conf.route);
  const subResourceRoutes: string[] = routesHelpers.subResourceRoutes(config?.resources);

  return (
    <div className="restool-app">
      {
        !config ?
          <div className="app-error">
            {firstLoad ? 'Loading Configuration...' : 'Could not find config file.'}
          </div> :
          <AppContext.Provider value={{ config, detailPagesConfig, activeResource, setActiveResource, activePathVars, setActivePathVars, activeItem, setActiveItem, error, setError, httpService }}>
            {
              config.customStyles &&
              <CustomStyles
                styles={config.customStyles}
              />
            }
            <Router>
              <aside>
                <h1 title={appName} onClick={() => scrollToTop()}>{appName}</h1>
                {
                  <Navigation />
                }
              </aside>
              {
                config &&
                <Switch>
                  <Route exact path={detailRoutes} component={DetailPage} />
                  <Route exact path={resourceRoutes} component={Page} />
                  <Route exact path={subResourceRoutes} component={Page} />
                  <Redirect path="/" to={`/${config?.resources?.[0]?.id || '1'}`} />
                </Switch>
              }
              <ToastContainer
                position={toast.POSITION.TOP_CENTER}
                autoClose={4000}
                draggable={false}
              />
            </Router>
          </AppContext.Provider>
      }
    </div>
  );
}

export default App;
