// 生成where参数
export function createWhereArgs(queryArgs: string[]) {
  let str = '';
  if (queryArgs.length < 2) {
    return '';
  }
  if (queryArgs.length % 2 === 1) {
    for (let i = 0; i < queryArgs.length - 1; i += 2) {
      const val = queryArgs[i + 1];
      if (!!val) {
        str += `@${queryArgs[i]}=${val.toString().replace('@', '~')}`;
      } else str += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    str += `@orderBy=${queryArgs[queryArgs.length - 1]}`;
    return str;
  }
  for (let i = 0; i < queryArgs.length; i += 2) {
    const val = queryArgs[i + 1];
    if (!!val) {
      str += `@${queryArgs[i]}=${val.toString().replace('@', '~')}`;
    } else str += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
  }
  return str;
}
