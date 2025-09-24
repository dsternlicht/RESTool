import HTTPService from './http.service';
import { IConfig } from '../common/models/config.model';
import Ajv from 'ajv';
import configSchema from '../assets/schemas/config.schema.json';

const httpService: HTTPService = new HTTPService();

class ConfigService extends HTTPService {

  public async getRemoteConfig(url: string) {
    if (url.endsWith('.js')) {
      // For .js files from public directory, load via script tag
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          try {
            const config = (window as any).config;
            if (config) {
              resolve(config);
            } else {
              reject(new Error(`Config not found in ${url}. Make sure the file sets window.config.`));
            }
          } catch (e) {
            reject(e);
          }
          document.head.removeChild(script);
        };
        script.onerror = () => {
          document.head.removeChild(script);
          reject(new Error(`Failed to load config from ${url}`));
        };
        document.head.appendChild(script);
      });
    }
    return await httpService.fetch({
      origUrl: url,
    });
  }

  public async loadDefaultConfig() {
    try {
      // Try loading config.json from public root
      return await httpService.fetch({
        origUrl: '/config.json',
      });
    } catch (e) {
      // Fallback to config.js from public directory
      return await this.getRemoteConfig('/config.js');
    }
  }

  public validateConfig(config: IConfig | null): { isValid: boolean, errorMessage: string | null } {
    if (config === null) {
      return {
        isValid: true,
        errorMessage: null,
      }
    }
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
    });
    const validate = ajv.compile(configSchema);
    const isValid = validate(config);
    if (typeof isValid !== 'boolean') {
      throw new Error('Unexpected asynchronous JSON validation');
    }
    if (isValid) {
      return {
        isValid,
        errorMessage: null,
      }
    }
    const firstError = validate.errors ? validate.errors[0] : undefined;
    let errorMessage: string | null = null;
    if (firstError?.message && firstError?.dataPath) {
      errorMessage = `Error parsing configuration at "${firstError.dataPath}": ${firstError.message}`
    } else if (firstError?.message) {
      errorMessage = `Error parsing configuration: ${firstError.message}`
    } else if (firstError?.dataPath) {
      errorMessage = `Error parsing configuration at "${firstError.dataPath}"`
    } else {
      errorMessage = `Error parsing configuration`;
    }
    console.error(errorMessage);
    console.error('All configuration errors: ', validate.errors);
    return {
      isValid,
      errorMessage,
    };
  }

}

export default new ConfigService();
