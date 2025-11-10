<template>
  <div class="en-wrapper">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <!-- <div v-else class="en-body"> </div> -->
      <component v-if="ready && !!compSrcUrl" :is="loadComponent(compSrcUrl)" :params="getAllRequestParams(compSrcUrl)" />
      <template v-if="ready && !!iframeUrl">
        <!--嵌入式表单的内容-->
        <div style="width: calc(100vw - 230px); height: calc(var(--viewport-height))">
          <iframe v-if="iframeUrl.startsWith('http') && iframeUrl.includes('WorkID')" :src="iframeUrl" ref="frameRef" style="width: 100%; height: 100%"></iframe>
          <Exception v-if="iframeUrl.startsWith('http') == false" :status="404" :isHaveBtn="false" />
        </div>
      </template>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { message, Spin } from 'ant-design-vue';
  import { onMounted, onUnmounted, provide, reactive, ref } from 'vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { DealExp, GetParamsUrl } from '/@/utils/gener/StringUtils';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
  import Exception from '/@/views/sys/exception/Exception.vue';
  import Event from '/@/utils/Events';
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
    if (query.hasOwnProperty('WorkID') == false) query = props.params;
  }
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const getSuffix = (pageName: string, isReadonly: number) => {
    if (pageName == 'MyFlowSelfForm') {
      return '&PageType=' + (isReadonly === 1 ? 'MyView' : 'MyFlow');
    }
    if (pageName == 'MyFlowTree') {
      return '&PageType=' + (isReadonly === 1 ? 'MyView' : 'MyFlow');
    }
    return '';
  };
  const compSrcUrl = ref('');
  const { loadComponent } = useComponentLoader();
  // 为所有子组件提供流程信息
  const flowInfo = ref({});
  provide('flowInfo', flowInfo);
  const ready = ref(false);
  const iframeUrl = ref('');
  // end
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddJson(query);

      const data: string = (await handler.DoMethodReturnString('MyView_Init')) || '';
      loading.value = false;
      if (typeof data === 'string' && data.includes('Self@')) {
        let url = data.replace('Self@', '');
        if (url.startsWith('/@/') || url.startsWith('/src/')) {
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
        let pageName = (data['PageName'] || '') as string;
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        let isReadonly = 0;
        if (pageName === 'MyViewSelfForm') {
          pageName = 'MyFlowSelfForm';
          isReadonly = 1;
        }
        if (pageName === 'MyViewTree') {
          pageName = 'MyFlowTree';
          isReadonly = 1;
        }
        if (pageName === 'MyViewEntityTS') {
          pageName = 'MyFlowEntityTS';
          isReadonly = 1;
        }

        if (data['DoFlow'] == 1) {
          compSrcUrl.value = `/src/WF/${pageName}.vue?${GetParamsUrl(data)}&IsReadonly=${isReadonly}`;
        } else {
          compSrcUrl.value = `/src/WF/${pageName}.vue?${GetParamsUrl(data)}${getSuffix(pageName, isReadonly)}&IsReadonly=${isReadonly}`;
        }
        flowInfo.value = getAllRequestParams(compSrcUrl.value);
        ready.value = true;
        return;
      }
      if (data.includes('err@')) {
        message.error(data.replace('err@', ''));
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
   onMounted(async () => {
    Event.on('InitMyView', async () => {
      if(!!query.CurrNode){
        query.NodeID = query.CurrNode;
        query.FK_Node = query.CurrNode;
      }
      else{
        query.NodeID = 0;
        query.FK_Node = 0;
      }
      ready.value = false;
      compSrcUrl.value = '';
      iframeUrl.value = '';
      await InitPage();
    });
  });
  onUnmounted(() => {
    Event.off('InitMyView');
  });
</script>

<style scoped></style>
