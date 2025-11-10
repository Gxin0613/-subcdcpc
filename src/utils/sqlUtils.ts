const sqlPrefix = ['insert', 'update', 'delete', 'insert'];
const STATIC_PREFIX = 'uibind_code_';

// 加密SQL
export const encryptSQLStr = (str: string) => {
  const lowerCaseStr = str.trim().toLowerCase();
  const hasSQL = sqlPrefix.find((pf) => lowerCaseStr.startsWith(pf));
  if (hasSQL) {
    return STATIC_PREFIX + window.btoa(str);
  }
  return str;
};

// 解密SQL
export const decryptSQLStr = (str: string) => {
  const trimedStr = str.trim();
  if (trimedStr.startsWith(STATIC_PREFIX)) {
    const encryptStr = trimedStr.replace(STATIC_PREFIX, '');
    return window.atob(encryptStr);
  }
  return str;
};
