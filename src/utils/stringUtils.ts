export function handleNoNameField(data: Recordable[]) {
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    const sourceKeys = Object.keys(firstItem);
    for (const key of sourceKeys) {
      if (key.toLocaleLowerCase() === 'no' && key !== 'No') {
        for (const item of data) {
          item['No'] = item[key];
        }
      } else if (key.toLocaleLowerCase() === 'name' && key !== 'Name') {
        for (const item of data) {
          item['Name'] = item[key];
        }
      }
    }
  }
  return data;
}

export const getAtStrValByKey = (str, key) => {
  const regex = new RegExp(`@${key}=([^@]+)`);
  const match = str.match(regex);
  return match ? match[1] : null;
};

//是否为数值型
export const isConvertibleToNumber = (value: unknown) => {
  const num = Number(value);
  return !isNaN(num);
};

/**
 * 前端通用引号替换工具函数
 * 功能：处理被双引号包裹的字符串，将内部双引号替换为^，单引号替换为~
 * @param {string} str - 输入的字符串，需被双引号包裹
 * @returns {string} 处理后的字符串，保持外部双引号，内部引号已替换
 */
export const replaceSpecialQuotes = (str) => {
  // 非字符串类型直接返回
  if (typeof str !== 'string') {
    return str;
  }
  const replacedContent = str
    .replace(/"/g, '^') // 双引号替换
    .replace(/'/g, '~'); // 单引号替换
  // 重新包裹双引号并返回
  return replacedContent;
};

/**
 * 恢复特殊引号工具函数
 * 功能：将双引号内的^恢复为双引号，~恢复为单引号
 * 与replaceSpecialQuotes函数功能相反
 */
export const restoreSpecialQuotes = (str) => {
  // 非字符串类型直接返回
  if (typeof str !== 'string') {
    return str;
  }
  // 将^恢复为双引号，~恢复为单引号
  const restoredContent = str
    .replace(/\^/g, '"') // ^ → "
    .replace(/~/g, "'"); // ~ → '
  return restoredContent;
};
