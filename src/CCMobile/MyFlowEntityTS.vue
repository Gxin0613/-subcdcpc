<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <!--      <NavBar v-if="mobileNavbarVisible()" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />-->
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <!--嵌入式表单的内容-->
          <En v-if="isLoadAfter" ref="enRef" :params="query" :no-save-button="true" />
          <!--审核组件的内容-->
          <WorkCheck
            v-if="!!nodeInfo && nodeInfo.FWCSta != 0"
            ref="workCheckRef"
            :params="query"
            :nodeInfo="nodeInfo"
            :is-readonly="isReadonly"
            :examineMode="examineMode"
            style="background-color: rgb(255, 255, 255)"
          />
        </div>
        <ToolBar :pageType="query.PageType" @ChangeLoading="ChangeLoading" @SaveData="Save" :params="query" />
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
  import WorkCheck from '/@/CCMobile/WorkOpt/WorkCheck.vue';
  import FlowError from '/@/WF/FlowError.vue';
  import En from '/@/CCMobile/Comm/En.vue';
  import { useRoute } from 'vue-router';
  import { inject, onMounted, reactive, Ref, ref, shallowRef } from 'vue';
  import { Node } from '/@/WF/TSClass/Node';
  import { message, Spin } from 'ant-design-vue';
  import { NavBar, Dialog } from 'vant';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { GetPara, mobileNavbarVisible } from '/@/utils/gener/StringUtils';
  import { FrmNode } from '/@/WF/Admin/AttrNode/FrmSln/FrmNode';
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
  const dataInfo = ref<Record<string, any>[]>([]);
  const frmData = ref();

  //节点编号
  const nodeID = parseInt((query.FK_Node as string) || '0');
  const nodeInfo = ref();
  const contentStyle = reactive({
    width: 'calc(100vw)',
  });
  const isHaveFWC = ref(false);
  const isLoadAfter = ref(false);
  const examineMode = ref('');
  const title = ref('');
  const onClickLeft = () => {
    // if (history.length >= 2) {
    //   history.go(-2);
    //   return;
    // }
    history.go(-1);
  };
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //显示表单提示信息
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      handler.AddPara('IsReadonly', isReadonly === true ? 1 : 0);
      const result = await handler.DoMethodReturnString('GetFlowAlertMsg');
      if (typeof result == 'string' && result.includes('err@') == true) {
        message.error(result.replace('err@', ''));
      } else {
        frmData.value = result;
        ShowWorkReturnTip(frmData.value);
      }

      //获取当前节点的信息
      const node = new Node(nodeID);
      await node.RetrieveFromDBSources();
      title.value = node.Name;
      document.title = title.value;

      const fn = new FrmNode();
      fn.MyPK = node.FormUrl + '_' + node.NodeID + '_' + node.FK_Flow;
      await fn.RetrieveFromDBSources();
      nodeInfo.value = node;
      if (nodeInfo.value.FWCSta != 0 && fn.IsEnableFWC == 1) isHaveFWC.value = true;
      if (fn.FrmSln == 1) query.isReadonly = 1;
      examineMode.value = node.FWCShowModel == 0 ? 'normalMode' : 'trackMode';
      isLoadAfter.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const workCheckRef = shallowRef<InstanceType<typeof WorkCheck>>();
  const enRef = shallowRef<InstanceType<typeof En>>();
  const Save = async (isOnlySend, callback) => {
    try {
      loading.value = true;
      let backResult = true;
      //判断是要保存审核信息
      if (nodeInfo.value.FWCSta === 1) {
        if (Array.isArray(workCheckRef.value)) backResult = await workCheckRef.value[0].WorkCheckSave(isOnlySend === 1 ? 0 : 1);
        else backResult = await workCheckRef.value?.WorkCheckSave(isOnlySend === 1 ? 0 : 1);
        if (backResult === false) {
          if (typeof callback == 'function') callback(false);
          return;
        }
      }
      try {
        await enRef.value?.Save(false);
      } catch (e) {
        message.error(e as string);
        if (typeof callback == 'function') callback(false);
        return;
      }
      if (typeof callback == 'function') callback(true);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      if (typeof callback == 'function') callback(false);
    } finally {
      loading.value = false;
    }
  };

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
  .toolBar {
    background-color: white;
    // position: fixed;
    width: 100%;
    //height: 50px;
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
