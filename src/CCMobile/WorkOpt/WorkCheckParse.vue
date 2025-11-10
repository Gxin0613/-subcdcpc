<template>
  <div
    v-if="isShow"
    style="border: 1px solid #d9d9d9; padding: 10px; margin: var(--van-cell-group-inset-padding); border-radius: var(--van-cell-group-inset-radius); background-color: white"
  >
    <!--签章-->
    <div v-if="props.frmWorkCheck.SigantureEnabel === 3 || props.frmWorkCheck.SigantureEnabel === 4 || props.frmWorkCheck.SigantureEnabel === 5"> </div>
    <div v-else>
      <Row>
        <!-- <template v-if="props.isShowNodeName">
          <Col :span="24">
            <p style="font-weight: 600; font-size: 16px; color: #6d6969" v-html="trackInfo.NodeName"></p>
          </Col>
        </template> -->
        <Col :span="24">
          <template v-if="isEdit">
            <Textarea
              v-model:value="workCheckDoc"
              :placeholder="'内容不能为空,请输入信息,或者使用常用短语选择,内容不超过2000字.'"
              :rows="3"
              style="width: 100%; border: none"
              @blur="SaveWorkCheck(true)"
            />
          </template>
          <template v-else>
            {{ trackInfo.Msg }}
          </template>
        </Col>
        <!--审核立场-->
        <Col v-if="Array.isArray(positionList) && positionList.length > 0" :span="24">
          <span style="margin-right: 20px; cursor: pointer">审核立场:</span>
          <RadioGroup class="frmStyleType" v-model:value="positionVal" :disabled="isEdit == false">
            <Radio v-for="item in positionList" :key="item.value" :value="item.value"> {{ item.text }}</Radio>
          </RadioGroup>
        </Col>
        <!--显示常用短语-->
        <Col :span="24">
          <template v-if="CommonConfig.IsShowWorkCheckUsefulExpres && isEdit">
            <!-- 快速录入 -->
            <div style="margin-right: 20px; cursor: pointer" @click="IsShow">
              <menu-fold-outlined v-if="isHideMsg" class="trigger" />
              <menu-unfold-outlined v-else class="trigger" />
              {{ isHideMsg ? '展开' : '收起' }}</div
            >
            <div v-if="isHideMsg == false" style="display: flex; align-items: center; flex-wrap: wrap">
              <template v-for="tag in state.tags" :key="tag.MyPK">
                <Tag v-if="tag.Vals" color="processing" style="cursor: pointer; margin: 1%; white-space: normal" @click="getTag(tag.Vals)">
                  {{ tag.Vals }}
                </Tag>
              </template>
              <div style="float: left; cursor: pointer; margin-right: 20px; color: #3a64fe" @click="OpenUseExpresFlow">{{ '修改' }}</div>
            </div>
          </template>
          <div style="float: right; width: 50%; text-align: right">
            <template v-if="!!isEdit">
              <!-- 当前节点 -->
              <!-- 不签名 -->
              <template v-if="props.frmWorkCheck.SigantureEnabel === 0">
                {{ trackInfo.Checker }}
              </template>
              <!-- 图片签名 -->
              <template v-else-if="props.frmWorkCheck.SigantureEnabel === 1">
                <img :src="trackInfo.Img + '?t=' + Math.random()" :onerror="defaultImg" style="display: inline; height: 40px" />
              </template>
              <template v-else-if="props.frmWorkCheck.SigantureEnabel === 2">
                <!-- 可编辑的写字板 -->
                <img :src="writeImg" @click="DoHandWriting" style="display: inline; height: 40px" />
              </template>
              <!-- 暂不实现 -->
              <template v-else> {{ trackInfo.Checker }} </template>
            </template>
            <template v-else>
              <!-- 审核过的节点 -->
              <!-- 不签名 -->
              <template v-if="trackInfo.SigantureEnabel === 0">
                {{ trackInfo.Checker }}
              </template>
              <!-- 图片签名 -->
              <template v-else-if="trackInfo.SigantureEnabel === 1">
                <img :src="getSiganTureImg(trackInfo.EmpFrom)" :onerror="defaultImg" style="display: inline; height: 40px" />
              </template>
              <template v-else-if="trackInfo.SigantureEnabel === 2">
                <!-- 写字板 -->
                <img :src="trackInfo.WritImg" style="display: inline; height: 40px" @error="onSignError" />
              </template>
              <!-- 暂不实现 -->
              <template v-else> {{ trackInfo.Checker }} </template>
            </template>
            <!-- <template v-if="!!trackInfo.WritImg">
              <img :src="trackInfo.WritImg" style="display: inline; height: 40px" />
            </template>
            <template v-else-if="trackInfo.Img === '' && writeImg === ''">
              {{ trackInfo.Checker }}
            </template>
            <template v-else>
              <template v-if="props.frmWorkCheck.SigantureEnabel === 2 && isEdit">
                <img :src="writeImg" @click="DoHandWriting" style="display: inline; height: 40px" />
              </template>

              <template v-else>
                <img :src="trackInfo.Img" style="display: inline; height: 40px" />
              </template>
            </template> -->
            <div>
              <template v-if="parseInt(props.frmWorkCheck.IsChangeFWCTime) === 1 && isEdit">
                <Field v-model="trackInfo.FormatRDT" is-link readonly name="datePicker" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" @click="onDateClickPop" />
              </template>
              <template v-else>{{ trackInfo.FormatRDT }}</template>
            </div>
          </div>
        </Col>
        <template v-if="Array.isArray(dblist) && !!props.frmWorkCheck.FWCAth">
          <!--附件上传及显示-->
          <Col :span="4">附件:</Col>
          <Col :span="20">
            <Upload
              v-if="isEdit"
              name="file"
              :action="actionURL"
              :multiple="true"
              :showUploadList="false"
              @change="handleChange"
              :customRequest="customRequest"
              class="upload-modal-toolbar__btn"
              style="float: right"
            >
              <Button type="primary"> <CloudUploadOutlined />{{ '上传' }}</Button>
            </Upload>
            <template v-for="db in dblist" :key="db.MyPK">
              <Button type="link" @click="DownLoadAth(db)">{{ db.FileName }}</Button>
              <CloseOutlined v-if="!!parseInt(db.CanDelete)" @click="DeleteAth(db)" />
            </template>
          </Col>
        </template>
        <template v-else-if="Array.isArray(dblist) && !!trackInfo.FWCAth">
          <!--附件上传及显示-->
          <Col :span="4">附件:</Col>
          <Col :span="20">
            <Upload
              v-if="isEdit"
              name="file"
              :action="actionURL"
              :multiple="true"
              :showUploadList="false"
              @change="handleChange"
              :customRequest="customRequest"
              class="upload-modal-toolbar__btn"
              style="float: right"
            >
              <Button type="primary"> <CloudUploadOutlined />{{ '上传' }}</Button>
            </Upload>
            <template v-for="db in dblist" :key="db.MyPK">
              <Button type="link" @click="DownLoadAth(db)">{{ db.FileName }}</Button>
              <CloseOutlined v-if="!!parseInt(db.CanDelete)" @click="DeleteAth(db)" />
            </template>
          </Col>
        </template>
      </Row>
    </div>
    <Modal v-model:open="modal.footerModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" @ok="handleOk">
      <UsefulExpresFlow v-if="modal.modalType === 'UsefulExpresFlow'" attrKey="WorkCheck" ref="selectData" />
    </Modal>
    <Modal v-model:open="modal.noFooterModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null">
      <HandWriting v-if="modal.modalType === 'HandWriting'" :imageSrc="trackInfo.Img" @ChangeWriteImg="ChangeWriteImg" writingType="WorkCheck" />
    </Modal>
    <!--日期时间弹出-->
    <Popup v-model:show="datePop.visible" position="bottom">
      <PickerGroup :title="'选择审批时间'" :tabs="['选择日期', '选择时间']" @confirm="onConfirmDate" @cancel="datePop.visible = false">
        <DatePicker v-model="datePop.currentDate" :minDate="datePop.minDate" :maxDate="datePop.maxDate" />
        <TimePicker v-model="datePop.currentTime" :columns-type="datePop.columnsType" />
      </PickerGroup>
    </Popup>
  </div>
</template>

<script lang="ts" setup>
  import { message, Row, Col, Modal, Textarea, Upload, Button, UploadChangeParam, Tag, RadioGroup, Radio } from 'ant-design-vue';
  import { Field, Popup, PickerGroup, DatePicker, TimePicker, showFailToast } from 'vant';
  import { CloudUploadOutlined, CloseOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import WebUser from '/@/bp/web/WebUser';
  import dayjs from 'dayjs';
  import UsefulExpresFlow from './UsefulExpresFlow.vue';
  import HandWriting from '/@/WF/CCForm/HandWriting.vue';
  import { REQUEST_UPLOAD_URL, REQUEST_URL } from '/@/config/EnvProperties';
  import { GetPara, GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BSEntities from '/@/utils/gener/BSEntities';
  const props = defineProps({
    frmWorkCheck: {
      type: Object,
      default: () => {},
    },
    track: {
      type: Object,
      default: () => {},
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isShowNodeName: {
      type: Boolean,
      default: true,
    },
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const baseGlobPath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  //是否显示审核信息
  const isShow = ref(true);
  //当前审核意见是否可编辑
  const isEdit = ref(false);
  //可编辑的审核信息
  const workCheckDoc = ref('');
  //写字板
  const writeImg = ref('');
  const trackInfo = ref();
  //附件信息
  const dblist = ref();
  const ath = ref<FrmAttachment>({});
  const actionURL = ref('');

  //弹窗显示
  const modal = reactive({
    noFooterModalVisible: false,
    footerModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const currYear = dayjs().year();
  //时间弹窗
  const datePop = reactive({
    visible: false,
    dateType: '',
    currentDate: [],
    currentTime: [],
    minDate: new Date(currYear - 100, 0, 1),
    maxDate: new Date(currYear + 100, 12, 32),
    columnsType: [],
  });
  const positionVal = ref(-1);
  const positionList = ref<Record<number, string>[]>([]);
  /**
   * 日期时间弹窗
   */
  const onDateClickPop = () => {
    datePop.visible = true;
    datePop.dateType = 'datetime';
    datePop.columnsType = ['hour', 'minute'];
    let dateVal = trackInfo.value.FormatRDT;
    if (datePop.dateType === 'date') {
      datePop.currentDate = dateVal.split('-');
    } else if (datePop.dateType === 'time') {
      datePop.currentTime = dateVal.split(':');
    } else {
      const strs = dateVal.split(' ');
      if (strs.length > 0) datePop.currentDate = strs[0].split('-');
      if (strs.length > 1) datePop.currentTime = strs[1].split(':');
    }
    console.log(datePop);
  };

  const onConfirmDate = ({ selectedValues }) => {
    let val = '';
    if (datePop.dateType === 'date') val = selectedValues.join('-');
    else if (datePop.dateType === 'time') val = selectedValues.join(':');
    else val = `${datePop.currentDate.join('-')} ${datePop.currentTime.join(':')}`;
    trackInfo.value.FormatRDT = val;
    datePop.visible = false;
  };

  const onSignError = (e) => {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    //获取代理路径
    const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    // writeImg.value = basicPath + `/DataUser/Siganture/${WebUser.No}.jpg` + '?t=' + Math.random();
    const img = e.srcElement;
    img.src = basicPath + '/DataUser/Siganture/Siganture.jpg';
    img.onerror = null;
  };

  const InitPage = async () => {
    trackInfo.value = props.track;
    dblist.value = trackInfo.value.aths || [];
    positionList.value = [];
    positionVal.value = parseInt(GetPara(trackInfo.value.Tag, 'FWCView') || '-1');
    const str = props.frmWorkCheck.FWCView || '';
    if (!!str) {
      if (str.includes('@')) {
        str
          .trim()
          .split('@')
          .forEach((item) => {
            if (!!item) {
              const strs = item.split('=');
              if (strs.length == 2)
                positionList.value.push({
                  value: parseInt(strs[0]),
                  text: strs[1],
                });
            }
          });
      } else {
        str
          .trim()
          .split(',')
          .forEach((item, index) => {
            positionList.value.push({
              value: index,
              text: item,
            });
          });
      }
    }
    //仅显示自己的审核意见
    if (parseInt(props.frmWorkCheck.FWCMsgShow) == 1 && trackInfo.value.NodeID == props.params.FK_Node && trackInfo.value.IsDoc == false) {
      isShow.value = false;
      return;
    }
    //当前审核信息是否可编辑
    const isDoc = typeof trackInfo.value.IsDoc === 'boolean' ? trackInfo.value.IsDoc : parseInt(trackInfo.value.IsDoc) === 1;
    if (isDoc && props.isReadonly == false) isEdit.value = true;

    if (CommonConfig.IsShowWorkCheckUsefulExpres && isEdit.value) {
      const ens = new BSEntities('BP.Sys.FastInputs');
      //await ens.Init(); 这里会加载所有数据，耗时
      const data = await ens.DoMethodReturnJSON('InitData_Flow');
      console.log(data);
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      const dataMsg = JSON.parse(JSON.stringify(data));
      state.tags = dataMsg;
      console.log(state.tags);
    }

    //处理显示的节点名称
    trackInfo.value.NodeName = trackInfo.value.NodeName.replace('(会签)', '<br>(<span style="color:Gray">会签</span>)');
    //处理审核意见
    let msg = trackInfo.value.Msg || '';
    msg = msg.replace(/<BR>/g, '\t\n');
    msg = msg.replace(/协作发送WorkCheck@/g, '');

    if (msg.includes('WorkCheck@') == true) {
      const val = msg.split('WorkCheck@');
      if (val.length == 2) msg = val[1];
    }
    workCheckDoc.value = msg;
    SaveWorkCheck(true);
    msg = (trackInfo.value.ActionType == 2 || trackInfo.value.ActionType == 201 ? '退回原因：' : '') + msg;
    trackInfo.value.Msg = msg;
    //处理审核人
    trackInfo.value.Checker = trackInfo.value.EmpFromT;
    trackInfo.value.Img = '';
    //图片签名
    if (props.frmWorkCheck.SigantureEnabel == 1) {
      let handler = new HttpHandler('BP.WF.HttpHandler.WF');
      if (WebUser.CCBPMRunModel == 2) handler = new HttpHandler('BP.Cloud.HttpHandler.App');

      handler.AddPara('No', trackInfo.value.EmpFrom);
      const data = await handler.DoMethodReturnString('HasSealPic');
      if (typeof data === 'string' && data.length > 0) {
        trackInfo.value.Checker = data;
      } else {
        //存在签名图片
        if (WebUser.CCBPMRunModel == 2)
          trackInfo.value.Img =
            (CommonConfig.UserICon.includes('http') ? '' : '/api') + '/' + CommonConfig.UserICon + '/' + WebUser.OrgNo + '/' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt;
        else trackInfo.value.Img = (CommonConfig.UserICon.includes('http') ? '' : '/api') + '/' + CommonConfig.UserICon + '/' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt;
      }
    }
    //写字板
    if (props.frmWorkCheck.SigantureEnabel == 2) {
      //不可编辑
      if (isEdit.value == false) {
        if (!!trackInfo.value.WritImg) trackInfo.value.Img = trackInfo.value.WritImg;
      }
      //可编辑
      if (isEdit.value == true) {
        if (!!trackInfo.value.WritImg) trackInfo.value.Img = trackInfo.value.WritImg;
        else {
          //根据当前人的图片签名转成签字版图片
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          handler.AddPara('src', 'Siganture\\' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt);
          const data = await handler.DoMethodReturnString('ImageDatabytes');
          if (typeof data === 'string' && !!data && data.includes('err@') == false) trackInfo.value.Img = 'data:image/png;base64,' + data;
        }
        if (trackInfo.value.Img == '') {
          const { VITE_GLOB_API_URL } = getAppEnvConfig();
          //获取代理路径
          const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
          //默认签字版图片
          writeImg.value = basicPath + '/DataUser/Siganture/Siganture.jpg';
        } else {
          writeImg.value = trackInfo.value.Img;
        }
      }
    }
    //处理审核时间
    const rdt = trackInfo.value.RDT || '';
    if (parseInt(props.frmWorkCheck.IsChangeFWCTime) === 1 && isEdit.value) {
      if (!!rdt) trackInfo.value.FormatRDT = dayjs(rdt).format('YYYY-MM-DD HH:mm');
      else trackInfo.value.FormatRDT = dayjs().format('YYYY-MM-DD HH:mm');
    } else {
      if (!!rdt) trackInfo.value.FormatRDT = dayjs(rdt).format('YYYY-MM-DD HH:mm');
      else trackInfo.value.FormatRDT = dayjs().format('YYYY-MM-DD HH:mm');
    }

    // if (props.frmWorkCheck.FWCAth != 0) {
    await GetWorckCheckAth();
    // }
    //可编辑且启用附件的时候获取附件属性
    if (isEdit.value && props.frmWorkCheck.FWCAth == 1) {
      const mypk = 'ND' + props.params.FK_Node + '_FrmWorkCheck';
      ath.value = new FrmAttachment(mypk);
      await ath.value?.RetrieveFromDBSources();
      actionURL.value =
        REQUEST_UPLOAD_URL +
        '?AttachPK=' +
        ath.value.MyPK +
        '&FK_FrmAttachment=' +
        ath.value.MyPK +
        '&FrmID=' +
        ath.value.FK_MapData +
        '&DoType=MoreAttach&' +
        GetParamsUrl(props.params) +
        '&PKVal=' +
        props.params.WorkID;
    }
  };

  const customRequest = async (data) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FK_FrmAttachment', ath.value.MyPK);
    handler.AddPara('AttachPK', ath.value.MyPK);
    handler.AddPara('FrmID', ath.value.FK_MapData);
    handler.AddJson(props.params);
    handler.AddPara('PKVal', props.params.WorkID);
    handler.AddFile(data.file);
    handler.AddPara('OrgNo', WebUser.OrgNo);
    const result = await handler.DoMethodReturnString('MoreAttach');
    if (typeof result === 'string' && result.includes('err@')) {
      message.error(result);
      return;
    }
    await GetWorckCheckAth();
  };
  const GetWorckCheckAth = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', props.params.WorkID);
    handler.AddPara('FK_Node', trackInfo.value.NodeID);
    if (!!trackInfo.value.Exer && trackInfo.value.Exer.includes(',')) {
      const exer = trackInfo.value.Exer.split(',')[0];
      handler.AddPara('Exer', exer);
    } else handler.AddPara('Exer', WebUser.No);
    const data = await handler.DoMethodReturnString('WorkCheck_GetNewUploadedAths');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data);
      return;
    }
    const result = JSON.parse(JSON.stringify(data));
//    debugger;
    if (parseInt(props.frmWorkCheck.FWCMsgShow) == 1) dblist.value = result.filter((item) => item.Rec === WebUser.No);
    else dblist.value = result;
  };

  //常用短语
  interface state {
    tags: Array<Object>;
    inputVisible: Boolean;
    inputValue: Object;
  }
  const state: state = reactive({
    tags: [],
    inputVisible: false,
    inputValue: {},
  });
  //获取tag内容  点击常用短语切换从表默认值
  const getTag = (tag) => {
    console.log(tag);
    if (tag !== '') {
      workCheckDoc.value = tag;
      SaveWorkCheck(true);
    }
  };
  const IsShow = () => {
    isHideMsg.value = !isHideMsg.value;
  };
  const isHideMsg = ref(false);
  const OpenUseExpresFlow = () => {
    modal.footerModalVisible = true;
    modal.modalTitle = '审批常用短语';
    modal.modalType = 'UsefulExpresFlow';
    modal.modalHeight = {
      height: window.innerHeight * 0.6 + 'px',
    };
  };
  const selectData = shallowRef<InstanceType<typeof UsefulExpresFlow>>();
  const handleOk = async () => {
    console.log(selectData.value?.tableData);
    const ens = selectData.value!.tableData;
    for (let i = 0; i < ens.length; i++) {
      const en = ens[i];
      const en1 = new BSEntity('BP.Sys.FastInput', en.MyPK);
      en1.setVal('Vals', en.Vals);
      en1.setVal('CfgKey', 'Flow');
      en1.setVal('FK_Emp', WebUser.No);
      await en1.Update();
    }
    const data = selectData.value?.getSelectRows();
    data?.forEach((item) => {
      if (item.Vals != '') {
        workCheckDoc.value += item.Vals + '\r\n';
      }
    });
    selectData.value?.clearSelectedRowKeys();
    modal.footerModalVisible = false;
    InitPage();
  };

  //签字版
  const DoHandWriting = () => {
    modal.noFooterModalVisible = true;
    modal.modalTitle = '手写签名';
    modal.modalType = 'HandWriting';
    modal.modalHeight = {
      height: window.innerHeight * 0.7 + 'px',
    };
  };
  //改变签名
  const ChangeWriteImg = (imgSrc) => {
    writeImg.value = imgSrc;
    modal.noFooterModalVisible = false;
  };
  /**
   * 附件上传
   * @param info
   */
  const handleChange = async (info: UploadChangeParam) => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      await GetWorckCheckAth();
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败.`);
    }
  };

  /**
   * 下载文件
   * @param record
   * @constructor
   */
  const DownLoadAth = async (record) => {
    const url = ref('');
    url.value = GetFileUrl(record.MyPK);
    downloadByUrl({ url: url.value });
    await GetWorckCheckAth();
  };
  function GetFileUrl(mypk) {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    const apiPath = '/WF/Comm/ProcessRequest';
    return (
      prefix +
      apiPath +
      '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
      props.params.WorkID +
      '&FK_Node=' +
      props.params.FK_Node +
      '&MyPK=' +
      mypk +
      '&Token=' +
      WebUser.Token
    );
  }
  /**
   * 删除文件
   * @param record
   * @constructor
   */
  const DeleteAth = async (record) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('DelPKVal', record.MyPK);
    const data = await handler.DoMethodReturnString('AttachmentUpload_Del');
    if (typeof data == 'string' && data.includes('err@') == true) {
      message.error(data.replace('err@', ''));
      return;
    }
    await InitPage();
  };
  /**
   * 保存审核组件
   * @param isSave
   * @constructor
   */
  const SaveWorkCheck = async (isSave) => {
    if (isEdit.value == false) return true;
    //如果只保存,
    if (isSave) {
      if ((props.frmWorkCheck.SigantureEnabel == 0 || props.frmWorkCheck.SigantureEnabel == 1) && workCheckDoc.value === '') return true;
      //签名-写字板
      if (props.frmWorkCheck.SigantureEnabel == 2 && workCheckDoc.value === '' && writeImg.value === '') return true;
    } else {
      //审核立场是否启用，且是否选择
      if (Array.isArray(positionList.value) && positionList.value.length > 0) {
        console.log('positionVal.value', positionVal.value);
        if (positionVal.value == -1) {
          showFailToast('请选择您的审核立场.');
          return false;
        }
      }
      if ((props.frmWorkCheck.SigantureEnabel == 0 || props.frmWorkCheck.SigantureEnabel == 1) && workCheckDoc.value === '') {
        showFailToast('请填写审核意见');
        return false;
      }
      //签名-写字板
      if (props.frmWorkCheck.SigantureEnabel == 2 && workCheckDoc.value === '' && (writeImg.value === '' || writeImg.value.includes('Siganture.jpg'))) {
        showFailToast('请填写审核意见或者签字');
        return false;
      }
    }
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      const Doc = workCheckDoc.value.replaceAll("'", '');
      handler.AddJson(props.params);
      handler.AddPara('HandlerName', 'My_FlowGener');
      handler.AddPara('Doc', Doc);
      if (parseInt(props.frmWorkCheck.IsChangeFWCTime) === 1) handler.AddPara('CheckTime', trackInfo.value.FormatRDT);
      if (props.frmWorkCheck.SigantureEnabel == 2) {
        handler.AddPara('WriteImg', encodeURIComponent(writeImg.value));
      }
      handler.AddPara('FWCView', positionVal.value);
      const data = await handler.DoMethodReturnString('WorkCheck_Save');
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return false;
      }
      return true;
    } catch (e) {
      showFailToast(e as string);
      return false;
    }
  };
  //获取图片签名路径
  const getSiganTureImg = (EmpFrom) => {
    if (WebUser.CCBPMRunModel == 2) {
      return baseGlobPath + CommonConfig.UserICon + '/' + WebUser.OrgNo + '/' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt + '?t=' + Math.random();
    } else {
      return baseGlobPath + CommonConfig.UserICon + '/' + EmpFrom + CommonConfig.UserIConExt + '?t=' + Math.random();
    }
  };
  const defaultImg = (event) => {
    const img = event.srcElement; // 刚开始是以参数的形式定义的，但是默认的图片一直不能使用，遂改为此方式
    img.src = baseGlobPath + CommonConfig.UserICon + '/UnName' + CommonConfig.UserIConExt + '?t=' + Math.random(); // 默认一张图片。若是public中的图片，直接 ./ 就可以
    img.onerror = null; // 若默认的图片地址亦无法正常使用，添加此可控制不一直跳动
  };
  InitPage();
  defineExpose({ SaveWorkCheck });
</script>
<style scoped>
  /* :deep(input) {
    width: 100%;
  }
  :deep(.ant-table-row.ant-table-row-level-0 td) {
    background: #fafafa;
  } */
</style>
