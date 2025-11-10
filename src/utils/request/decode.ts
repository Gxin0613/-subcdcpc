export function decodeResponseParams(response: string) {
  try {
    response = response.replace('1=2', '');
    const obj: Recordable = {};
    const url = response.trim().replace('url@', '');
    const args = url.split('?');
    //获取到页面名称
    let pageName = args[0].substring(args[0].lastIndexOf('/') + 1) || '';
    pageName = pageName.replace('.htm', '').replace('.html', '');
    if (args.length < 2 || !args[1].trim()) {
      return { PageName: pageName };
    }
    obj['PageName'] = pageName;
    args[1].split('&').forEach((arg: string) => {
      const [key, val] = arg.split('=');
      obj[key] = val;
    });
    return obj;
  } catch (e) {
    return {};
  }
}

export const getCookie = (key: string) => {
  if (document.cookie === '') return '';
  const cookieMap = new Map();
  document.cookie.split(';').forEach((args) => {
    if (args.startsWith('CCS=') === true) {
      args
        .replace('CCS=', '')
        .split('&')
        .map((strs) => {
          const [key, val] = strs.split('=');
          cookieMap.set(key.trim(), val?.trim() || '');
        });
    } else {
      const [key, val] = args.split('=');
      cookieMap.set(key.trim(), val?.trim() || '');
    }
  });
  return cookieMap.get(key);
};

export function getRequestParams(key: string) {
  if (!window) {
    return '';
  }
  const str = window.location.href;
  if (!str.includes('?')) {
    return '';
  }
  const args = str.substring(1, str.length).split('?')[1].split('&');
  for (const arg of args) {
    const [k, v] = arg.split('=');
    if (k === key) return v;
  }
  return '';
}

export function getAllRequestParams(url: string) {
  if (!url.includes('?')) {
    return {};
  }
  const str = url.split('?')[1];
  if (!str) {
    return {};
  }
  const args = str.split('&');
  const requestParams: Record<string, any> = {};
  for (const arg of args) {
    const [k, v] = arg.split('=');
    requestParams[k] = v;
  }
  return requestParams;
}
