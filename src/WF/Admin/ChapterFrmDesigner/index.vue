<template>
  <n-dialog-provider>
    <n-message-provider>
      <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
        <ChapterFormMain />
      </n-config-provider>
    </n-message-provider>
  </n-dialog-provider>
</template>

<script lang="ts" setup>
  import ChapterFormMain from '/src/WF/Admin/ChapterFrmDesigner/main.vue';
  import { dateZhCN, GlobalThemeOverrides, NConfigProvider, NDialogProvider, NMessageProvider, zhCN } from 'naive-ui';
  const themeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: '#1890ff',
    },
    Input: {
      borderHover: '0 0 0 2px #1890ff',
      borderFocus: '#1890ff',
    },
    Button: {
      // borderHover: '#1890ff',
      // textColor: '#1890ff'
    },
  };
</script>
