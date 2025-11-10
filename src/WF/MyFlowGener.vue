<template>
  <Spin :spinning="loading">
    <div style="background-color: rgb(240, 242, 245); height: 100%">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" />
      </div>
      <div v-else style="background-color: #f2f5f7; height: 100%">
        <!--工具栏-->
        <div class="header toolBar" :style="toolbarStyle">
          <ToolBar
            v-if="ready"
            pageType="MyFlow"
            :frmType="pagetype"
            @ChangeLoading="ChangeLoading"
            :params="{ ...query, fieldIsReadonly: isReadonly }"
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
          <FrmVsto v-else-if="pagetype == FrmType.VSTOForExcel || pagetype == FrmType.VSTOForWord" :params="{ ...query, PageFrom: 'MyFlow' }" :mapDataRef="mapDataRef" />
          <DevForm v-else-if="pagetype == FrmType.Develop" :frmID="nodeFrmId" :frmData="frmData" :params="query" pageNo="MyFlowGener" />
          <FrmFool v-else-if="frmData" ref="basicData" :frmData="frmData" :fieldIsReadonly="isReadonly" :isReadonly="false" :params="query" />
        </div>
      </div>
      <!--居中弹窗-->
      <Modal v-model:open="modal.modalVisible" centered :closable="modal.closable" :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight">
        <!-- :footer="null" -->
        <template #footer>
          <Button key="back" type="primary" @click="handleCancel" style="margin: 10px">{{ '关闭' }}</Button>
        </template>
        <div style="overflow-y: auto; height: 100%">
          <!--退回小纸条显示-->
          <div style="padding: 10px">
            <template v-for="(item, index) in dataInfo" :key="index">
              <div v-if="item.title === '消息提示'" style="line-height: 24px; color: red; font-weight: bold">{{ item.title }} </div>
              <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div> <p v-html="item.content" style="line-height: 24px"></p>
            </template>
          </div>
        </div>
      </Modal>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import ToolBar from './ToolBar.vue';
  import FlowError from './FlowError.vue';
  import { useRoute } from 'vue-router';
  import { computed, inject, reactive, Ref, ref, shallowRef } from 'vue';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { Node } from '/@/WF/TSClass/Node';
  import { FlowDevModel, FrmType, NodeFormType } from './Admin/EnumLab';
  import { message, Modal, Spin, Button } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from './CCForm/FrmFool.vue';
  import ChartFrm from './CCForm/ChartFrm.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import DevForm from './CCForm/devForm/Index.vue';
  import FrmVsto from '/@/WF/FrmVsto.vue';
  import Events from '../utils/Events';
  import { debounce } from 'lodash-es';
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
  const frmId = ref('');
  //流程编号
  //const flowNo = ref(query.FK_Flow as string);
  //节点编号
  //const nodeID = ref(parseInt((query.FK_Node as string) || '0'));
  Events.on(
    'autoSave',
    debounce(async () => {
      // if (frmData.value) {
      //   //更改数据字段值的类型
      //   const rowData = await basicData.value?.VerifyFormData(true);
      //   if (rowData == null) {
      //     return;
      //   }
      //   const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      //   handler.AddJson(rowData);
      //   handler.AddJson(query);
      //   await handler.DoMethodReturnString('Save');
      // }
    }, 200),
  );
  const toolbarStyle = computed(() => {
    return { position: 'fixed', zIndex: 100 };
  });
  const isReadonly = ref(false);
  const contentStyle = reactive({
    //width: 'calc(100vw - 230px)',
    height: 'auto',
  });
  const pagetype = ref(FrmType.FoolForm);
  const ready = ref(false);
  const nodeFrmId = ref('');
  const messageInfo = ref();
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取表单的数据
      let handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      console.log({ props });
      handler.AddJson(query);
      handler.AddPara('PageType', 'Vue3');
      const data = await handler.DoMethodReturnString('GenerWorkNode'); //章节表单和傻瓜表单获取到的东西不一样，因而导致无法正确判断是否只读
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      if (typeof data == 'object' && !!data['PageName'] && data['PageName'] === 'Frm') {
        //章节表单进入了这里，无法判断只读
        handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
        handler.AddJson(query);
        const result = await handler.DoMethodReturnString('GetFlowAlertMsg');

        if (typeof result == 'string' && result.includes('err@') == true) {
          message.error(result.replace('err@', ''));
        } else {
          messageInfo.value = result;
          ShowWorkReturnTip(messageInfo.value);
        }
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        query = data;
        pagetype.value = 10;
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      if (typeof frmData.value === 'object' && frmData.value.PageName === 'Frm') {
        pagetype.value = 10;
        return;
      }
      const node = frmData.value.WF_Node?.[0];
      const flow = frmData.value.WF_Flow?.[0];
      const mapData = frmData.value.Sys_MapData?.[0];
      mapDataRef.value = mapData;
      frmId.value = mapData.No;
      let frmNode = null;
      if ((flow.FlowDevModel == '1' || node.FormType == 11) && !!frmData.value['WF_FrmNode']) {
        frmNode = frmData.value['WF_FrmNode']?.[0];
        if (!!frmNode && frmNode.FrmSln == 1) {
          isReadonly.value = true;
          query['isReadonly'] = frmNode.FrmSln;
        }
      }
      nodeFrmId.value = frmData.value['WF_FrmNode']?.[0]?.MyPK;
      query.FrmID = mapData.No;
      //获取当前节点的表单方案，不同节点运行不同的表单信息
      pagetype.value = GetCurrentFormType(flow, node, mapData, frmNode) || FrmType.FoolForm;
      pagetype.value = pagetype.value === 8 ? 0 : pagetype.value;
      //if (pagetype.value === FrmType.FoolForm && frmData.value != null) contentStyle.width = frmData?.value?.Sys_MapData?.[0].FrmW + 'px';
      //显示退回,小纸条信息
      ShowWorkReturnTip(frmData.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
      ready.value = true;
    }
  };
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();
  const ChartFrmRef = shallowRef<InstanceType<typeof ChartFrm>>();
  const Save = async (type, callback) => {
    try {
      loading.value = true;
      if (pagetype.value == 6 || pagetype.value == 61) {
        if (typeof callback == 'function') callback(true);
        else return true;
      }
      if (pagetype.value == 10) {
        //章节表单调用表单抛出的保存方法
        await ChartFrmRef.value?.Save();
        if (typeof callback == 'function') callback(true);
        else return true;
      } else {
        //更改数据字段值的类型
        let rowData = await basicData.value?.VerifyFormData(type == 0 ? true : false);
        if (rowData == null) {
          if (typeof callback == 'function') callback(false);
          else return false;
        }
        if (rowData) {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          handler.AddPara('OID', rowData?.['OID']);
          handler.AddPara('FrmID', mapDataRef.value.No);
          handler.AddPara('JSON', encodeURIComponent(JSON.stringify(rowData)));
          const result = await handler.DoMethodReturnString('CheckDataConsistency');
          if (result.includes('数据一致性出现问题')) {
            //提示
            Modal.confirm({
              title: '',
              content: result.replace('err@', ''),
              okText: '刷新',
              cancelText: '覆盖',
              async onOk() {
                frmData.value = null;
                await InitPage();
              },
              async onCancel() {
                //保存历史数据
                //await handler.DoMethodReturnString('CheckDataConsistency')
                await SaveExt(type, rowData, callback);
              },
            });
          } else {
            await SaveExt(type, rowData, callback);
          }
        }
      }
    } catch (e) {
      message.error(e);
      if (typeof callback == 'function') callback(false);
      else return false;
    } finally {
      loading.value = false;
    }
  };
  const SaveExt = async (type, rowData, callback) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(query);
    for (const key in rowData) {
      handler.AddPara(key, encodeURIComponent(rowData[key]));
    }
    const data = await handler.DoMethodReturnString('Save');
    if (typeof data == 'string' && data.includes('err@') == true) {
      message.error(data.replace('err@', ''));
      if (typeof callback == 'function') callback(false);
      else return false;
    }
    if (type == 0) message.success('保存成功');
    if (typeof callback == 'function') callback(true);
    else return true;
  };

  /**
   * 表单校验
   * @constructor
   */
  const VerifyFormData = async (callback) => {
    if (pagetype.value == 10) {
      const rowData = await ChartFrmRef.value?.VerifyFormData(false);
      callback(rowData);
      return;
    }
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
    const gwf = flowData?.WF_GenerWorkFlow?.[0];
    const scrip = GetPara(gwf.AtPara, 'ScripMsg') || '';
    const scripNodeID = GetPara(gwf.AtPara, 'ScripNodeID');
    const alertMsg = flowData?.AlertMsg || [];
    const pressMsg = flowData?.PressMsg || [];
    //退回消息
    alertMsg.forEach((item) => {
      dataInfo.value.push({
        title: item.Title,
        content: item.Msg,
      });
    });
    //催办消息
    pressMsg.forEach((item) => {
      dataInfo.value.push({
        title: item.Title,
        content: item.Msg,
      });
    });
    //小纸条消息
    if (scrip != '' && scripNodeID !== route.query.FK_Node) {
      dataInfo.value.push({
        title: '小纸条',
        content: scrip,
      });
    }

    //消息提示框的设置
    if (dataInfo.value.length > 0) {
      modal.modalVisible = true;
      modal.modalTitle = '消息提示';
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
  const handleCancel = () => {
    modal.modalVisible = false;
  };

  //获取主表字段
  const GetMainData = (callBack) => {
    if (pagetype.value == 10) {
      callBack(ChartFrmRef.value?.mainData, mapDataRef.value.No);
    }
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
