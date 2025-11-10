<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: rgb(240, 242, 245)">
        <!--工具栏-->
        <div class="header toolBar" :style="{ lineHeight: '64px' }">
          <ToolBar pageType="MyCC" @ChangeLoading="ChangeLoading" :params="query" @Save="Save" @VerifyFormData="VerifyFormData" />
        </div>
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="true" :isReadonly="true" :params="query" />
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
  import { useRoute } from 'vue-router';
  import { inject, reactive, Ref, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from './Admin/EnumLab';
  import { message, Modal, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from './CCForm/FrmFool.vue';

  //获取传的参数
  const props = defineProps({
    params: {
      type: Object,
      default: () => null,
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
    //width: 'calc(100vw - 230px)',
    height: 'auto',
  });
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
      const frmType = GetCurrentFormType(flow, node);

      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyCC');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('GenerWorkNode');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      //if (frmType === FrmType.FoolForm && frmData.value != null) contentStyle.width = frmData?.value?.Sys_MapData[0].FrmW + 'px';
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
        message.error('绑定多表单模式的流程设计模式需要跳转到MyFlowTree页面解析');
        break;
      case FlowDevModel.SDKFrm:
        //SDK表单模式
        return NodeFormType.SDKForm;
      case FlowDevModel.SelfFrm:
        //嵌入式模式
        return NodeFormType.SelfForm;
      case FlowDevModel.InternetOfThings:
        //互联网模式
        message.error('互联网的流程设计模式还未解析');
        break;
    }
  };
  InitPage();

  /**
   * 子组件修改父组件的值
   * @param state
   * @param data
   * @constructor
   */
  function ChangeLoading(state, data) {
    if (data != null) {
      message.error(data.tips);
    }
    if (state != null) loading.value = state;
  }
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 60px 24px 24px;
  }
</style>
