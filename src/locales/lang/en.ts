import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/en_US';
import dayjsLocale from 'dayjs/locale/en';

const modules = import.meta.glob('./en/**/*.ts', { eager: true });
export default {
  message: {
    ...genMessage(modules as any, 'en'),
    antdLocale,
  },
  localeObj: dayjsLocale,
  localeName: 'en',
};
