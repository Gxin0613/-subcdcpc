import { getAppEnvConfig } from '/@/utils/env';

declare global {
  interface Window {
    plant: string | undefined;
  }
}
const { VITE_GLOB_CCFLOW_HANDLER, VITE_GLOB_JFLOW_HANDLER, VITE_GLOB_PLATFORM } = getAppEnvConfig();
let REQUEST_URL: any = '';
if (typeof window.plant === 'string') {
  REQUEST_URL = window.plant.toLowerCase() === 'ccflow' ? VITE_GLOB_CCFLOW_HANDLER : VITE_GLOB_JFLOW_HANDLER;
} else {
  REQUEST_URL = VITE_GLOB_PLATFORM === 'CCFLOW' ? VITE_GLOB_CCFLOW_HANDLER : VITE_GLOB_JFLOW_HANDLER;
}

const RICH_TEXT_URL = `/DataUser/CCForm/BigNoteHtmlText`;
export { REQUEST_URL, RICH_TEXT_URL };
