// RESTool.js
// A script for loading RESTool's most recent version dynamically.

(function restool() {
  const packageUrl = 'https://unpkg.com/restool';
  const origin = window.location.origin;

  async function fetchHtml() {
    const url = `${packageUrl}/build/index.html`;
    try {
      return await (await fetch(url)).text();
    } catch (e) {
      console.error('Could not load RESTool\'s html', e);
    }
  }

  function loadStyles(arr = []) {
    arr.forEach((styleElm) => {
      if (styleElm.href) {
        styleElm.href = styleElm.href.replace(origin, `${packageUrl}/build`);
      }

      document.querySelector('head').appendChild(styleElm);
    });
  }

  function loadScriptsRecursively(arr = [], idx = 0) {
    if (!arr[idx]) {
      return;
    }

    const scriptItem = arr[idx];
    const scriptElm = document.createElement('script');
    
    if (scriptItem.src) {
      scriptElm.src = scriptItem.src.replace(origin, `${packageUrl}/build`);
      scriptElm.onload = function() {
        loadScriptsRecursively(arr, idx + 1);
      };
    } else {
      scriptElm.innerHTML = scriptItem.innerHTML;
      loadScriptsRecursively(arr, idx + 1);
    }
    
    document.body.appendChild(scriptElm);
  }

  function createRootElm() {
    if (document.getElementById('root')) {
      return;
    }

    const rootElm = document.createElement('div');
    rootElm.id = 'root';
    document.body.appendChild(rootElm);
  }

  // Fetch latest html version
  // Read html, find all js and css files, extract path
  // Create root element if needed
  // Load relevant js and css files
  async function init() {
    const html = await fetchHtml();
    const tempElm = document.createElement('html');
    tempElm.innerHTML= html.replace(/href="./g, `href="${packageUrl}/build`).replace(/src="./g, `src="${packageUrl}/build`);
    
    const scripts = tempElm.querySelectorAll('script');
    const styles = tempElm.querySelectorAll('link[rel=stylesheet]');

    // Create root element if not exists
    createRootElm();

    // Load RESTool (most recent) styles
    loadStyles(styles);

    // Load RESTool (most recent) scripts
    loadScriptsRecursively(Array.apply(null, scripts));
  }

  init();

}());