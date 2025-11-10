import { getAppEnvConfig } from '/@/utils/env';

export function appTitleHelper(doc, target = '驰骋') {
  if (typeof doc !== 'string') {
    return '';
  }
  const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
  return doc.replace(new RegExp(target, 'g'), VITE_GLOB_SX_TITLE);
}
