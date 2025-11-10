<template>
  <div v-if="isShow">
    <div v-if="myTrack != null" style="border: 1px solid #d9d9d9; padding: 10px; margin-bottom: 10px">
      <Row>
        <template v-if="props.isShowNodeName">
          <!-- <Col :span="6">
            <p style="font-weight: 600; font-size: 14px; color: #6d6969" v-html="trackInfo.NodeName"></p>
          </Col> -->
          <!--审核立场-->
          <Col v-if="Array.isArray(positionList) && positionList.length > 0" :span="24" style="text-align: right">
            <span style="margin-right: 20px; font-weight: 600; cursor: pointer">审核立场:</span>
            <RadioGroup class="frmStyleType" v-model:value="positionVal" :disabled="isEdit == false">
              <Radio v-for="item in positionList" :key="item.value" :value="item.value"> {{ item.label }}</Radio>
            </RadioGroup>
          </Col>
        </template>
        <Col :span="24">
          <Textarea
            v-model:value="workCheckDoc"
            placeholder="内容不能为空,请输入信息,或者使用常用短语选择,内容不超过2000字."
            :rows="3"
            style="width: 100%; border: none"
            @blur="SaveWorkCheck(true)"
          />
        </Col>
        <!--显示常用短语-->
        <Col :span="24" style="margin-top: 20px; display: flex; align-items: center">
          <!-- <template> -->
          <!-- 快速录入 -->
          <div style="margin-right: 20px; cursor: pointer" @click="IsShow">
            <menu-fold-outlined v-if="isHideMsg" class="trigger" />
            <menu-unfold-outlined v-else class="trigger" />
            {{ isHideMsg ? '展开' : '收起' }}
          </div>
          <div v-if="isHideMsg == false" style="display: flex; align-items: center; flex-wrap: wrap; width: 60%">
            <template v-for="tag in state.tags" :key="tag.MyPK">
              <Tag v-if="tag.Vals" color="processing" style="cursor: pointer; white-space: normal" @click="getTag(tag.Vals)">
                {{ tag.Vals }}
              </Tag>
            </template>
            <div style="float: left; cursor: pointer; margin-right: 20px; color: #3a64fe" @click="OpenUseExpresFlow">修改 </div>
          </div>
          <!-- </template> -->
          <div style="margin-left: auto; text-align: right">
            <template v-if="isEdit">
              <!-- 当前节点 -->
              <template v-if="props.frmWorkCheck.SigantureEnabel === 2">
                <!-- 可编辑的写字板 -->
                <img :src="writeImg" @click="DoHandWriting" style="display: inline; height: 40px" @error="onSignError" />
              </template>
              <!-- 图片签名 -->
              <template v-else-if="props.frmWorkCheck.SigantureEnabel === 1">
                <img :src="getSiganTureImg(trackInfo.EmpFrom)" :onerror="defaultImg" style="display: inline; height: 40px" />
              </template>
              <!-- 不签名 -->
              <template v-else-if="props.frmWorkCheck.SigantureEnabel === 0">
                {{ trackInfo.Checker }}
              </template>
              <!-- 暂不实现 -->
              <template v-else> {{ trackInfo.Checker }} </template>
            </template>
            <span style="margin-left: 10px">
              <template v-if="parseInt(props.frmWorkCheck.IsChangeFWCTime) === 1 && isEdit">
                <DatePicker
                  v-model:value="trackInfo.FormatRDT"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  style="width: 160px"
                  :getPopupContainer="
                    (triggerNode) => {
                      return triggerNode.parentNode || document.body;
                    }
                  "
                  class="frmStyleType"
                />
              </template>
              <template v-else>{{ trackInfo.FormatRDT }}</template>
            </span>
          </div>
        </Col>
        <template v-if="props.frmWorkCheck.FWCAth === 1">
          <!--附件上传及显示-->
          <Col :span="1">附件:</Col>
          <Col :span="23">
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
              <Button type="primary"> <CloudUploadOutlined />上传 </Button>
            </Upload>
            <template v-for="db in dblist" :key="db.MyPK">
              <Button type="link" @click="DownLoadAth(db)">{{ db.FileName }}</Button>
              <CloseOutlined v-if="parseInt(db.CanDelete)" @click="DeleteAth(db)" />
            </template>
          </Col>
        </template>
      </Row>
    </div>
    <div v-if="Array.isArray(trackLists) && trackLists.length > 0" class="review_cont">
      <Timeline mode="left">
        <TimelineItem v-for="trackItem in trackLists" :key="trackItem.MyPK" style="width: 100%">
          <template #dot>
            <!--  发送 - 协作 - 抄送 -->
            <CheckCircleFilled
              v-if="
                trackItem.ActionType == ActionType.Forward ||
                trackItem.ActionType == ActionType.TeampUp ||
                trackItem.ActionType == ActionType.CC ||
                trackItem.ActionType == ActionType.Shift ||
                trackItem.ActionType == ActionType.Skip ||
                trackItem.ActionType == ActionType.HuiQian ||
                trackItem.ActionType == ActionType.RebackOverFlow ||
                (trackItem.ActionType == ActionType.FlowOver && trackItem.Msg != '流程结束')
              "
              style="color: #8dd000"
            />
            <!-- 未审批 -->
            <MinusCircleOutlined v-else-if="trackItem.ActionType == '' || trackItem.ActionType == null" style="color: #aeaeae" />
            <!-- 审核意见 -->
            <CheckCircleOutlined v-else-if="trackItem.ActionType == ActionType.WorkCheck" />
            <!-- 退回 -->
            <CloseCircleOutlined v-else-if="trackItem.ActionType == ActionType.Return || trackItem.ActionType == ActionType.ReturnAndBackWay" style="color: red" />
            <!-- 撤销 -->
            <UndoOutlined v-else-if="trackItem.ActionType == ActionType.UnSend" style="color: red" />
            <!-- 流程结束 -->
            <StopOutlined v-else-if="trackItem.ActionType == ActionType.FlowOver && trackItem.Msg === '流程结束'" style="color: #7f7f7f" />
            <!-- 子线程前进 -->
            <StepForwardOutlined v-else-if="trackItem.ActionType == ActionType.SubThreadForward" style="color: #8dd000; font-size: 18px" />
            <!-- 合流前进 -->
            <FastForwardOutlined v-else-if="trackItem.ActionType == ActionType.ForwardHL" style="color: #8dd000; font-size: 18px" />
          </template>
          <template v-if="props.isShowNodeName" #label>
            <p style="font-weight: 600; font-size: 12px; margin-top: 5px">
              <template v-if="!!trackItem.NodeName">
                {{ trackItem.NodeName }}:
                <span v-if="trackItem.ActionType === ActionType.CC" class="Examine"> 传阅 </span>
                <span v-else-if="trackItem.ActionType == ActionType.Forward && trackItem.NodeID.toString().endsWith('01')" class="Examine wrap">起草</span>
                <span v-else class="Examine"> 审批 </span>
              </template>
            </p>
          </template>
          <Row style="display: flex; flex-direction: column" flexFlow="unset">
            <Col :span="21" style="width: 100%; border: 1px solid #d9d9d9; padding: 10px; border-radius: 5px" :class="trackStyle + '_' + trackItem.ActionType">
              <div style="margin-left: auto; margin-bottom: 10px; font-size: 12px">
                <template v-if="trackItem.EmpFromT">
                  <span>
                    <template v-if="trackItem.SigantureEnabel === 0">
                      <template v-if="trackItem.ActionType == ActionType.Forward && trackItem.NodeID.toString().endsWith('01')"> 提交人: </template>
                      <template v-else-if="trackItem.ActionType === ActionType.CC">传阅人: </template>
                      <template v-else>审批人:</template>
                      {{ trackItem.EmpFromT }}
                    </template>
                    <template v-else-if="trackItem.SigantureEnabel === 1">
                      <img :src="getSiganTureImg(trackItem.EmpFrom)" style="display: inline; height: 40px" :onerror="defaultImg" />:
                    </template>
                    <template v-else-if="trackItem.SigantureEnabel === 2"> <img :src="trackItem.WritImg" style="display: inline; height: 40px" /></template>
                    <template v-else> {{ trackItem.EmpFromT }} </template>
                  </span>
                  <span
                    v-if="trackItem.ActionType === ActionType.Forward || (trackItem.ActionType == ActionType.FlowOver && trackItem.Msg != '流程结束')"
                    style="color: #8dd000"
                    class="NodeNameStyle"
                  >
                    <template v-if="trackItem.NodeID.toString().endsWith('01')"> 提交 </template>
                    <template v-else> 通过</template>
                  </span>
                  <span v-else-if="trackItem.ActionType === ActionType.Return || trackItem.ActionType === ActionType.ReturnAndBackWay" style="color: red" class="NodeNameStyle">
                    退回</span
                  >
                  <span v-else-if="trackItem.ActionType === ActionType.WorkCheck" style="color: #8dd000" class="NodeNameStyle"> 审核意见</span>
                  <span v-else-if="trackItem.ActionType === ActionType.CC" style="color: #ff9f50" class="NodeNameStyle"> 传阅</span>
                  <span v-else-if="trackItem.ActionType === ActionType.TeampUp" style="color: #8dd000" class="NodeNameStyle"> 协作</span>
                  <span v-else-if="trackItem.ActionType === ActionType.RebackOverFlow" style="color: #ff9f50" class="NodeNameStyle"> 回滚</span>
                  <span v-else-if="trackItem.ActionType === ActionType.ForwardFL" style="color: #8dd000" class="NodeNameStyle"> 分流前进</span>
                  <span v-else-if="trackItem.ActionType === ActionType.ForwardHL" style="color: #8dd000" class="NodeNameStyle"> 合流前进</span>
                  <span v-else-if="trackItem.ActionType === ActionType.SubThreadForward" style="color: #8dd000" class="NodeNameStyle"> 子线程前进</span>
                  <span v-else-if="trackItem.ActionType === ActionType.Shift" style="color: #8dd000" class="NodeNameStyle"> 移交</span>
                  <span v-else-if="trackItem.ActionType === ActionType.Skip" style="color: #8dd000" class="NodeNameStyle"> 跳转</span>
                  <span v-else-if="trackItem.ActionType === ActionType.UnSend" style="color: red" class="NodeNameStyle"> 撤销发送</span>
                  <span v-else-if="trackItem.ActionType === ActionType.HuiQian" style="color: #8dd000" class="NodeNameStyle"> 加签</span>
                  <span v-else-if="trackItem.ActionType == ActionType.FlowOver && trackItem.Msg === '流程结束'" style="color: #c0c0c0" class="NodeNameStyle"> 流程结束</span>
                  <span v-else-if="trackItem.ActionType == '' && trackItem.Msg == '审批中'" style="color: #7f7f7f" class="NodeNameStyle"> 处理中</span>
                  <span v-else-if="trackItem.ActionType == ''" style="color: #7f7f7f" class="NodeNameStyle"> 未开始</span>
                </template>
              </div>
              <Col :span="24">
                <template v-if="trackItem.ActionType === ActionType.Return || trackItem.ActionType === ActionType.ReturnAndBackWay">
                  <div>退回给{{ trackItem.EmpToT }}</div>
                </template>
                <template v-if="trackItem.ActionType === ActionType.Shift">
                  <div style="color: blue">移交给{{ trackItem.EmpToT }}</div>
                </template>
                <template v-if="trackItem.ActionType === ActionType.CC">
                  <template v-if="Array.isArray(trackItem?.cclist) && trackItem?.cclist.length > 0">
                    <template v-for="trackCC in trackItem?.cclist" :key="trackCC.MyPK">
                      <li style="list-style: disc; margin-left: 15px"> {{ trackCC.CCToName }}-{{ trackCC.StaText }},</li>
                    </template>
                  </template>
                  <template v-else>未传阅</template>
                </template>
                <template v-if="trackItem.ActionType != ActionType.CC">
                  <template v-if="trackItem.ActionType === ActionType.RebackOverFlow"> 回滚原因：{{ trackItem.Msg }} </template>
                  <template v-else>{{ trackItem.Msg }} </template>
                </template>
                <template v-if="!!trackItem.FWCMsg"
                  ><p class="fwcMsg">审核立场：{{ trackItem.FWCMsg }}</p></template
                >
              </Col>
              <!--显示常用短语-->
              <Col :span="24" style="margin-top: 20px; display: flex; align-items: center">
                <div style="margin-left: auto; text-align: right">
                  <span>{{ trackItem.RDT }}</span>
                  <div v-if="!trackItem.NodeID.toString().endsWith('01') && trackItem.HS">
                    <template v-if="trackItem.ActionType === ActionType.CC">
                      <template v-for="trackCC in trackItem?.cclist" :key="trackCC.MyPK">
                        <div v-if="trackCC.Sta == 1"> {{ trackCC.CCToName }} - 耗时:{{ dwellTime(trackCC.ReadDT, trackCC.RDT) }},</div>
                      </template>
                    </template>
                    <template v-else> 耗时:{{ trackItem.HS }} </template>
                  </div>
                </div>
              </Col>
            </Col>
            <template v-if="Array.isArray(dblists) && !!trackItem.FWCAth">
              <!-- 附件上传及显示 -->
              <div style="display: flex">
                <Col :span="2">附件:</Col>
                <Col :span="22">
                  <template v-for="db in dblists" :key="db.MyPK">
                    <template v-if="db.NodeID == trackItem.NodeID && trackItem?.Exer.includes(db.Rec)">
                      <Button type="link" @click="DownLoadAth(db)">{{ db.FileName }}</Button>
                      <CloseOutlined v-if="!!parseInt(db.CanDelete)" @click="DeleteAth(db)" />
                    </template>
                  </template>
                </Col>
              </div>
            </template>
          </Row>
        </TimelineItem>
      </Timeline>
    </div>
    <Modal v-model:open="modal.footerModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" @ok="handleOk">
      <GenerList :params="{ EnName: 'GL_WorkcheckWorks', FlowNo: props.params?.FK_Flow, WorkID: props.params?.WorkID }" />
    </Modal>
    <Modal v-model:open="modal.noFooterModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null">
      <HandWriting v-if="modal.modalType === 'HandWriting'" :imageSrc="trackInfo.Img" @ChangeWriteImg="ChangeWriteImg" writingType="WorkCheck" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { message, Row, Col, Modal, Textarea, Upload, Button, UploadChangeParam, Tag, Timeline, TimelineItem, DatePicker, RadioGroup, Radio } from 'ant-design-vue';
  import {
    CloudUploadOutlined,
    CloseOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CheckCircleOutlined,
    UndoOutlined,
    MinusCircleOutlined,
    CheckCircleFilled,
    StopOutlined,
    CloseCircleOutlined,
    StepForwardOutlined,
    FastForwardOutlined,
  } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue';
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
  import { ActionType } from '/@/WF/WorkOpt/OneWork/ActionType';
  import { CCLists } from '/@/WF/TSClass/FlowData/CCList';
  import GenerList from '/@/WF/views/GenerList.vue';
  import Event from '/@/utils/Events';
  const props = defineProps({
    frmWorkCheck: {
      type: Object,
      default: () => {},
    },
    trackList: {
      type: Object as PropType<Array<Recordable>>,
      default: () => {
        return [];
      },
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    myTrack: {
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
  //数组集合
  const trackLists = ref<Recordable[]>([]);

  //附件信息
  const dblist = ref();
  const dblists: any = ref([]);
  const ath = ref<FrmAttachment>({});
  const actionURL = ref('');
  const trackStyle = ref('TrackStyle');

  const positionVal = ref(-1);
  const positionList = ref<Record<number, string>[]>([]);

  //弹窗显示
  const modal = reactive({
    noFooterModalVisible: false,
    footerModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
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
    trackInfo.value = props.myTrack || {};
    // let nodeIDs = '';
    // props.trackList.forEach((item) => {
    //   if (nodeIDs.includes(item.NodeID + ',') == false || !item.NDFrom || item.ActionType === ActionType.CC || (item.ActionType === ActionType.FlowOver && item.NDFrom)) {
    //     nodeIDs += item.NodeID + ',';
    //     trackLists.value.push(item);
    //   }
    // });
    trackLists.value = props.trackList;
    positionList.value = [];
    positionVal.value = parseInt(GetPara(trackInfo.value.Tag, 'FWCView') || '-1');
    const str = props.frmWorkCheck.FWCView || '';
    if (!!str) {
      if (str.includes('@')) {
        str.split('@').forEach((item) => {
          if (!!item) {
            const strs = item.split('=');
            if (strs.length == 2)
              positionList.value.push({
                value: parseInt(strs[0]),
                label: strs[1],
              });
          }
        });
      } else {
        str.split(',').forEach((item, index) => {
          positionList.value.push({
            value: index,
            label: item,
          });
        });
      }
    }
    // for (let trackNode of trackLists.value) {
    dblist.value = trackInfo.value?.aths || [];
    // }
    if (!!props.myTrack) {
      isShow.value = true;
      isEdit.value = true;
    }
    const cc = new CCLists();
    await cc.Retrieve('WorkID', props.params.WorkID);
    trackLists.value.forEach((track) => {
      if (track.ActionType === ActionType.CC) {
        track.cclist = cc.filter((item) => item.Sta != -1 && item.NodeIDCC.toString() === track.NDTo.toString() && item.NodeIDWork.toString() === track.NDFrom.toString());
        if (track.Msg === '未审批') {
          const cclist = cc.filter((item) => item.NodeIDCC === track.NodeID);
          let empName = '';
          cclist.forEach((item) => (empName += item.CCToName + ','));
          track.EmpFromT = empName;
          track.ActionType = '';
        }
      }
    });
    console.log('props.trackList', props.trackList);
    if (CommonConfig.IsShowWorkCheckUsefulExpres) {
      const ens = new BSEntities('BP.Sys.FastInputs');
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
    if (trackInfo.value?.NodeName) {
      trackInfo.value.NodeName = trackInfo.value?.NodeName.replace('(会签)', '<br>(<span style="color:Gray">会签</span>)');
    }
    //处理审核意见
    let msg = trackInfo.value?.Msg || '';
    msg = msg.replace(/<BR>/g, '\t\n');
    msg = msg.replace(/协作发送WorkCheck@/g, '');

    if (msg.includes('WorkCheck@') == true) {
      const val = msg.split('WorkCheck@');
      if (val.length == 2) msg = val[1];
    }
    workCheckDoc.value = msg;
    SaveWorkCheck(true);
    msg = (trackInfo.value?.ActionType == 2 || trackInfo.value?.ActionType == 201 ? '退回原因：' : '') + msg;
    trackInfo.value.Msg = msg;
    //处理审核人
    trackInfo.value.Checker = trackInfo.value?.EmpFromT;
    trackInfo.value.Img = '';
    //图片签名
    if (props.frmWorkCheck.SigantureEnabel == 1) {
      let handler = new HttpHandler('BP.WF.HttpHandler.WF');
      if (WebUser.CCBPMRunModel == 2) handler = new HttpHandler('BP.Cloud.HttpHandler.App');
      handler.AddPara('No', trackInfo.value?.EmpFrom);
      const data = await handler.DoMethodReturnString('HasSealPic');
      if (typeof data === 'string' && data.length > 0) {
        trackInfo.value.Checker = data;
      } else {
        //存在签名图片
        if (WebUser.CCBPMRunModel == 2) trackInfo.value.Img = baseGlobPath + CommonConfig.UserICon + '/' + WebUser.OrgNo + '/' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt;
        else trackInfo.value.Img = baseGlobPath + CommonConfig.UserICon + '/' + trackInfo.value.EmpFrom + CommonConfig.UserIConExt;
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
        const { VITE_GLOB_API_URL } = getAppEnvConfig();
        //获取代理路径
        const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
        writeImg.value = basicPath + `/DataUser/Siganture/${WebUser.No}.jpg`;
        if (!!trackInfo.value.WritImg) trackInfo.value.Img = trackInfo.value.WritImg;
        // else {
        //根据当前人的图片签名转成签字版图片
        // const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        // handler.AddPara('src', 'Siganture\\' + trackInfo.value?.EmpFrom + CommonConfig.UserIConExt);
        // const data = await handler.DoMethodReturnString('ImageDatabytes');
        // console.log(data);
        // if (typeof data === 'string' && !!data && data.includes('err@') == false) trackInfo.value.Img = 'data:image/png;base64,' + data;
        // writeImg.value = basicPath + `/DataUser/Siganture/${WebUser.No}.jpg`;
        // }
        // if (trackInfo.value.Img == '') {
        //   //默认签字版图片
        //   writeImg.value = basicPath + '/DataUser/Siganture/Siganture.jpg';
        // } else {
        //   writeImg.value = trackInfo.value?.Img;
        // }
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
    if (isEdit.value) {
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
  const resultAth = ref();
  const GetWorckCheckAth = async () => {
    if (Array.isArray(trackLists.value) && trackLists.value.length > 0) {
      for (let trackNode of trackLists.value) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('WorkID', props.params.WorkID);
        handler.AddPara('FK_Node', trackNode.NodeID);
        if (!!trackNode.Exer && trackNode.Exer.includes(',')) {
          const exer = trackNode.Exer.split(',')[0];
          handler.AddPara('Exer', exer);
        } else handler.AddPara('Exer', WebUser.No);
        const data = await handler.DoMethodReturnString('WorkCheck_GetNewUploadedAths');
        console.log('data', data);
        if (typeof data === 'string' && data.includes('err@')) {
          message.error(data);
          return;
        }
        resultAth.value = JSON.parse(JSON.stringify(data));
        console.log(' resultAth.value', resultAth.value);
        if (!Array.isArray(dblists.value)) {
          dblists.value = [];
        }
        if (parseInt(props.frmWorkCheck.FWCMsgShow) == 1) {
          for (let item of resultAth.value.filter((item) => item.Rec === WebUser.No)) {
            dblists.value.push(item);
          }
        } else {
          for (let i = 0; i < resultAth.value.length; i++) {
            dblists.value.push(resultAth.value[i]);
            console.log(dblists.value);
          }
          //通过MyPK对dblists进行去重，避免当前审核组件添加时文件时，导致已审核过的审核组件出现重复文件
          dblists.value = dblists.value.reduce((acc, curr) => {
            if (!acc.find((item) => item.MyPK === curr.MyPK)) {
              acc.push(curr);
            }
            return acc;
          }, []);
        }
        console.log('dblists.value', dblists.value);
      }
    }

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
    // if (parseInt(props.frmWorkCheck.FWCMsgShow) == 1)
    dblist.value = result.filter((item) => item.Rec === WebUser.No);
    // else dblist.value = result;
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
      height: window.innerHeight * 0.45 + 'px',
    };
  };
  const handleOk = async () => {
    modal.footerModalVisible = false;
    InitPage();
  };

  /**
   * 抄送节点计算停留时间
   * RDT :发送时间
   * ReadDT :已读时间
   */
  const dwellTime = (readDT, rdt) => {
    let awaitTime = '';
    const duration = dayjs.duration(dayjs(readDT).diff(rdt, 'second') || 0, 'second');
    if (duration.hours() == 0 && duration.days() == 0) awaitTime = duration.format('m分钟ss秒');
    else if (duration.days() == 0) awaitTime = duration.format('H小时m分钟ss秒');
    else awaitTime = duration.format('D天H小时m分钟ss秒');
    return awaitTime;
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
          message.info('请选择您的审核立场.');
          return false;
        }
      }
      if ((props.frmWorkCheck.SigantureEnabel == 0 || props.frmWorkCheck.SigantureEnabel == 1) && workCheckDoc.value === '') {
        message.error('请填写审核意见');
        return false;
      }
      //签名-写字板
      if (props.frmWorkCheck.SigantureEnabel == 2 && workCheckDoc.value === '' && (writeImg.value === '' || writeImg.value.includes('Siganture.jpg'))) {
        message.error('请填写审核意见或者签字');
        return false;
      }
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    const Doc = workCheckDoc.value.replaceAll("'", '');
    handler.AddJson(props.params);
    handler.AddPara('HandlerName', 'My_FlowGener');
    handler.AddPara('Doc', Doc);
    handler.AddPara('FWCView', positionVal.value);
    if (props.frmWorkCheck.SigantureEnabel == 2) {
      handler.AddPara('WriteImg', encodeURIComponent(writeImg.value));
    }
    const data = await handler.DoMethodReturnString('WorkCheck_Save');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return false;
    }
    return true;
  };
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
  onMounted(async () => {
    Event.on('InitWorkCheck', async (option) => {
      workCheckDoc.value = option.note;
    });
  });
  onUnmounted(() => {
    Event.off('InitWorkCheck');
  });
  defineExpose({ SaveWorkCheck });
</script>
<style scoped lang="less">
  .review_cont {
    border: 1px solid #d9d9d9;
    padding: 15px 15px 0;
  }
  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-label) {
    width: 15%;
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-head) {
    background-color: transparent;
    left: 22%;

    &::after {
      content: '- - - - -';
      vertical-align: 2px;
      margin: 0 4px;
      color: #b7b7b7;
    }
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-left .ant-timeline-item-content) {
    left: 23%;
    width: calc(85% - 10px);
    text-align: left;
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-tail) {
    left: 19%;
  }

  .TrackStyle_1,
  .TrackStyle_3,
  .TrackStyle_8,
  .TrackStyle_13,
  .TrackStyle_21,
  .TrackStyle_27,
  .TrackStyle_28,
  .TrackStyle_30,
  .TrackStyle_26,
  .TrackStyle_,
  .TrackStyle_null {
    background-color: #fafcff;
    // #eef3ff
    border: 1px solid #578aff !important;
  }

  .TrackStyle_2,
  .TrackStyle_5,
  .TrackStyle_201 {
    border: 1px solid red !important;
    background-color: #fff1f1;
  }

  .NodeNameStyle {
    font-size: 12px;
    font-weight: 700;
  }
  .fwcMsg {
    padding: 10px 0 0;
  }
</style>
