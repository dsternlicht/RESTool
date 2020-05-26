
require('dotenv').config()
const fs = require("fs");
const path = require('path');



(function envLoader() {

  const NODE_ENV = process.env.NODE_ENV || "development";

  function writeEnvFile(env) {
    const basePath = fs.realpathSync(process.cwd());
    const destPath = "public/";
    const populate = `window._env = ${JSON.stringify(env)};`;
    fs.writeFileSync(`${basePath}/${destPath}env.js`, populate);
  }

  function getAppEnvironment() {
    return Object.keys(process.env)
      .filter(key => /^REACT_APP_/i.test(key))
      .reduce(
        (env, key) => {
          env[key] = process.env[key];
          return env;
        },
        { NODE_ENV: NODE_ENV }
      );
  }

  const env = getAppEnvironment();

  writeEnvFile(env)
  console.log("sdsd",path.resolve(process.cwd(),'devTools/env/index.js'))
  fs.copyFileSync(path.resolve(process.cwd(),'devTools/env/index.js'), path.resolve(process.cwd(),'src/env.js'));
  fs.copyFileSync(path.resolve(process.cwd(),'devTools/env/index.js'), path.resolve(process.cwd(),'server/env.js'));


}());