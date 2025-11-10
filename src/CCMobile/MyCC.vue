<template>
  <div class="en-wrapper" :style="loadingSta">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <component v-if="ready" :is="loadComponent(compSrcUrl)" :params="getAllRequestParams(compSrcUrl)" />
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { showFailToast } from 'vant';
  import { Spin } from 'ant-design-vue';
  import { computed, provide, reactive, ref } from 'vue';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
  import { getAllRequestParams } from '../utils/request/decode';
  // 父组件传过来的属性
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  const route = useRoute();
  let query = (props.params.hasOwnProperty('PKVal') ? route.query : props.params) || {};
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const compSrcUrl = ref('');
  const { loadComponent } = useComponentLoader();
  // 为所有子组件提供流程信息
  const flowInfo = ref({});
  provide('flowInfo', flowInfo);
  const getSuffix = (pageName: string) => {
    if (['MyCCTree', 'MyCCSelfForm'].includes(pageName)) {
      return '&IsReadonly=1&PageType=MyCC';
    }
    return '';
  };
  // end
  const ready = ref(false);

  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyCC');
      handler.AddJson(query);
      const data: string = (await handler.DoMethodReturnString('MyCC_Init')) || '';
      loading.value = false;

      if (typeof data === 'object') {
        const pageName = data['PageName'] || '';
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        compSrcUrl.value = `/src/CCMobile/${pageName || 'MyFlowGener'}.vue?${GetParamsUrl(data)}${getSuffix(pageName)}`;
        flowInfo.value = getAllRequestParams(compSrcUrl.value);
        ready.value = true;
        return;
      }
    } catch (e) {
      showFailToast(e as string);
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const loadingSta = computed(() => {
    return {
      padding: loading.value ? '60% 50%' : 0,
    };
  });
  InitPage();
</script>

<style scoped></style>
