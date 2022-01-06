import { IConfig } from "../common/models/config.model";

// // To use an internal configuration file, return an IConfig object.
// import configSample from "./config-sample";
// function config() : IConfig {
//   return configSample;
// }

// Otherwise, return undefined
function config() : IConfig | undefined {
  return undefined;
}

export default config;
