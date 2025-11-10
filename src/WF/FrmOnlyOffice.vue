<template>
  <DocumentEditor v-if="documentServerApi" id="docEditor" :documentServerUrl="documentServerApi" :config="config" />
</template>
<script setup lang="ts">
  import { DocumentEditor } from '@ccflow_of/document-editor-vue';
  import { useRoute } from 'vue-router';
  import WebUser from '../bp/web/WebUser';
  import request from '../utils/request';
  import { onMounted, ref } from 'vue';

  const config = ref<Recordable>({});
  const documentServerApi = ref('');
  // 父组件传过来的属性
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  const route = useRoute();
  const InitPageParam = async () => {
    const res = await request.get<null, Recordable>(
      `/WF/OnlyOfficeUtils/editOnlyOffice?WorkID=${route.query.WorkID}&token=${WebUser.Token}&NodeID=${route.query.NodeID}&gongWenTemplateFile=${route.query.gongWenTemplateFile}&mode=edit`,
    );
    const { code, msg, detailinfo, data } = res;
    config.value = data;
    console.log(data);
    documentServerApi.value = config.value.api;
  };

  onMounted(async () => {
    await InitPageParam();
  });
</script>
<style>
  html,
  body,
  #app {
    height: 100%;
    width: 100%;
    margin: 0px;
  }
</style>
