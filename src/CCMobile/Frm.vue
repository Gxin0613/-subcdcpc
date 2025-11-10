<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else>
        <!--表单内容-->
        <FrmFool
          v-if="pagetype === 0 && frmData"
          ref="basicData"
          :frmData="frmData"
          :fieldIsReadonly="params.fieldIsReadonly || params.isReadonly"
          :isReadonly="isReadonly || params.isReadonly"
          :params="query"
        />
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import FlowError from '/@/WF/FlowError.vue';
  import { useRoute } from 'vue-router';
  import { reactive, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from '/@/WF/Admin/EnumLab';
  import { message, Spin } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from './CCForm/FrmFool.vue';

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

  const frmData = ref();

  const isReadonly = ref(false);

  const pagetype = ref(FrmType.FoolForm);
  //通过Component使用页面，从props.params取参数
  const query = props.params.isComponent === true ? (props.params as any) : route.query || {};
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      isReadonly.value = props.params.isReadonly;
      //通过Component使用页面，从props.params取参数
      /*if (props.params.isComponent === true) {
        isReadonly.value = props.params.isReadonly;
      }*/
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
      //获得当前表单的数据，然后把该数据替换掉 frmData的数据.
      handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddJson(query);
      const result = await handler.DoMethodReturnString('MyFrm_Init_Data'); //执行保存方法.
      if (typeof result == 'string' && result.includes('err@') == true) {
        message.error(result);
        return;
      }
      if (!!result) frmData.value.MainTable[0] = result;
      if (typeof frmData.value === 'object' && frmData.value.PageName === 'Frm') {
        pagetype.value = 10;
        return;
      }
      const node = frmData.value.WF_Node[0];
      const flow = frmData.value.WF_Flow[0];
      const mapData = frmData.value.Sys_MapData[0];
      let frmNode = null;
      if ((flow.FlowDevModel == '1' || node.FormType == 11) && !!frmData.value['WF_FrmNode']) {
        frmNode = frmData.value['WF_FrmNode'][0];
        if (!!frmNode && frmNode.FrmSln == 1) {
          isReadonly.value = true;
        }
      }
      //获取当前节点的表单方案，不同节点运行不同的表单信息
      pagetype.value = GetCurrentFormType(flow, node, mapData, frmNode) || FrmType.FoolForm;
      pagetype.value = pagetype.value=== 8? 0:  pagetype.value;
      console.log(props.params);
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
    padding: 60px 24px 24px;
    height: 100%;
  }
</style>
