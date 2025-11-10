<template>
  <div class="en-wrapper">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError">
        <FlowError :doc="errorObj.tips" @CloseWindow="CloseWindow" :isShowCloseBtn="false" />
      </div>
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
  import FlowError from './FlowError.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Spin } from 'ant-design-vue';
  import { provide, reactive, ref } from 'vue';
  import { DealExp, GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
  import Exception from '/@/views/sys/exception/Exception.vue';
  import { GloComm } from './Comm/GloComm';
  // 父组件传过来的属性
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  const route = useRoute();
  //const { replace } = useRouter();
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
  const { loadComponent } = useComponentLoader();
  // 为所有子组件提供流程信息
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
  const iframeUrl = ref('');
  // end
  const ready = ref(false);
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
        const pageName: string = data['PageName'] || '';
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        if (pageName.startsWith('StartGuide_')) {
          compSrcUrl.value = `/src/WF/WorkOpt/${pageName.replace('StartGuide_', 'StartGuide/')}.vue?${GetParamsUrl(data)}${getSuffix(pageName)}`;
        } else if (pageName.startsWith('GPN_')) {
          compSrcUrl.value = GloComm.UrlGPN(pageName, '', '&' + GetParamsUrl(data) + getSuffix(pageName));
        } else if (pageName.startsWith('GL_')) {
          compSrcUrl.value = GloComm.UrlGenerList(pageName, '&' + GetParamsUrl(data) + getSuffix(pageName));
        } else {
          compSrcUrl.value = `/src/WF/${pageName || 'MyFlowGener'}.vue?${GetParamsUrl(data)}${getSuffix(pageName)}`;
        }
        flowInfo.value = getAllRequestParams(compSrcUrl.value);
        ready.value = true;
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
  const CloseWindow = () => {
    // 如果不是顶层iframe
    const topWindow = (window.top === window ? window : window.top)!;
    const hashUrl = topWindow.location.hash;
    if (hashUrl.includes('/WF/TestingContainer/Default')) {
      const flowNo = query.FK_Flow || query.FlowNo;
      topWindow.location.replace(
        '/#/WF/TestingContainer/Default?FlowNo=' + flowNo + '&WorkID=' + query.WorkID + '&TesterNo=' + query.TesterNo + '&CurrPage=FlowInstance&t=' + Math.random(),
      );
    } else {
      try {
        window.parent.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
      } catch (e) {
        const pre = hashUrl.includes('?') ? '&1=1' : '?1=1';
        topWindow.location.replace('/' + hashUrl + pre);
      }
      window.close();
    }
  };
</script>
