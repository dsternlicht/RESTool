declare global {
    interface Window {
        _env:any;
    }
}

function isBrowser() {
  return !!(typeof window !== "undefined" && window._env)
}

export default (key:String = "") => {
 if (isBrowser()) {
    if(key === "NODE_ENV")
        return window._env.NODE_ENV;
    const safeKey = `REACT_APP_${key}`;
    return key.length ? window._env[safeKey] : window._env;
  }
}