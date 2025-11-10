import type { App } from 'vue';
import type { I18n, I18nOptions } from 'vue-i18n';

import { createI18n } from 'vue-i18n';
import { setHtmlPageLang, setLoadLocalePool } from './helper';
import { localeSetting } from '/@/settings/localeSetting';
import { useLocaleStoreWithOut } from '/@/store/modules/locale';

const { fallback, availableLocales } = localeSetting;

export let i18n: I18n;

async function createI18nOptions(): Promise<I18nOptions> {
  const localeStore = useLocaleStoreWithOut();
  const locale = localeStore.getLocale;
  const defaultLocal = await import(`./lang/${locale}.ts`);
  const message = defaultLocal.default?.message ?? {};
  setHtmlPageLang(locale);
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale);
  });
  return {
    legacy: false,
    locale,
    fallbackLocale: fallback,
    messages: {
      [locale]: message,
    },
    availableLocales: availableLocales,
    sync: true, //If you don't want to inherit locale from global scope, you need to set sync of i18n component option to false.
    silentTranslationWarn: true, // true - warning off
    missingWarn: false,
    silentFallbackWarn: true,
  };
}

// setup i18n instance with glob
export async function setupI18n(app: App) {
  const options = await createI18nOptions();
  i18n = createI18n(options) as unknown as I18n;
  app.use(i18n);
  // 全局暴露简化模板可用的翻译函数，避免 hooks 约束
  // 模板中可直接使用：$tt('xxx.xxx')
  // 不改变 $t 的行为，减少对既有代码的影响
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app.config.globalProperties as any).$tt = (key: string) => translateText(key);
}

/**
 * 获取翻译文本的工具函数
 * 供非Vue组件使用，如Entity/Attr类
 */
export function translateText(key: string): string {
  if (!i18n || !i18n.global || !i18n.global.t) {
    return key;
  }

  try {
    const translated = (i18n as any).global.t(key);
    // 如果翻译成功且不等于key本身，返回翻译结果
    if (translated && translated !== key) {
      return translated;
    }
  } catch (e) {
    // 翻译失败，返回原key
  }

  return key;
}
