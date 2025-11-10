<template>
  <div class="en-wrapper" :style="loadingSta">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <component v-if="ready && !!compSrcUrl" :is="loadComponent(compSrcUrl)" :params="getAllRequestParams(compSrcUrl)" />
      <template v-if="ready && !!iframeUrl">
        <!--嵌入式表单的内容-->
        <div style=" width: calc(100vw - 230px);height: calc(var(--viewport-height));">
          <iframe
            v-if=" iframeUrl.startsWith('http') && iframeUrl.includes('WorkID')"
            :src="iframeUrl"
            ref="frameRef"
            style="width: 100%; height: 100%"
          ></iframe>
          <Exception v-if="iframeUrl.startsWith('http') == false" :status="404" :isHaveBtn="false" />
        </div>

      </template>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { computed, provide, reactive, ref } from 'vue';
  import {DealExp, GetParamsUrl} from '/@/utils/gener/StringUtils';
  import { Spin } from 'ant-design-vue';
  import { getAllRequestParams } from '../utils/request/decode';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
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
  if (!query.FK_Flow && !query.FlowNo) {
    query = (props.params.hasOwnProperty('PKVal') ? props.params : route.query) || {};
  }
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const compSrcUrl = ref('');
  const iframeUrl = ref('');
  const { loadComponent } = useComponentLoader();
  const flowInfo = ref({});
  provide('flowInfo', flowInfo);
  const getSuffix = (pageName: string) => {
    if (pageName == 'MyFlowSelfForm') {
      return '&IsReadonly=0&PageType=MyFlow';
    }
    if (pageName == 'MyFlowTree') {
      return '&PageType=MyFlow';
    }
    return '';
  };
  const ready = ref(false);
  const loadingSta = computed(() => {
    return {
      padding: loading.value ? '60% 50%' : 0,
    };
  });
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      const data: string = (await handler.DoMethodReturnString('MyFlow_Init')) || '';
      if (typeof data === 'string' && data.includes('err@')) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        return;
      }
      if (typeof data === 'string' && data.includes('Self@')) {
        let url  = data.replace('Self@','');
        if( url.startsWith('/@/') ||  url.startsWith('/src/')){
          compSrcUrl.value = url;
          flowInfo.value = getAllRequestParams(compSrcUrl.value);
          ready.value = true;
          return;
        }
        url = DealExp(url);
        iframeUrl.value = url;
        ready.value = true;
        return;
      }
      if (typeof data === 'object') {
        const pageName = data['PageName'] || '';
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        // @yln 没有处理其他情况，如果需要单独写个vue页面吧 by wanglu
        compSrcUrl.value = `/src/CCMobile/${pageName || 'MyFlowGener'}.vue?${GetParamsUrl(data)}${getSuffix(pageName)}`;
        flowInfo.value = getAllRequestParams(compSrcUrl.value);
        ready.value = true;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  InitPage();
</script>

<style scoped></style>
