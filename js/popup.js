window.popupManager = (function () {
  const paramMap = new Map();
  const callbacksMap = new Map();
  return {
    open({
           url,
           name,
           type = 'POST',
           popupFeatures = {width: 50, height: 50},
           params = {},
           callbacks = null,
         }) {
      paramMap.set(name, params);

      const windowFeatures = Object.entries(popupFeatures)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

      if (typeof callbacks === 'function') {
        callbacksMap.set(name, {default: callbacks});
      } else if (callbacks && typeof callbacks === 'object') {
        callbacksMap.set(name, callbacks);
      }

      if (type.toUpperCase() === 'POST') {
        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', url);
        form.setAttribute('target', name);
        form.setAttribute('style', 'display: none');
        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', key);
          input.setAttribute('value', value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else if (type.toUpperCase() === 'GET') {
        if (url.includes('?')) {
          url += '&' + Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        } else {
          url += '?' + Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        }
        window.open(url, name, windowFeatures);
      }
    },
    runCallback(name, data, callbackId = 'default') {
      const callback = callbacksMap.get(name);
      if (callback && callback[callbackId]) {
        callback[callbackId]({request: paramMap.get(name), response: data});
      }
    }
  };
})();
