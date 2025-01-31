//팝업창을 띄우고, 콜백을 실행하는 모듈
//사용법
//popupManager.open({
//  url: '팝업창에 띄울 페이지 주소',
//  name: '팝업창 이름',
//  type: 'GET' or 'POST',
//  popupFeatures: {width: 50, height: 50},
//  params: {팝업창에 전달할 파라미터},
//  callbacks: {
//    콜백함수 이름: function ({request, response}) {
//      //콜백 실행 내용
//    }
//  }
//});
//popupManager.runCallback('팝업창 이름', '팝업창에서 전달받은 데이터', '콜백함수 이름');
//팝업창에서는 window.opener.popupManager.runCallback('팝업창 이름', '팝업창에서 전달받은 데이터', '콜백함수 이름'); 을 통해 콜백을 실행할 수 있음

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
