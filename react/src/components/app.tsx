import React, { useEffect, useState } from 'react';

import ConfigService from '../services/config.service';


function App() {
  const [config, setConfig] = useState<any>(require('../config.json'));

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

  return (
    <div className="app">
      Hey React RESTool!
    </div>
  );
}

export default App;
