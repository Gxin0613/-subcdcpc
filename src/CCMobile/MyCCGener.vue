<template>
  <div>
    <NavBar v-if="mobileNavbarVisible()" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />
    <!--表单内容-->
    <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="true" :isReadonly="true" :params="query" />
    <ToolBar pageType="MyCC" :params="query" @ChangeLoading="ChangeLoading" @Save="Save" @VerifyFormData="VerifyFormData" />
  </div>
</template>

<script lang="ts" setup>
  import { NavBar } from 'vant';
  import ToolBar from './ToolBar.vue';
  import { useRoute } from 'vue-router';
  import { reactive, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from '/@/WF/Admin/EnumLab';
  import { showToast, showFailToast } from 'vant';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/CCMobile/CCForm/FrmFool.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { mobileNavbarVisible } from '/@/utils/gener/StringUtils';

  //获取传的参数
  const route = useRoute();
  const query = route.query || {};
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
  const frmData = ref(null);
  //流程编号
  const flowNo = ref(query.FK_Flow as string);
  //节点编号
  const nodeID = ref(parseInt((query.FK_Node as string) || '0'));

  const contentStyle = reactive({
    width: 'calc(100vw - 230px)',
  });
  const title = ref('');
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  const pagetype = ref(FrmType.FoolForm);
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取流程属性的信息
      const flow = new Flow();
      await flow.Init();
      flow.No = flowNo.value;
      await flow.RetrieveFromDBSources();

      //获取当前节点的属性信息
      const node = new Node();
      await node.Init();
      node.NodeID = nodeID.value;
      await node.RetrieveFromDBSources();
      //获取当前节点的表单方案，不同节点运行不同的表单信息
      pagetype.value = GetCurrentFormType(flow, node) || FrmType.FoolForm;

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
      title.value = node.Name;

      if (pagetype.value === FrmType.FoolForm && frmData.value != null) contentStyle.width = frmData?.value?.Sys_MapData[0].FrmW + 'px';
      //显示退回,小纸条信息
      //ShowWorkReturnTip(frmData.value);
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
      const rowData = basicData.value?.VerifyFormData(true);
      if (rowData == null && typeof callback == 'function') callback(false);
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(rowData);
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('Save');
      if (typeof data == 'string' && data.includes('err@') == true) {
        showFailToast(data.replace('err@', ''));
        if (typeof callback == 'function') callback(false);
      }
      if (type == 0) showToast('保存成功');
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
  const VerifyFormData = (callback) => {
    const rowData = basicData.value?.VerifyFormData();
    callback(rowData);
  };
  /**
   * 获取当前节点的表单方案，不同节点运行不同的表单信息
   * @param flow 流程属性
   * @param node 节点属性
   * @constructor
   */
  const GetCurrentFormType = (flow: Flow, node: Node) => {
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
            //this.FormType = this.MapData.GetValIntByKey("FrmType");
            break;
          case NodeFormType.Develop:
            return FrmType.Develop;
          case NodeFormType.ChapterFrm:
            return FrmType.ChapterFrm;
        }
        break;
      case FlowDevModel.JiJian:
        //极简模式
        //this.FormType = this.MapData.GetValIntByKey("FrmType");
        break;
      case FlowDevModel.FoolTruck:
        //累加模式
        return FrmType.FoolForm;
      case FlowDevModel.RefOneFrmTree:
        //绑定单表单模式
        //this.FormType = this.MapData.GetValIntByKey("FrmType");
        break;
      case FlowDevModel.FrmTree:
        //绑定多表单模式
        showFailToast('绑定多表单模式的流程设计模式需要跳转到MyFlowTree页面解析');
        break;
      case FlowDevModel.SDKFrm:
        //SDK表单模式
        return NodeFormType.SDKForm;
      case FlowDevModel.SelfFrm:
        //嵌入式模式
        return NodeFormType.SelfForm;
      case FlowDevModel.InternetOfThings:
        //互联网模式
        showFailToast('互联网的流程设计模式还未解析');
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
        height: window.innerHeight * 0.7 + 'px',
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
      showFailToast(data.tips);
    }
    if (state != null) loading.value = state;
  }
</script>

<style lang="less" scoped>
  .toolBar {
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .van-nav-bar--fixed {
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
</style>
