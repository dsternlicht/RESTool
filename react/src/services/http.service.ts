class HttpService {

  async makeRequest(url: string, params: any = {}, responseType: 'json' | 'text' | 'boolean' = 'json') {
    const res: Response = await fetch(url, Object.assign({}, params, { credentials: 'include' }));
    
    if (res.ok) {
      switch (responseType) {
        case 'json':
          return await res.json();  
        case 'text':
          return await res.text();
        case 'boolean':
          return true;
        default:
          return true;
      }
    }

    throw new Error(`Response code: ${res.status}`);
  }

}

export default HttpService;