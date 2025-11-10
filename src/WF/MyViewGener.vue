<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--工具栏-->
        <div class="header toolBar" :style="toolbarStyle">
          <ToolBar
            pageType="MyView"
            :params="query"
            @ChangeLoading="ChangeLoading"
            @Save="Save"
            @VerifyFormData="VerifyFormData"
            @GetMainData="GetMainData"
            @UpdateData="UpdateData"
            :frm-id="frmId"
          />
        </div>
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <ChartFrm v-if="pagetype == 10" :params="query" :frmData="frmData" ref="ChartFrmRef" :fieldIsReadonly="isReadonly" />
          <FrmVsto v-else-if="pagetype == FrmType.VSTOForExcel || pagetype == FrmType.VSTOForWord" :params="{...query,PageFrom:'MyFlow'}" :mapDataRef="mapDataRef" :isReadonly="isReadonly" />
          <DevForm v-else-if="pagetype == FrmType.Develop" :frmID="nodeFrmId" :frmData="frmData" :params="query" pageNo="MyViewGener" />
          <FrmFool v-else-if="frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="true" :isReadonly="true" :params="query" />
        </div>
      </div>
      <!--居中弹窗-->
      <Modal
        v-model:open="modal.modalVisible"
        centered
        :closable="modal.closable"
        :title="modal.modalTitle"
        :width="modal.modalWidth"
        :body-style="modal.modalHeight"
        :footer="null"
      >
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
      </Modal>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import ToolBar from './ToolBar.vue';
  import FlowError from './FlowError.vue';
  import { useRoute } from 'vue-router';
  import { computed, inject, reactive, Ref, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from './Admin/EnumLab';
  import { message, Modal, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from './CCForm/FrmFool.vue';
  import ChartFrm from './CCForm/ChartFrm.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import DevForm from './CCForm/devForm/Index.vue';
  import FrmVsto from '/@/WF/FrmVsto.vue';
  //获取传的参数
  const route = useRoute();
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return null;
      },
    },
  });
  const flowInfo = inject('flowInfo') as Ref<Recordable>;
  const query = flowInfo?.value || props.params || route.query || {};
  const loading = ref(false);
  const mapDataRef = ref();
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
  //流程编号
  //const flowNo = ref(query.FK_Flow as string);
  //节点编号
  //const nodeID = ref(parseInt((query.FK_Node as string) || '0'));
  const nodeFrmId = ref('');
  const isReadonly = ref(false);
  const frmId = ref('');
  const toolbarStyle = computed(() => {
    return { position: 'fixed', zIndex: 100 };
  });
  const contentStyle = reactive({
    //width: window.top?.location.hash.includes()?'calc(100vw - 230px)':'calc(100vw)',
    height: 'auto',
  });
  const pagetype = ref(FrmType.FoolForm);
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('GenerWorkNode');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      if (typeof frmData.value === 'object' && frmData.value.PageName === 'Frm') {
        pagetype.value = 10;
        return;
      }
      const node = frmData.value.WF_Node[0];
      const flow = frmData.value.WF_Flow[0];
      const mapData = frmData.value.Sys_MapData[0];
      mapDataRef.value = mapData;
      let frmNode = null;
      if ((flow.FlowDevModel == '1' || node.FormType == 11) && !!frmData.value['WF_FrmNode']) {
        frmNode = frmData.value['WF_FrmNode'][0];
        if (!!frmNode && frmNode.FrmSln == 1) {
          isReadonly.value = true;
        }
      }
      frmId.value = mapData.No;
      nodeFrmId.value = frmData.value['WF_FrmNode']?.[0]?.MyPK;
      //获取当前节点的表单方案，不同节点运行不同的表单信息
      pagetype.value = GetCurrentFormType(flow, node, mapData, frmNode) || FrmType.FoolForm;
      pagetype.value = pagetype.value === 8 ? 0 : pagetype.value;
      //if (pagetype.value === FrmType.FoolForm && frmData.value != null) contentStyle.width = frmData?.value?.Sys_MapData[0].FrmW + 'px';
      //显示退回,小纸条信息
      ShowWorkReturnTip(frmData.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();
  const Save = async (type, callback) => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      const rowData = await basicData.value?.VerifyFormData(true);
      if (rowData == null && typeof callback == 'function') callback(false);
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(rowData);
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('Save');
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        if (typeof callback == 'function') callback(false);
      }
      if (type == 0) message.success('保存成功');
      if (typeof callback == 'function') callback(true);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      if (typeof callback == 'function') callback(false);
    } finally {
      loading.value = false;
    }
  };
  /**
   * 表单校验
   * @constructor
   */
  const VerifyFormData = async (callback) => {
    const rowData = await basicData.value?.VerifyFormData(false);
    callback(rowData);
  };
  /**
   * 获取当前节点的表单方案，不同节点运行不同的表单信息
   * @param flow 流程属性
   * @param node 节点属性
   * @constructor
   */
  const GetCurrentFormType = (flow: Flow, node: Node, mapData, frmNode) => {
    //流程设计模式
    const flowDevModel = flow.FlowDevModel || 0;
    const nodeFrmType = node.FormType;
    switch (flowDevModel) {
      case FlowDevModel.Prefessional:
        //专业模式
        switch (nodeFrmType) {
          case NodeFormType.FoolForm:
            return FrmType.FoolForm;
          case NodeFormType.SelfForm:
          case NodeFormType.SDKForm:
            break;
          case NodeFormType.FoolTruck:
            return FrmType.FoolForm;
          case NodeFormType.RefOneFrmTree:
            if (!!frmNode) {
              return mapData.FrmType;
            }
            break;
          case NodeFormType.Develop:
            return FrmType.Develop;
          case NodeFormType.ChapterFrm:
            return FrmType.ChapterFrm;
        }
        break;
      case FlowDevModel.JiJian:
        //极简模式
        return mapData.FrmType;
        break;
      case FlowDevModel.FoolTruck:
        //累加模式
        return FrmType.FoolForm;
      case FlowDevModel.RefOneFrmTree:
        //绑定单表单模式
        if (!!frmNode) {
          return mapData.FrmType;
        }
        break;
      case FlowDevModel.FrmTree:
        //绑定多表单模式
        message.error('绑定多表单模式的流程设计模式需要跳转到MyFlowTree页面解析');
        break;
      case FlowDevModel.SDKFrm:
        //SDK表单模式
        return FrmType.Url;
      case FlowDevModel.SelfFrm:
        //嵌入式模式
        return FrmType.Url;
      case FlowDevModel.InternetOfThings:
        //互联网模式
        message.error('互联网的流程设计模式还未解析');
        break;
    }
  };
  InitPage();

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

  //获取主表字段
  const GetMainData = (callBack) => {
    callBack(basicData.value?.mainData, mapDataRef.value.No);
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return basicData.value?.handleUpdate(val);
  };
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
    padding: 65px 24px 0px;
    //height: 100%;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    // width: 1030px !important;
    border-radius: 5px;
  }
</style>
