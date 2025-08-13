import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ConfigService from '../services/config.service';
import { notificationService } from '../services/notification.service';
import { IConfig, IConfigPage } from '../common/models/config.model';
import { Page } from '../components/page/page.comp';
import { Navigation } from '../components/navigation/navigation.comp';
import { AppContext } from './app.context';
import HttpService from '../services/http.service';
import { CustomStyles } from './customStyles/customStyles.comp';
import inTreeConfig from "../config";

import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { LoginPage } from './auth/loginPage/loginPage.comp';
import { ChangePasswordPage } from './auth/changePasswortPage/changePasswortPage.comp';
import AuthService from '../services/auth.service';
import { usePageTranslation } from '../hooks/usePageTranslation';
import { Header } from './header/header.comp';

const httpService = new HttpService();
const authService = new AuthService();
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
  const [activePage, setActivePage] = useState<IConfigPage | null>(config?.pages?.[0] || null);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);
  const { translate } = usePageTranslation();

  const appName: string = config?.name || defaultAppName;

  async function loadConfig(url?: string): Promise<void> {
    try {
      let itConfig = inTreeConfig();
      if (itConfig) (window as any).RESTool = { config: itConfig };
      const windowConfig = (window as any).RESTool?.config;
      let remoteConfig: IConfig;
      if (!url && windowConfig) {
        remoteConfig = Object.assign({}, windowConfig, {});
      } else {
        remoteConfig = url ? await ConfigService.getRemoteConfig(url) : await ConfigService.loadDefaultConfig();
      }

      notificationService.setMode(remoteConfig.notificationStyle !== 'banner');

      httpService.baseUrl = remoteConfig.baseUrl || '';
      httpService.errorMessageDataPath = remoteConfig.errorMessageDataPath || '';
      httpService.unauthorizedRedirectUrl = remoteConfig.unauthorizedRedirectUrl || '';
      httpService.requestHeaders = remoteConfig.requestHeaders || {};
      httpService.setUnauthorizedHandler({
        onUnauthorizedRequest: (currentPath) => {
          // Clear context before navigation
          setActivePage(null);

          if (httpService.unauthorizedRedirectUrl) {
            // Legacy flow takes precedence
            const redirectUrl = httpService.unauthorizedRedirectUrl.replace(':returnUrl', encodeURIComponent(currentPath));
            document.location.href = redirectUrl;
          } else if (!currentPath.startsWith('/login')) {
            document.location.href = `#/login?return=${encodeURIComponent(currentPath)}`;
          }
        }
      });
      
      authService.baseUrl = remoteConfig.baseUrl || '';
      if (remoteConfig.auth) {
        authService.loginEndpoint = remoteConfig.auth.loginEndpoint || '';
        authService.logoutEndpoint = remoteConfig.auth.logoutEndpoint || '';
        authService.userEndpoint = remoteConfig.auth.userEndpoint || '';
        authService.changePasswordEndpoint = remoteConfig.auth.changePasswordEndpoint || '';
      }
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
    loadConfig().then(() => {
      authService.getLoggedInUser().then((username) => {
        setLoggedInUsername(username);
      });
    });
  }, [loadConfig]);

  useEffect(() => {
    const { isValid, errorMessage } = ConfigService.validateConfig(config);

    if (!isValid && errorMessage) {
      setError(errorMessage);
      notificationService.error(errorMessage);
      return;
    }
  }, [config]);

  return (
    <div className="restool-app">
      {
        !config ?
          <div className="app-error">
             {firstLoad ? translate('configuration.loadingConfiguration') : translate('configuration.loadingConfigurationFailed')}
          
            </div> :
          <AppContext.Provider value={{ config, activePage, setActivePage, error, setError, httpService, authService, loggedInUsername, setLoggedInUsername }}>
            {
              config.customStyles &&
              <CustomStyles styles={config.customStyles} />
            }
            <Router>
              <Header />
              <div className="app-content">
                <aside>
                  <h1 title={appName} onClick={() => scrollToTop()}>{appName}</h1>
                  <Navigation />
                </aside>
                  <Switch>
                    <Route exact path='/login' component={LoginPage} />
                    <Route exact path='/change-password' component={ChangePasswordPage} />
                    <Route exact path="/:page" component={Page} />
                    <Redirect path="/" to={`/${config?.pages?.[0]?.id || '1'}`} />
                  </Switch>
              </div>
              {config.notificationStyle !== 'banner' && (
                <ToastContainer position={toast.POSITION.TOP_CENTER} autoClose={4000} draggable={false} />
              )}
            </Router>
          </AppContext.Provider>
      }
    </div>
  );
}

export default App;