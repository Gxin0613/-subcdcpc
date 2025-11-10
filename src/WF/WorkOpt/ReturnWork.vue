<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <div v-if="isShowMsg == false">
          <!-- :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }"  -->
          <Form layout="vertical" style="width: 70%; margin: 0 auto">
            <FormItem :label="'要退回到的节点:'">
              <template v-if="IsMobile()">
                <DropdownMenu v-if="returnDatato.length > 0" direction="down">
                  <DropdownItem v-model="returnToNode" :options="returnDatato" />
                </DropdownMenu>
              </template>
              <template v-else>
                <Select v-model:value="returnToNode">
                  <SelectOption v-for="option in returnData" :key="option.No" :value="option.No"><i class="icon-user"></i> {{ option.Name }} </SelectOption>
                </Select>
              </template>
            </FormItem>
            <FormItem>
              <template #label>
                <span style="width: 110px">{{ ReturnTitle }}原因:</span>
                <Select v-model:value="returnDefaultWork" @change="handleChange" style="width: 425px">
                  <SelectOption v-for="option in returnUseWorks" :key="option?.No"> {{ option?.Name }} </SelectOption>
                </Select>
                <div class="edit-cont"><i class="icon-plus" @click="OpenUseExpresFlow"></i></div>
              </template>
              <Textarea v-model:value="returnMsg" :placeholder="'退回原因'" style="width: 100%; border: 1px solid #d9d9d9; border-radius: 2px; height: 100px" />
            </FormItem>
            <FormItem v-if="isUploadAth">
              <Upload
                name="file"
                :action="actionURL"
                :multiple="true"
                :showUploadList="false"
                @change="handleAthChange"
                :customRequest="customRequest"
                class="upload-modal-toolbar__btn"
                style="float: left"
              >
                <Button type="primary"> <CloudUploadOutlined />{{ '上传' }}</Button>
              </Upload>
              <template v-for="db in dblist" :key="db.MyPK">
                <Button type="link">{{ db.FileName }}</Button><CloseOutlined  @click="DeleteAth(db)" />
              </template>
            </FormItem>
          </Form>
          <div class="btn-groups" style="margin-left: 16%">
            <div style="margin: 5px">
              <Checkbox v-model:checked="isBackTrack" v-if="backTrackingRole != 0" :disabled="backTrackingRole == 2">{{ '本次退回后让被退回节点直接发回给我' }}</Checkbox>
              <Checkbox v-model:checked="isKillExtThread" v-if="killEtcThreadRole != 0" :disabled="killEtcThreadRole == 1">{{ '全部子线程退回' }}</Checkbox>
            </div>
            <div style="margin: 5px 85px 5px 5px" class="refund">
              <Button type="primary" @click="ReturnWork" style="margin-right: 1em">{{ '退回' }}</Button>
              <Button type="primary" @click="Close(0)">{{ '关闭' }}</Button>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-html="msg" style="padding: 10px 20px"> </div>
          <div style="display: flex; justify-content: flex-end; margin-right: 100px">
            <Button type="primary" @click="Close(1)">{{ '关闭' }}</Button>
          </div>
        </div>
      </div>
      <Modal v-model:open="modal.ModalVisible" centered :title="modal.modalTitle" :footer="null" :width="modal.modalWidth" :body-style="modal.modalHeight" @cancel="handleOk">
        <GenerList :params="{ EnName: 'GL_ReturnWorks', FlowNo: query.FlowNo, WorkID: query.WorkID }" />
      </Modal>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'ReturnWork',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Form, FormItem, Button, Select, SelectOption, Checkbox, Textarea, Modal,Upload, UploadChangeParam } from 'ant-design-vue';
  import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { DropdownMenu, DropdownItem } from 'vant';
  // 父组件传过来的属性
  import { PropType, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { GetParamsUrl, IsMobile } from '/@/utils/gener/StringUtils';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { REQUEST_UPLOAD_URL } from '/@/config/EnvProperties';
  import BSEntities from '/@/utils/gener/BSEntities';
  import GenerList from '/@/WF/views/GenerList.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { NodeExt } from '../Admin/AttrNode/NodeExt';

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
    No: string;
    Name: string;
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
  const ReturnTitle = ref(props.params?.Title || '退回');
  const query = ref(props.params);
  const loading = ref(false);
  //退回后显示的信息
  const isShowMsg = ref(false);
  const msg = ref('');

  //退回规则
  const backTrackingRole = ref(0);
  const isBackTrack = ref(false);
  //子线程删除规则
  const killEtcThreadRole = ref(0);
  const isKillExtThread = ref(false);
  const returnData = ref<ReturnItem[]>([]);
  const returnDatato = ref<any[]>([]);
  const returnToNode = ref('');
  const returnMsg = ref<string>('');
  
  //自定义退回方法
  const { beforeReturn, afterReturn } = userMyFlowSelfLoader(query);


  //退回到的节点编号
  const returntoNodeNo = ref();
  //退回常用短语集合
  const state: state = reactive({
    tags: [],
    inputVisible: false,
    inputValue: {},
  });
  //常用短语默认值
  const returnDefaultWork = ref('');
  const returnUseWorks = ref<any[]>([]);
  const nodeExt = new NodeExt();
  //是否启用附件上传
  const isUploadAth = ref(false);
  //弹窗显示
  const modal = reactive({
    ModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const InitPage = async () => {
    try {
      loading.value = true;

      if (!!props.params.FromPage && props.params.FromPage === 'ThreadDtl') {
        if (IsMobile()) {
          returnDatato.value.push({
            value: props.params.NodeID + '=>' + props.params.Rec,
            text: props.params.RecName + '=>' + props.params.NodeName + ':' + props.params.RDT,
          });
        } else {
          returnData.value.push({
            No: props.params.NodeID + '=>' + props.params.Rec,
            Name: props.params.RecName + '=>' + props.params.NodeName + ':' + props.params.RDT,
          });
        }
      } else {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddJson(props.params);
        const data = await handler.DoMethodReturnString('Return_Init');
        if (typeof data === 'string' && data.includes('err@')) {
          message.error(data.replace('err@', ''));
          return;
        }

        //单节点退回
        if (typeof data === 'string' && data.includes('info@')) {
          isShowMsg.value = true;
          msg.value = data.replace('info@', '');
          msg.value = msg.value.replace(/null/g, '');

          return;
        }
        const result = JSON.parse(JSON.stringify(data));
        const returnNo = ref('');
        returntoNodeNo.value = result[0];
        returnData.value = [];
        result.forEach((item) => {
          if ((item.AtPara && item.AtPara.indexOf('IsHuiQian=1') >= 0) || returnNo.value.includes(item.No + ',') == true) {
            console.log(item);
          } else {
            returnData.value.push({
              No: item.No + '=>' + item.Rec,
              Name: item.RecName + '=>' + item.Name + ':' + item.Rdt,
            });
          }
        });
        if (IsMobile()) {
          returnDatato.value = returnData.value.map((item) => {
            return {
              value: item.No + '=>' + item.Rec,
              text: item.RecName + '=>' + item.Name + ':' + item.Rdt,
            };
          });
        }
      }
      
      nodeExt.NodeID = props.params.FK_Node || 0;
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

      if (!!props.params.FromPage && props.params.FromPage === 'ThreadDtl') {
        backTrackingRole.value = 0;
        isBackTrack.value = false;
      }
      returnToNode.value = returnData.value.length > 0 ? returnData.value[0].No : '';
      isUploadAth.value = parseInt(nodeExt.IsUploadAth) == 1 ? true :false;
      if(isUploadAth.value) actionURL.value = `${REQUEST_UPLOAD_URL}?AttachPK=${nodeExt.NodeID}_AthReturn&FK_FrmAttachment=${nodeExt.NodeID}_AthReturn
       &FrmID=${nodeExt.NodeID}&DoType=MoreAttach&${GetParamsUrl(props.params)}&PKVal=${props.params.WorkID}`;
      await getReturnUsePhrase();
      await GetReturnAth();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  InitPage();
  /**
   * 获取退回常用短语
   */
  const getReturnUsePhrase = async () => {
    const ens = new BSEntities('BP.Sys.FastInputs');
    const data = await ens.DoMethodReturnJSON('InitData_ReturnFlow');
    console.log(data);
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data);
      return;
    }
    const dataMsg = JSON.parse(JSON.stringify(data));
    state.tags = dataMsg;
    const tags = state.tags.filter((item) => !!item.Vals);
    returnUseWorks.value = tags.map((item) => {
      return {
        No: item?.MyPK,
        Name: item?.Vals,
      };
    });
    returnDefaultWork.value = returnUseWorks.value.length > 0 ? returnUseWorks.value[0].No : '';
  };
  /**
   * 下拉框选中
   */
  const handleChange = (value) => {
    returnMsg.value = '';
    console.log('选中值', value);
    const selectVal = returnUseWorks.value.find((item) => item.No == value);
    console.log(selectVal.Name);
    if (selectVal.Name == '其他') {
      returnMsg.value = '';
    } else {
      returnMsg.value = selectVal.Name;
    }
  };
  /**
   * 编辑退回常用短语弹窗
   */
  const OpenUseExpresFlow = () => {
    modal.ModalVisible = true;
    modal.modalTitle = '退回常用短语';
    modal.modalType = 'UsefulExpresFlow';
    modal.modalHeight = {
      height: window.innerHeight * 0.45 + 'px',
    };
  };
 
  /**
   * 退回附件上传信息
   */
  const actionURL = ref('');
  const dblist = ref();
    /**
   * 附件上传
   * @param info
   */
  const handleAthChange = async (info: UploadChangeParam) => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      //await GetReturnAth();
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败.`);
    }
  };

  const customRequest = async (data) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FK_FrmAttachment', nodeExt.NodeID+'_AthReturn');
    handler.AddPara('AttachPK', nodeExt.NodeID+'_AthReturn');
    handler.AddPara('FrmID', nodeExt.NodeID.toString());
    handler.AddJson(props.params);
    handler.AddPara('PKVal', props.params.WorkID);
    handler.AddFile(data.file);
    handler.AddPara('OrgNo', WebUser.OrgNo);
    const result = await handler.DoMethodReturnString('MoreAttach');
    if (typeof result === 'string' && result.includes('err@')) {
      message.error(result);
      return;
    }
    await GetReturnAth();
  };
  const GetReturnAth=async ()=>{
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', props.params.WorkID);
    handler.AddPara('FK_Node', nodeExt.NodeID);
    
    const data = await handler.DoMethodReturnString('ReturnAth_Init');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data);
      return;
    }
    dblist.value = data;
  }
  const DeleteAth = async (record) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('DelPKVal', record.MyPK);
    const data = await handler.DoMethodReturnString('AttachmentUpload_Del');
    if (typeof data == 'string' && data.includes('err@') == true) {
      message.error(data.replace('err@', ''));
      return;
    }
    
  };
  const ReturnWork = async () => {
    if (returnToNode.value == '') {
      message.error('请选择退回到的节点');
      return;
    }
    if (returnMsg.value == '') {
      message.error('请填写退回原因');
      return;
    }
    const strs = returnToNode.value.split('=>');
    if (beforeReturn(nodeExt.FK_Flow, nodeExt.NodeID, props.params.WorkID, strs[0], strs[1]) == false) return;
    loading.value = true;
    try {
      if (props.WGFlow != null && (await new WaiGuaFlow(props.WGFlow).ReturnBefore()) == false) return;
      //批量退回
      if (props.params.WorkIDs != null && props.params.WorkIDs != undefined && props.params.WorkIDs != '') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_Batch');
        handler.AddJson(props.params);
        handler.AddPara('ReturnToNode', returnToNode.value);
        handler.AddPara('ReturnInfo', returnMsg.value);
        handler.AddPara('IsBack', isBackTrack.value == true ? 1 : 0);
        //是否全部子线程退回？
        handler.AddPara('IsKillEtcThread', isKillExtThread.value == true ? 1 : 0);
        const data = await handler.DoMethodReturnString('Batch_Return');
        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ReturnAfter();
        if (typeof data === 'string' && data.includes('err@')) {
          loading.value = false;
          message.error(data.replace('err@', ''));
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
      handlerExt.AddPara('IsKillEtcThread', isKillExtThread.value == true ? 1 : 0);
      const data = await handlerExt.DoMethodReturnString('DoReturnWork');
      if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ReturnAfter();
      loading.value = false;
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      if (typeof data === 'string') {
        isShowMsg.value = true;
        msg.value = data.replace('info@', '');
        msg.value = msg.value.replace(/null/g, '');
        msg.value = msg.value.replace(/@/g, '<br/>');
        await afterReturn(props.params.FlowNo, props.params.FK_Node, props.params.WorkID, returnToNode.value.split('=>')[0], null);
        return;
      }
    } catch (e) {
      message.error(e as string);
    } finally {
      loading.value = false;
    }
  };
  const emit = defineEmits(['handleCancel']);
  const Close = (type: number) => {
    if (type == 0) emit('handleCancel', true);
    else emit('handleCancel', false);
  };
</script>
<style scoped lang="less">
  .content {
    padding: 20px 0;
    margin: 5px 15px;
    border-radius: 5px;
    box-shadow: #03030333 5px 5px 10px 5px;
    .refund {
      display: flex;
      justify-content: flex-end;
    }
    .edit-cont {
      font-size: 20px;
      color: #3a64fe;
      margin: 0 10px;
    }
  }
</style>
