import HTTPService from './http.service';
import { IConfig } from '../common/models/config.model';

const httpService: HTTPService = new HTTPService();

class ConfigService extends HTTPService {

  public async getRemoteConfig(url: string) {
    return await httpService.fetch({
      origUrl: url,
    });
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