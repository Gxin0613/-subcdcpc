// 将AtPara 参数解析为Map
export function decodeExtraParams(AtPara: string) {
  const params = new Map();
  if (!AtPara) return params;
  if (AtPara.startsWith('@')) {
    const tempArr = splitAtString(AtPara);
    tempArr.forEach((temp: string) => {
      const strs = temp.split('=');
      if (strs.length > 2) {
        params.set(strs[0], temp.replace(strs[0] + '=', ''));
      } else {
        params.set(strs[0], strs[1]);
      }
    });
  }
  return params;
}

// 处理包含@符号的字符串
export function splitAtString(str: string) {
  str = str.trim();
  const firstSymbolIndex = str.indexOf('@');
  if (firstSymbolIndex < 0) {
    return [str];
  }
  return str
    .substring(firstSymbolIndex + 1)
    .split('@')
    .filter((item) => item !== '' && item != 'null' && item != '"null"')
    .map((item) => {
      return item.replace(/%40/g, '@');
    });
}
