<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div style="background-color: rgb(240, 242, 245); height: 100%">
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <!--嵌入式表单的内容-->
          <iframe v-if="!!iframeUrl && iframeUrl.includes('WorkID')" :src="iframeUrl" ref="frameRef" style="width: 100%; height: 100%"></iframe>
          <!--审核组件的内容-->
          <WorkCheck v-if="!!nodeInfo && nodeInfo.FWCSta != 0" ref="workCheckRef" :params="params" :nodeInfo="nodeInfo" :is-readonly="params.isReadonly" />
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import WorkCheck from '../WorkOpt/WorkCheck.vue';
  import { getCurrentInstance, reactive, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowSort } from '/@/WF/TSClass/Admin/FlowSort';
  import { message, Spin } from 'ant-design-vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import BSEntity from '/@/utils/gener/BSEntity';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const instance = getCurrentInstance();
  const iframeHost = ref(''); // iframe的服务器地址

  //节点编号
  const nodeID = parseInt((props.params.FK_Node as string) || (props.params.NodeID as string) || '0');
  const iframeUrl = ref('');
  const nodeInfo = ref();
  const contentStyle = reactive({
    width: 'calc(100vw - 130px)',
    height: 'calc(100vh - 64px)',
  });
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取当前节点的信息
      const node = new Node(nodeID);
      await node.RetrieveFromDBSources();
      const flowNo = node.FK_Flow;
      if (!node.FormUrl) {
        loading.value = false;
        errorObj.hasError = true;
        errorObj.tips = '嵌入式表单没有配置路径';
        return;
      }
      nodeInfo.value = node;
      const selfFormRoot = nodeInfo.value.GetParaInt('SelfFormEnRoot', 0);
      let url = '';
      if (selfFormRoot === 0) url = window.location.protocol + '://' + window.location.host + node.FormUrl;
      if (selfFormRoot === 1) {
        const formUrl = node.FormUrl + '';
        const origin = window.location.origin;
        if (formUrl.startsWith(origin)) {
          url = formUrl.replace(origin, '/index.html');
        } else {
          url = node.FormUrl;
        }
      }
      if (selfFormRoot === 2) {
        url = node.FormUrl;
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
              url = flowSort.WebHost + node.FormUrl;
            }
          }
        }
      }
      if (selfFormRoot === 3) {
        const { VITE_SDKFROESERV_HOST } = getAppEnvConfig();
        url = VITE_SDKFROESERV_HOST + node.FormUrl;
      }
      if (selfFormRoot === 4) {
        const en = new BSEntity('BP.WF.GenerWorkFlow', props.params.WorkID as string);
        await en.RetrieveFromDBSources();
        url = GetPara(en.data.AtPara, 'FrmUrl');
        if (!url) {
          message.error('没有获取到传入到WF_GenerWorkFlow中字段AtPara包含的FrmUrl的值');
        }
      }

      if (url.includes('?') === false) url += '?1=1';
      url = url + '&WorkID=' + props.params.WorkID + '&FK_Flow=' + flowNo + '&FK_Node=' + nodeID + '&Token=' + WebUser.Token;
      iframeUrl.value = url;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const workCheckRef = shallowRef<InstanceType<typeof WorkCheck>>();
  const Save = async (isOnlySave, callback) => {
    try {
      loading.value = true;
      let backResult = true;
      //判断是要保存审核信息
      if (nodeInfo.value.FWCSta === 1) {
        if (Array.isArray(workCheckRef.value)) backResult = await workCheckRef.value[0].WorkCheckSave(isOnlySave);
        else backResult = await workCheckRef.value.WorkCheckSave(isOnlySave);
        if (backResult === false) {
          if (typeof callback == 'function') callback(false);
          return;
        }
      }

      //判断iframe是否跨域
      let isCross = false;
      if (!!iframeHost.value && iframeHost.value != VITE_GLOB_API_URL) isCross = true;
      if (!!instance) {
        const frameWin = instance.refs?.frameRef?.contentWindow;
        if (!!frameWin) {
          if (isCross == true) {
            frameWin.postMessage(
              {
                cmd: 'Save',
                params: {},
              },
              '*',
            );
            window.addEventListener('message', function (event) {
              // 根据上面制定的结构来解析iframe内部发回来的数据
              const data = event.data;
              switch (data.cmd) {
                case 'Save':
                  if (typeof callback == 'function') callback(data.params.data);
                  break;
              }
            });
          } else {
            if (typeof frameWin.window.Save === 'undefined') {
              message.error('没有找到Save方法');
              if (typeof callback == 'function') callback(null);
              return;
            }

            if (typeof frameWin.window.Save === 'function') {
              const result = frameWin.window.Save();
              if (typeof callback == 'function') callback(result);
              return;
            }
          }
        }
        return;
      } else {
        if (typeof callback == 'function') callback(backResult);
        return;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      if (typeof callback == 'function') callback(false);
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    // position: fixed;
    width: 100%;
    height: 50px;
    // z-index: 1000;
  }

  .wrapper {
    margin: 0 auto;
    padding: 10px 24px 24px;
    height: 100%;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    //width: 1030px !important;
    border-radius: 5px;
  }
</style>
