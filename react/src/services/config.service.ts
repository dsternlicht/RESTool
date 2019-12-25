import HTTPService from './http.service';

class ConfigService extends HTTPService {

  async getRemoteConfig(url: string) {
    return await this.makeRequest(url);
  }

}

export default new ConfigService();