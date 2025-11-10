<template>
  <Spin :spinning="loading">
    <FramePage v-if="frameshow" :frameSrc="framesrc" />
  </Spin>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Spin } from 'ant-design-vue';
  import { RptBlue } from '/@/CCFast/CCBill/Components/RptBlue/RptBlue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useUserStore } from '/@/store/modules/user';
  import FramePage from '/@/views/sys/iframe/index.vue';
  const loading = ref(false);
  const frameshow = ref(false);
  const framesrc = ref('');
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const userStore = useUserStore();

  const getParams = (name: string) => props.params[name] || route.query[name];
  const InitSearch = async () => {
    try {
      loading.value = true;
      const pageID = getParams('PageID');
      const blueObject = new RptBlue(pageID);
      await blueObject.RetrieveFromDBSources();
      let { VITE_GLOB_GOVIEW_URL } = getAppEnvConfig();
      if (!VITE_GLOB_GOVIEW_URL.endsWith('/')) {
        VITE_GLOB_GOVIEW_URL = VITE_GLOB_GOVIEW_URL + '/';
      }
      const url = `${VITE_GLOB_GOVIEW_URL}#/chart/preview/${blueObject.Tag1}`;
      //'@0=Tab页打开@1=全屏打开
      if (blueObject.TagInt1 == 0) {
        frameshow.value = true;
        framesrc.value = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (e: any) {
      console.log(e);
    } finally {
      loading.value = false;
    }
  };

  InitSearch();
</script>
