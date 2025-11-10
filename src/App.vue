<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';
  import { useFirefoxDrop } from './hooks/event/useFirefoxDrop';
  // import { ClassFactory } from '/@/bp/da/ClassFactory';

  const { getAntdLocale } = useLocale();
  // Listening to page changes and dynamically changing site titles
  useTitle();

  // fix firefox drop event;
  useFirefoxDrop();

  // 集成quick时隐藏首页图标
  if ('quick' in window) {
    window.quick.page({ controller: false });
  }
</script>
