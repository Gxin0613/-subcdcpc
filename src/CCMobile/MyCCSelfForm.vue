<template>
  <div style="background-color: rgb(240, 242, 245)" class="content" :style="contentStyle">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <NavBar v-if="mobileNavbarVisible()" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />
        <WaterMark :disable="!enableWaterMark" :text="WaterMarkText">
          <!--表单内容-->
          <template v-if="selfFrmShowType === 'Table'">
            <!--嵌入式表单的内容-->
            <iframe v-if="!!iframeUrl && iframeUrl.includes('WorkID')" :src="iframeUrl" ref="frameRef" style="width: 100%; height: 100%"></iframe>
            <!--审核组件的内容-->
            <WorkCheck v-if="!!nodeInfo && nodeInfo.FWCSta != 0" ref="workCheckRef" :params="query" :nodeInfo="nodeInfo" :is-readonly="isReadonly" :examineMode="examineMode" />
          </template>
          <template v-if="selfFrmShowType === 'Tab'">
            <div class="headTitle">
              <span v-if="gwf.taskTitle">
                {{ gwf.taskTitle }}
              </span>
              <span v-else>{{ gwf.Title }}</span>
            </div>
            <Tabs v-model:activeKey="activeKey" :style="tabStyle" title-active-color="#007af5">
              <Tab :title="'业务信息'" name="1">
                <!--嵌入式表单的内容-->
                <iframe v-if="!!iframeUrl && iframeUrl.includes('WorkID')" :src="iframeUrl" ref="frameRef" style="width: 100%; height: 100%"></iframe>
              </Tab>
              <Tab :title="'审核信息'" name="2">
                <!--审核组件的内容-->
                <WorkCheck v-if="!!nodeInfo && nodeInfo.FWCSta != 0" ref="workCheckRef" :params="query" :nodeInfo="nodeInfo" :is-readonly="isReadonly" :examineMode="examineMode" />
              </Tab>
            </Tabs>
          </template>
        </WaterMark>
        <!--工具栏-->
        <ToolBar pageType="MyCC" :params="query" @ChangeLoading="ChangeLoading" @Save="Save" @call-iframe-method="callIframeMethod" />
      </div>
      <!--居中弹窗-->
      <Dialog v-model:open="modal.modalVisible" centered :closable="modal.closable" :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight">
        <div class="h-100">
          <!--退回小纸条显示-->
          <div style="padding: 10px; overflow-y: auto; height: 100%">
            <template v-for="(item, index) in dataInfo" :key="index">
              <div v-if="item.title === '退回信息'" style="line-height: 24px; color: red; font-weight: bold">{{ item.title }}</div>
              <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div>
              <p v-html="item.content" style="line-height: 24px"></p>
            </template>
          </div>
        </div>
      </Dialog>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import ToolBar from './ToolBar.vue';
  import WorkCheck from './WorkOpt/WorkCheck.vue';
  import { useRoute } from 'vue-router';
  import { computed, inject, onMounted, reactive, Ref, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
  import { NavBar, Tabs, Dialog, Tab } from 'vant';
  import { Spin, message } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { DealExp, GetPara, GetParamsUrl } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { CommonConfig } from '../DataUser/OverrideFiles/CommonConfig';
  import { NodeWorkCheck } from '../WF/Admin/AttrNode/NodeWorkCheck';
  import { mobileNavbarVisible } from '/@/utils/gener/StringUtils';
  import { usePostMessage } from '../hooks/message/usePostMessage';
  import { FlowExt } from '../WF/Admin/AttrFlow/FlowExt';
  import WaterMark from '/@/components/Watermark/WaterMark.vue';
  // const { VITE_GLOB_API_URL } = getAppEnvConfig();

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return null;
      },
    },
  });
  //获取传的参数
  const route = useRoute();
  const flowInfo = inject('flowInfo') as Ref<Recordable>;

  let query = {
    ...route.query,
    ...props.params,
  };
  if (flowInfo?.value) {
    query = {
      ...query,
      ...flowInfo.value,
    };
  }
  const isReadonly = parseInt((query.IsReadonly as string) || '0') === 1;
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const title = ref('');
  const dataInfo = ref<Record<string, any>[]>([]);
  const frmData = ref();
  const iframeHost = ref(''); // iframe的服务器地址
  const frameRef = shallowRef<
    HTMLIFrameElement & {
      contentWindow: {
        window: {
          Save: Function;
        };
      };
    }
  >();

  //节点编号
  const nodeID = parseInt((query.FK_Node as string) || '0');
  const iframeUrl = ref('');
  const nodeInfo = ref();

  const contentStyle = computed(() => {
    return {
      paddingTop: `${mobileNavbarVisible() ? '46px' : '0px'}`,
      paddingBottom: `calc(env(safe-area-inset-bottom) + 40px)`,
    };
  });
  const tabStyle = computed(() => {
    const navHeight = mobileNavbarVisible() ? '46px' : '0px';
    return {
      height: `calc(var(--viewport-height) - ${navHeight} - 80px)`,
    };
  });
  const examineMode = ref('');
  const selfFrmShowType = CommonConfig.SelfFrmShowType || 'Table';
  const activeKey = ref('1');
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };

  let selfFormRoot = 0;
  const gwf = ref<Record<string, any>>({});

  //是否设置水印
  const enableWaterMark = ref(false);
  const WaterMarkText = ref(0);
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //显示表单提示信息
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      const result = await handler.DoMethodReturnJson<Recordable>('GetFlowAlertMsg');
      frmData.value = result;
      gwf.value = result?.WF_GenerWorkFlow?.[0];
      ShowWorkReturnTip(frmData.value);

      //获取当前节点的信息
      const node = new Node(nodeID);
      await node.RetrieveFromDBSources();
      const en = new NodeWorkCheck(nodeID);
      await en.RetrieveFromDBSources();
      switch (en.FWCShowModel) {
        case 0:
          examineMode.value = 'normalMode';
          break;
        case 1:
          examineMode.value = 'trackMode';
          break;
        case 2:
          examineMode.value = 'trackTimeMode';
          break;
        default:
          examineMode.value = 'normalMode';
          break;
      }
      const flowNo = node.FK_Flow;

      //获取流程配置项
      const flowExt = new FlowExt(node.FK_Flow as string);
      await flowExt.RetrieveFromDBSources();
      //获取水印配置
      enableWaterMark.value = flowExt.IsWaterMark;
      WaterMarkText.value = flowExt.WaterMarkText;

      title.value = node.Name;
      if (!node.FormUrlMobile) {
        loading.value = false;
        errorObj.hasError = true;
        errorObj.tips = '嵌入式表单没有配置路径';
        return;
      }
      nodeInfo.value = node;
      const selfFormRoot = nodeInfo.value.GetParaInt('SelfFormEnRoot', 0);
      let url = '';
      if (selfFormRoot === 0) url = window.location.protocol + '://' + window.location.host + node.FormUrlMobile;
      if (selfFormRoot === 1) {
        // 千丁数科：iframe拼接动态参数
        if (node.FormUrlMobile.includes('@IframeUrlParas')) {
          const en = new BSEntity('BP.WF.GenerWorkFlow', query.WorkID as string);
          await en.RetrieveFromDBSources();
          let urlParas = GetPara(en.getData().AtPara, 'IframeUrlParas');
          urlParas = urlParas.replaceAll(':', '=');
          node.FormUrlMobile = node.FormUrlMobile.replace('@IframeUrlParas', urlParas);
        }
        url = node.FormUrlMobile.replace('@WorkID', query.WorkID);
        url = DealExp(url);
      }
      if (selfFormRoot === 2) {
        url = node.FormUrlMobile;
        //获取当前流程所在的类别
        const flow = new Flow(flowNo);
        await flow.Retrieve();
        if (!!flow.FK_FlowSort) {
          let flowSort = new FlowSort(flow.FK_FlowSort);
          await flowSort.RetrieveFromDBSources();
          if (flowSort.ParentNo != 0) {
            flowSort = new FlowSort(flowSort.ParentNo);
            await flowSort.RetrieveFromDBSources();
            if (!!flowSort.WebHost) {
              iframeHost.value = flowSort.WebHost;
              url = flowSort.WebHost + node.FormUrlMobile;
            }
          }
        }
      }
      if (selfFormRoot === 3) {
        const { VITE_SDKFROESERV_HOST } = getAppEnvConfig();
        url = VITE_SDKFROESERV_HOST + node.FormUrlMobile;
      }
      if (selfFormRoot === 4) {
        const en = new BSEntity('BP.WF.GenerWorkFlow', query.WorkID as string);
        await en.RetrieveFromDBSources();
        url = GetPara(en.getData().AtPara, 'MobileFrmUrl');
        if (!url) {
          message.error('没有获取到传入到WF_GenerWorkFlow中字段AtPara包含的MobileFrmUrl的值');
        }
      }

      if (url.includes('?') === false) url += '?1=1';
      url = url + '&WorkID=' + query.WorkID + '&FK_Flow=' + flowNo + '&FK_Node=' + nodeID + '&' + GetParamsUrl(query) + '&Token=' + WebUser.Token;
      iframeUrl.value = url;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const workCheckRef = shallowRef<InstanceType<typeof WorkCheck>>();
  const sameOriginCheck = (targetUrl: string) => {
    if (selfFormRoot === 0) return false;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      message.error('嵌入式表单必须配置完整路径，以http(s):// 开头');
      return false;
    }
    if (!targetUrl) {
      return false;
    }
    return targetUrl.startsWith(window.location.origin);
  };
  const wrapResult = (r: any) => {
    return r == false;
  };

  const callIframeMethod = (btnNo: string, msgType: string, callback: Function) => {
    const isSameOrigin = sameOriginCheck(iframeUrl.value);
    const frameWin = frameRef.value?.contentWindow;
    if (!frameWin) {
      callback(false);
      return;
    }
    // 同源
    if (isSameOrigin) {
      const result = frameWin.window?.Save?.({
        action: btnNo,
        msgType,
      });
      callback(wrapResult(result));
      return;
    }
    frameWin.postMessage({ msgType, action: btnNo }, '*');
  };

  let _callback: any = null;
  const listenSelfForm = (event) => {
    // 根据上面制定的结构来解析iframe内部发回来的数据
    const { cmd, params } = event.data;
    switch (cmd) {
      case 'Save':
        _callback?.(params.data);
        break;
    }
  };
  const Save = async (isOnlySend, isOnlySaveWorkCheck, callback, enableLoading = false) => {
    try {
      if (enableLoading) loading.value = true;
      let backResult = true;
      //判断是要保存审核信息
      if (nodeInfo.value.FWCSta === 1) {
        if (Array.isArray(workCheckRef.value)) backResult = await workCheckRef.value[0].WorkCheckSave(isOnlySend === 1 ? 0 : 1);
        else backResult = !!(await workCheckRef.value?.WorkCheckSave(isOnlySend === 1 ? 0 : 1));
        if (backResult === false) {
          callback?.(false);
          loading.value = false;

          return;
        }
      }

      if (isOnlySaveWorkCheck) {
        callback?.(true);
        if (enableLoading) loading.value = false;
        return;
      }

      //判断iframe是否跨域
      const isSameOrigin = sameOriginCheck(iframeUrl.value);
      const frameWin = frameRef.value?.contentWindow;
      if (!frameWin) {
        callback?.(false);
        loading.value = false;
        return;
      }
      if (typeof callback === 'function') {
        _callback = callback;
      }
      // 不同源
      if (!isSameOrigin) {
        frameWin.postMessage(
          {
            cmd: 'Save',
            params: {},
          },
          '*',
        );
        loading.value = false;
        return;
      }
      // 同源
      const result = frameWin?.window?.Save?.();
      callback?.(!!result);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e.toString();
      callback?.(false);
    } finally {
      if (enableLoading) loading.value = false;
    }
  };
  usePostMessage(listenSelfForm);
  onMounted(async () => {
    await InitPage();
  });

  const ShowWorkReturnTip = (flowData) => {
    const gwf = flowData?.WF_GenerWorkFlow[0];
    const scrip = GetPara(gwf.AtPara, 'ScripMsg') || '';
    const scripNodeID = GetPara(gwf.AtPara, 'ScripNodeID');
    const alertMsg = flowData?.AlertMsg || [];
    alertMsg.forEach((item) => {
      dataInfo.value.push({
        title: item.Title,
        content: item.Msg,
      });
    });
    if (scrip != '' && scripNodeID !== route.query.FK_Node) {
      dataInfo.value.push({
        title: '小纸条',
        content: scrip,
      });
    }

    if (dataInfo.value.length > 0) {
      modal.modalVisible = true;
      modal.modalTitle = '消息';
      modal.modalWidth = 420;
      modal.modalHeight = {
        height: window.innerHeight * 0.5 + 'px',
      };
    }
  };
  /**
   * 子组件修改父组件的值
   * @param state
   * @param data
   * @constructor
   */
  function ChangeLoading(state, data) {
    if (data != null) {
      message.error(data.tips);
      loading.value = false;
    }
    if (state != null) loading.value = state;
  }
</script>

<style lang="less" scoped>
  .content {
    background-color: #fafafd;
    box-sizing: border-box;
    height: var(--viewport-height);
    overflow-y: auto;
    overflow-x: hidden;
  }
  :deep(.van-nav-bar--fixed) {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }

  :deep(.van-nav-bar__left .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  :deep(.van-tabs__content) {
    height: calc(var(--viewport-height) - 48px - 40px - 44px);
  }

  :deep(.van-tab__panel) {
    height: 100%;
    padding-bottom: 44px;
  }

  .headTitle {
    margin-bottom: 0;
    color: #000;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    height: 40px;
    box-sizing: border-box;
    padding: 10px 12px;
  }
</style>
