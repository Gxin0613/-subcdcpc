<template>
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red" style="margin-top: 46px">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" style="padding-top: 20px">
        <div v-if="isShowMsg == false">
          <Form>
            <CellGroup inset>
              <Field is-link readonly v-model="returnToNodeName" :label="'要退回到'" input-align="right" @click="returnTo" />
              <!-- 下拉框选择退回常用短语 -->
              <Field is-link readonly v-model="returnDefaultWorkName" :label="'退回常用短语'" input-align="right" @click="returnChange" />
              <Field v-model="returnMsg" type="textarea" :label="ReturnTitle + '原因'" rows="1" autosize input-align="right" />
              <div class="btn-groups">
                <div style="padding: 10px 16px">
                  <Checkbox v-model="isBackTrack" v-if="backTrackingRole != 0" :disabled="backTrackingRole == 2">{{'本次退回后让被退回节点直接发回给我'}}</Checkbox>
                  <Checkbox v-model="isKillExtThread" v-if="killEtcThreadRole != 0" :disabled="killEtcThreadRole == 1">{{'全部子线程退回'}}</Checkbox>
                </div>
                <div style="text-align: right; margin-right: 5px">
                  <Button type="primary" square size="small" @click="OpenUseExpresFlow" style="margin-right: 1em">{{'编辑常用短语'}}</Button>
                  <Button type="primary" square size="small" @click="ReturnWork" style="margin-right: 1em">{{'退回'}}</Button>
                  <!--                  <Button type="primary" square size="small" @click="Close(0)">{{'关闭'}}</Button>-->
                </div>
              </div>
            </CellGroup>
          </Form>
        </div>
        <div v-else style="width: 100%; height: 100%; position: fixed; top: 46px; left: 0; z-index: 99; background-color: #fff">
          <div style="display: flex; justify-content: center; align-items: center; flex-direction: column">
            <img :src="SendComplete" alt="" />
            <p style="padding: 0 15px" v-html="msg"></p>
            <div style="text-align: center">
              <Button type="primary" @click="Close(1)" style="margin-top: 10px; width: 15vh; background: #2279d6; border-color: #2279d6">{{'关闭'}}</Button>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  </div>
  <Popup v-model:show="PopupModal.modalVisible" position="bottom">
    <Picker v-if="PopupModal.modalType == 'ReturnToNode'" show-toolbar :columns="returnData" @confirm="onConfirmSelect" @cancel="PopupModal.modalVisible = false" />
    <Picker v-if="PopupModal.modalType == 'UsefulExpresFlow'" show-toolbar :columns="returnUseWorks" @confirm="onSelectReturnWork" @cancel="PopupModal.modalVisible = false" />
  </Popup>
  <Popup
    v-model:show="modal.ModalVisible"
    position="bottom"
    :title="modal.modalTitle"
    :style="{ paddingTop: '30px', height: '60%' }"
    close-icon="close"
    closeable
    @close="handleOk"
  >
    <UsefulExpresFlow v-if="modal.modalType === 'UsefulExpresFlow'" attrKey="ReturnFlow" ref="selectData" />
  </Popup>
</template>

<script lang="ts">
  export default {
    name: 'ReturnWork',
  };
</script>
<script lang="ts" setup>
  import { Spin, Button } from 'ant-design-vue';
  import { Form, CellGroup, Field, Checkbox, Popup, Picker, showFailToast } from 'vant';
  // 父组件传过来的属性
  import { PropType, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Node } from '/@/WF/TSClass/Node';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import SendComplete from '/@/assets/images/fasongwancheng.png';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import UsefulExpresFlow from '/@/WF/WorkOpt/UsefulExpresFlow.vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import BSEntity from '/@/utils/gener/BSEntity';
  import WebUser from '/@/bp/web/WebUser';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });
  interface ReturnItem {
    value: string;
    text: string;
  }

  interface state {
    tags: Array<any>;
    inputVisible: Boolean;
    inputValue: Object;
  }

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  //退回后显示的信息
  const isShowMsg = ref(false);
  const msg = ref('');

  const ReturnTitle = ref(props.params?.Title || '退回');

  const { beforeReturn, afterReturn } = userMyFlowSelfLoader();

  //退回规则
  const backTrackingRole = ref(0);
  const isBackTrack = ref(false);
  //子线程删除规则
  const killEtcThreadRole = ref(0);
  const isKillExtThread = ref(false);
  const returnData = ref<ReturnItem[]>([]);
  const returnToNode = ref('');
  const returnToNodeName = ref('');
  const returnMsg = ref<string>('');
  const PopupModal = reactive({
    modalVisible: false,
    modalType: '',
  });
  //退回常用短语集合
  const state: state = reactive({
    tags: [],
    inputVisible: false,
    inputValue: {},
  });
  //常用短语默认值
  const returnDefaultWork = ref('');
  const returnDefaultWorkName = ref('');
  const returnUseWorks = ref<any[]>([]);
  //弹窗显示
  const modal = reactive({
    ModalVisible: false,
    modalTitle: '',
    modalType: '',
  });

  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('Return_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }

      //单节点退回
      if (typeof data === 'string' && data.includes('info@')) {
        isShowMsg.value = true;
        msg.value = data.replace('info@', '');
        msg.value = msg.value.replace(/null/g, '');
        return;
      }

      const nodeExt = new Node();
      await nodeExt.Init();
      nodeExt.NodeID = parseInt(props.params.FK_Node || 0);
      await nodeExt.RetrieveFromDBSources();
      //子线程
      if (nodeExt.RunModel == 4 || nodeExt.RunModel == 5)
        //0 不删除子线程 1删除其他子线程 2由退回人决定是否删除子线程
        killEtcThreadRole.value = nodeExt.IsKillEtcThread;
      if (killEtcThreadRole.value == 1) isKillExtThread.value = true;
      //是否原路退回
      if (CommonConfig.ReturnWin_IsBackTracking_Selected) backTrackingRole.value = 2;
      else backTrackingRole.value = nodeExt.IsBackTracking;
      if (backTrackingRole.value == 2) isBackTrack.value = true;

      const result = JSON.parse(JSON.stringify(data));
      const returnNo = ref('');
      returnData.value = [];
      result.forEach((item) => {
        if ((item.AtPara && item.AtPara.indexOf('IsHuiQian=1') >= 0) || returnNo.value.includes(item.No + ',') == true) {
          console.log(item);
        } else {
          returnData.value.push({
            value: item.No + '=>' + item.Rec,
            text: item.RecName + '=>' + item.Name,
          });
        }
      });
      returnToNode.value = returnData.value.length > 0 ? returnData.value[0].value : '';
      returnToNodeName.value = returnData.value.length > 0 ? returnData.value[0].text : '';
      await getReturnUsePhrase();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 获取退回常用短语
   */
  const getReturnUsePhrase = async () => {
    const ens = new BSEntities('BP.Sys.FastInputs');
    const data = await ens.DoMethodReturnJSON('InitData_ReturnFlow');
    console.log(data);
    if (typeof data === 'string' && data.includes('err@')) {
      showFailToast(data);
      return;
    }
    const dataMsg = JSON.parse(JSON.stringify(data));
    state.tags = dataMsg;
    const tags = state.tags.filter((item) => !!item.Vals);
    returnUseWorks.value = tags.map((item) => {
      return {
        value: item?.MyPK,
        text: item?.Vals,
      };
    });
    returnDefaultWork.value = returnUseWorks.value.length > 0 ? returnUseWorks.value[0].value : '';
    returnDefaultWorkName.value = returnUseWorks.value.length > 0 ? returnUseWorks.value[0].text : '';
  };
  //end
  InitPage();
  /**
   * 退回到节点选择
   */
  const onConfirmSelect = ({ selectedOptions }) => {
    returnToNode.value = selectedOptions[0].value;
    returnToNodeName.value = selectedOptions[0].text;

    PopupModal.modalVisible = false;
  };
  /**
   * 退回常用短语选择
   */
  const onSelectReturnWork = ({ selectedOptions }) => {
    returnDefaultWork.value = selectedOptions[0].value;
    returnDefaultWorkName.value = selectedOptions[0].text;
    returnMsg.value = '';
    if (returnDefaultWorkName.value == '其他') {
      returnMsg.value = '';
    } else {
      returnMsg.value = returnDefaultWorkName.value;
    }
    PopupModal.modalVisible = false;
  };
  /**
   * 编辑退回常用短语弹窗
   */
  const OpenUseExpresFlow = () => {
    modal.ModalVisible = true;
    modal.modalTitle = '退回常用短语';
    modal.modalType = 'UsefulExpresFlow';
  };
  /**
   * 弹窗编辑完关闭按钮
   */
  const selectData = shallowRef<InstanceType<typeof UsefulExpresFlow>>();
  const handleOk = async () => {
    console.log(selectData.value?.tableData);
    const ens = selectData.value!.tableData;
    for (let i = 0; i < ens.length; i++) {
      const en = ens[i];
      const en1 = new BSEntity('BP.Sys.FastInput', en.MyPK);
      en1.setVal('Vals', en.Vals);
      en1.setVal('CfgKey', 'ReturnFlow');
      en1.setVal('FK_Emp', WebUser.No);
      await en1.Update();
    }
    selectData.value?.clearSelectedRowKeys();
    modal.ModalVisible = false;
    InitPage();
  };
  const ReturnWork = async () => {
    if (returnToNode.value == '') {
      showFailToast('请选择退回到的节点');
      return;
    }
    if (returnMsg.value == '') {
      showFailToast('请填写退回原因');
      return;
    }
    loading.value = true;
    try {
      //批量退回
      if (props.params.WorkIDs != null && props.params.WorkIDs != undefined && props.params.WorkIDs != '') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddJson(props.params);
        handler.AddPara('ReturnToNode', returnToNode.value);
        handler.AddPara('ReturnInfo', returnMsg.value);
        handler.AddPara('IsBack', isBackTrack.value === true ? 1 : 0);
        //是否全部子线程退回？
        handler.AddPara('IsKillEtcThread', isKillExtThread.value === true ? 1 : 0);
        const data = await handler.DoMethodReturnString('Batch_Return');
        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ReturnAfter();
        if (typeof data === 'string' && data.includes('err@')) {
          loading.value = false;
          showFailToast(data.replace('err@', ''));
          return;
        }
        if (typeof data === 'string') {
          loading.value = false;
          isShowMsg.value = true;
          msg.value = data.replace('info@', '');
          msg.value = msg.value.replace(/null/g, '');
          msg.value = msg.value.replace(/@/g, '<br/>');
          return;
        }
      }
      //单个退回
      const handlerExt = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handlerExt.AddJson(props.params);
      handlerExt.AddPara('ReturnToNode', returnToNode.value);
      handlerExt.AddPara('ReturnInfo', returnMsg.value);
      handlerExt.AddPara('IsBack', isBackTrack.value === true ? 1 : 0);
      //是否全部子线程退回？
      handlerExt.AddPara('IsKillEtcThread', isKillExtThread.value === true ? 1 : 0);
      const data = await handlerExt.DoMethodReturnString('DoReturnWork');
      loading.value = false;
      if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ReturnAfter();
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      if (typeof data === 'string') {
        isShowMsg.value = true;
        msg.value = data.replace('info@', '');
        msg.value = msg.value.replace(/null/g, '');
        msg.value = msg.value.replace(/@/g, '<br/>');
        await afterReturn(props.params.FlowNo, props.params.FK_Node, props.params.WorkID, returnToNode.value, null);
        return;
      }
    } catch (e) {
      loading.value = false;
      showFailToast(e as string);
    }
  };

  const returnTo = () => {
    PopupModal.modalType = 'ReturnToNode';
    PopupModal.modalVisible = true;
  };
  const returnChange = () => {
    PopupModal.modalType = 'UsefulExpresFlow';
    PopupModal.modalVisible = true;
  };
  const emit = defineEmits(['handleCancel']);
  const Close = (type: number) => {
    emit('handleCancel');
  };
</script>
<style lang="less" scoped>
  .content {
    background-color: #f7f8fa;
    box-sizing: border-box;
    min-height: calc(100%);
    // min-height: calc(var(--viewport-height) - 46px);
    // margin-top: 46px;
    h2 {
      margin: 0;
      padding: 16px 16px 16px;
      color: var(--van-doc-text-color-4);
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
    }
  }
</style>
