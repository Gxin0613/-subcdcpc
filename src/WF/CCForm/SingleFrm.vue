<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--表单内容-->
        <div class="content wrapper" :style="contentStyle">
          <ChartFrm v-if="isLoaded && pagetype == 10 && frmData" :params="query" ref="ChartFrmRef" :field-is-readonly="params.fieldIsReadonly" />
          <FrmFool v-if="isLoaded && (pagetype === 0 || pagetype === 8) && frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="true" :isReadonly="true" :params="query" />
          <FrmSelf v-if="isLoaded && pagetype === 3 && node.FormType != 3 && frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="true" :isReadonly="true" :params="query" />
          <FrmVsto v-if="isLoaded && (pagetype === 6 || pagetype === 61)" ref="FrmVstoRef" :mapDataRef="mapData" :params="query" modalShow="right" />
          <iframe v-if="pagetype === 3 && node.FormType != 3"></iframe>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  import FrmSelf from '/@/WF/CCForm/FrmSelf.vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { useRoute } from 'vue-router';
  import { reactive, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from '/@/WF/Admin/EnumLab';
  import { message, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import FrmVsto from '/@/WF/FrmVsto.vue';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';

  //获取传的参数
  const route = useRoute();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
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
  const node = ref();
  const isEnableDBVer = ref(false);

  const contentStyle = reactive({
    width: 'calc(100vw - 230px)',
  });
  const pagetype = ref(FrmType.FoolForm);
  //通过Component使用页面，从props.params取参数
  const query = props.params.isComponent === true ? (props.params as any) : route.query || {};
  const mapData = ref<Record<string, any>>();
  const isLoaded = ref(false);
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      const frmID = query.FrmID;
      if (!!frmID) {
        const en = new MapData();
        en.No = frmID;
        const count = await en.RetrieveFromDBSources();
        if (count == 1) {
          mapData.value = Object.fromEntries(en.Row);
          pagetype.value = mapData.value.FrmType;
          if (pagetype.value === 6 || pagetype.value === 61) return;
        }
      }
      loading.value = true;
      //获取表单的数据
      let handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('GenerWorkNode');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));

      node.value = frmData.value.WF_Node[0];
      const flow = frmData.value.WF_Flow[0];
      isEnableDBVer.value = (GetPara(flow.AtPara, 'IsEnableDBVer') || flow.IsEnableDBVer || '0') === '0' ? false : true; //是否保留数据版本
      mapData.value = frmData.value.Sys_MapData[0];
      let frmNode = !!frmData.value['WF_FrmNode'] ? frmData.value['WF_FrmNode'][0] : null;
      //获取当前节点的表单方案，不同节点运行不同的表单信息
      pagetype.value = GetCurrentFormType(flow, node.value, mapData.value, frmNode) || FrmType.FoolForm;
      if (isEnableDBVer.value == true && pagetype.value != 3) {
        try {
          //计算当前节点的历史数据
          handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
          handler.AddPara('TrackID', query.TrackID);
          const data = await handler.DoMethodReturnString('MyFrm_Init_Data');
          if (data != '') frmData.value.MainTable[0] = data;
          query.IshistoryData = 1;
        } catch (e) {
          errorObj.hasError = true;
          errorObj.tips = e as string;
        }
      }
      if (pagetype.value === FrmType.FoolForm && frmData.value != null) contentStyle.width = frmData?.value?.Sys_MapData[0].FrmW + 'px';

      console.log(props.params);
      isLoaded.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();

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
            return FrmType.Url;
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
      //极简模式
      case FlowDevModel.JiJian:
        if (nodeFrmType == NodeFormType.SelfForm) return FrmType.Url;
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
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
  }
</style>
