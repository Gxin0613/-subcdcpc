<template>
  <div style="width: 100%; height: 100%; padding: 20px">
    <iframe :src="url" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { message } from 'ant-design-vue';

  const { VITE_GLOB_API_URL, VITE_GLOB_PLATFORM } = getAppEnvConfig();
  let url = ref<string>('');
  const iframeError = ref(false);
  const response = ref();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const InitPage = async () => {
    try {
      if (VITE_GLOB_PLATFORM == 'CCFLOW' || VITE_GLOB_PLATFORM == 'CCFlow' || VITE_GLOB_PLATFORM == 'ccflow') {
        url.value = basePath + 'swagger/';
      } else {
        // url.value = basePath + 'swagger-ui.html';
        url.value = basePath + 'doc.html';
        //检查url链接
        response.value = await fetch(url.value);
      }
    } catch (e: any) {
      iframeError.value = true;
      message.error('API列表打开失败,请检查您的配置项VITE_GLOB_PLATFORM与VITE_GLOB_API_URL是否配置正确.');
    }
  };
  InitPage();
</script>
<style lang="less" scoped></style>
