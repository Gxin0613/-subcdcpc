<template>
  <div class="link-wrapper">
    <iframe v-if="isUrl(url)" class="iframe" :src="url"> </iframe>
    <component v-else-if="isVueFile()" :is="useCachedComponentLoader(url)" :params="getAllRequestParams(url)" />
    <div v-else> url配置错误，请检查，只能打开项目内部vue文件或http链接,当前配置url为：{{ url }} </div>
  </div>
</template>

<script setup lang="ts">
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import { getAllRequestParams } from '/@/utils/request/decode';
  const props = defineProps({
    url: {
      type: String,
      default: '',
    },
  });
  console.log(props.url);
  const isUrl = (str: string) => !!str && (str.startsWith('http://') || str.startsWith('https://'));
  const isVueFile = () => {
    return props.url.split('?')?.[0].endsWith('.vue');
  };
</script>

<style lang="less" scoped>
  .link-wrapper {
    width: 100%;
    height: 100%;
    min-height: 600px;
    .iframe {
      border: none;
      outline: none;
      width: 100%;
      height: 100%;
    }
  }
</style>
