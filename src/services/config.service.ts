import HTTPService from './http.service';
import { IConfig } from '../common/models/config.model';

const httpService: HTTPService = new HTTPService();

class ConfigService extends HTTPService {

  public async getRemoteConfig(url: string) {
    if (url.endsWith('.js')) {
      return await import(/* webpackIgnore: true */url);
    }
    return await httpService.fetch({
      origUrl: url,
    });
  }

  public async loadDefaultConfig() {
    try {
      return await this.getRemoteConfig('/config.json');
    } catch (e) {
      return (await this.getRemoteConfig('/config.js')).default;
    }
  }

  public validateConfig(config: IConfig | null): { isValid: boolean, errorMessage: string | null } {
    // TODO: Validate mandatory fields in config file
    return {
      isValid: true,
      errorMessage: null
    };
  }

}

export default new ConfigService();
