<template>
  <div style="background-color: white; padding: 1.25rem">
    <div class="GroupBar GroupTitle" :class="GroupTitle">
      <span style="width: 100%">
        <span style="width: 100%; display: flex; justify-content: space-between">{{ '审核信息' }}</span>
      </span>
    </div>
    <div v-if="isShow">
      <div v-if="isEdit" style="border: 1px solid #d9d9d9; padding: 10px; margin-bottom: 10px">
        <Row>
          <Col :span="24">
            <Textarea v-model:value="workCheckDoc" :placeholder="'内容不能为空,请输入信息,或者使用常用短语选择,内容不超过2000字.'" :rows="3" style="width: 100%; border: none" />
          </Col>
          <!--显示常用短语-->
          <Col :span="24" style="margin-top: 20px; display: flex; align-items: center">
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
              <div style="float: left; cursor: pointer; margin-right: 20px; color: #3a64fe" @click="OpenUseExpresFlow">{{ '修改' }}</div>
            </div>
          </Col>
        </Row>
      </div>
      <div>
        <Timeline mode="left">
          <div v-if="Array.isArray(trackLists) && trackLists.length > 0" class="TrackTitle">
            <div style="width: 11%; margin-left: 6%" class="font">{{ '环节' }}</div>
            <!--//18-->
            <div style="width: 20%" class="font">{{ '审批人' }}</div>
            <!--//28-->
            <div style="width: 44%; padding-left: 3%" class="font">{{ '信息' }}</div>
            <div style="width: 26%; padding-left: 9%" class="font">{{ '完成时间' }}</div>
          </div>
          <TimelineItem v-for="trackItem in trackLists" :key="trackItem.MyPK" style="width: 100%; padding-bottom: 10px">
            <template #dot>
              <img v-if="trackItem.ActionType == 'StartFlow'" :src="SendStartCircle" width="20" alt="" />
              <img v-else-if="trackItem.ActionType == 'Check'" :src="SendSuccessCircle" width="22" alt="" />
              <img v-else-if="trackItem.ActionType == '未审批'" :src="SendCCCircle" width="20" alt="" />
              <!-- 未处理 -->
              <img v-else-if="trackItem.ActionType == '' || trackItem.ActionType == null" :src="ProceedCircle" width="20" alt="" />
              <!-- 审核意见 -->
              <img v-else-if="trackItem.ActionType == ActionType.WorkCheck" :src="ProceedCircle" width="20" alt="" />
              <!-- 退回/撤销 -->
              <img v-else-if="trackItem.ActionType == 'Return'" :src="SendBackCircle" width="20" alt="" />
              <!-- 撤销 -->
              <UndoOutlined v-else-if="trackItem.ActionType == 'UnSubmit'" style="color: red" />
              <img v-else-if="trackItem.ActionType == 'CheckOver'" :src="SendSuccessCircle" width="22" />
            </template>
            <template #label>
              <p style="font-weight: 600; font-size: 12px; text-align: right">
                <span v-if="trackItem.ActionType == 'UnSubmit'" class="font">{{ '撤销' }}</span>
                <span v-else-if="trackItem.ActionType == 'Return'" class="font">{{ '退回' }}</span>
                <span v-else-if="trackItem.ActionType == 'StartFlow'" class="font">{{ '起草' }}</span>
                <span v-else-if="trackItem.ActionType == 'CheckOver'" class="font">{{ '结束' }}</span>
                <span v-else class="font"> 审批 {{ trackItem.Step }} </span>
              </p>
            </template>
            <Row style="display: flex; flex-direction: column; margin-bottom: 10px" flexFlow="unset">
              <Col :span="21" style="width: 100%; padding: 10px; border-radius: 10px" :class="trackStyle + '_' + trackItem.ActionType">
                <div style="margin-left: auto; margin-bottom: 10px; font-size: 12px; display: flex">
                  <template v-if="trackItem.RecName">
                    <div style="width: 25%">
                      <div style="display: flex">
                        <div style="margin-left: 5px" class="cont-font">
                          <span class="cont-weight">{{ trackItem.DeptName }}</span
                          ><div>{{ trackItem.RecName }}</div></div
                        >
                      </div>
                    </div>
                    <div style="width: 44%; padding-left: 3%">
                      <span v-if="trackItem.ActionType === 'StartFlow' || trackItem.ActionType === 'CheckOver'" style="color: #007af5" class="NodeNameStyle">
                        <template v-if="trackItem.ActionType === 'StartFlow'">{{ '提交' }}</template>
                        <template v-else-if="trackItem.ActionType === 'CheckOver'">{{ '审批结束' }}</template>
                        <template v-else>{{ '通过' }}</template>
                      </span>
                      <span v-else-if="trackItem.ActionType === 'Return'" style="color: red" class="NodeNameStyle">{{ '退回' }}</span>
                      <span v-else-if="trackItem.ActionType === ActionType.WorkCheck" style="color: #007af5" class="NodeNameStyle">{{ '审核意见' }}</span>
                      <span v-else-if="trackItem.ActionType === ''" style="color: #7f7f7f" class="NodeNameStyle">{{ '未开始' }}</span>
                      <span v-else-if="trackItem.ActionType === 'UnSubmit'" style="color: red" class="NodeNameStyle">{{ '撤销发送' }}</span>
                      <span v-else-if="trackItem.ActionType === 'Reback'" style="color: #007af5" class="NodeNameStyle">{{ '回滚' }}</span>
                      <span v-else-if="trackItem.ActionType === 'CheckOver'" style="color: #c0c0c0" class="NodeNameStyle">{{ '流程结束' }}</span>
                      <span v-else-if="trackItem.ActionType == '审批中'" style="color: #7f7f7f" class="NodeNameStyle">{{ '处理中' }}</span>
                      <span v-else-if="trackItem.ActionType == ''" style="color: #7f7f7f" class="NodeNameStyle">{{ '未开始' }}</span>
                      <div>
                        <span class="cont-font">{{ trackItem.Msg }}</span>
                      </div>
                    </div>
                    <div style="width: 26%; text-align: center; padding-left: 9%" class="cont-font">{{ trackItem.RDT }}</div>
                  </template>

                  <!-- </template> -->
                </div>
              </Col>
            </Row>
          </TimelineItem>
        </Timeline>
      </div>
      <Modal v-model:open="modal.footerModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" @ok="handleOk">
        <GenerList :params="{ EnName: 'GL_WorkcheckWorks', FlowNo: props.params?.FK_Flow, WorkID: props.params?.WorkID }" />
      </Modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { message, Row, Col, Textarea, Tag, Timeline, TimelineItem, Modal } from 'ant-design-vue';
  import { MenuUnfoldOutlined, MenuFoldOutlined, UndoOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { onMounted, onUnmounted, reactive, ref, shallowRef } from 'vue';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import UsefulExpresFlow from '/@/WF/WorkOpt/UsefulExpresFlow.vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { ActionType } from '/@/WF/WorkOpt/OneWork/ActionType';
  import SendStartCircle from '/@/assets/track/TrackTime/SendStartCircle.png';
  import SendSuccessCircle from '/@/assets/track/TrackTime/SendSuccessCircle.png';
  import SendBackCircle from '/@/assets/track/TrackTime/SendBackCircle.png';
  import ProceedCircle from '/@/assets/track/TrackTime/ProceedCircle.png';
  import GenerList from '/@/WF/views/GenerList.vue';
  import { GenerBill } from '/@/CCFast/CCBill/GenerBill';
  import { FrmTracks } from '/@/CCFast/CCBill/FrmTrack';
  import { GenerWorker, GenerWorkers } from '/@/CCFast/CCBill/GenerWorker';
  import WebUser from '/@/bp/web/WebUser';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import Event from '/@/utils/Events';
  import SendCCCircle from '/@/assets/track/TrackTime/SendCCCircle.png';
  const props = defineProps({
    generBill: {
      type: Object as GenerBill,
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
  });

  //是否显示审核信息
  const isShow = ref(true);
  //当前审核意见是否可编辑
  const isEdit = ref(false);
  //可编辑的审核信息
  const workCheckDoc = ref('同意');
  //数组集合
  const trackLists = ref<Recordable[]>([]);

  const trackStyle = ref('TrackStyle');
  const GroupTitle = ref('');
  //弹窗显示
  const modal = reactive({
    noFooterModalVisible: false,
    footerModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const InitPage = async () => {
    //表单风格
    const mySetting = new MySetting(WebUser.No);
    // await mySetting.Init();
    // mySetting.No = WebUser.No;
    await mySetting.RetrieveFromDBSources();
    const No: string = (mySetting.FrmStyle || '0').toString() || '0';
    GroupTitle.value = 'defaultGroupTitle' + No;
    if (No === '0') GroupTitle.value = 'defaultGroupTitle1';
    if (No === '1') GroupTitle.value = '';
    //获取Track信息
    const tracks = new FrmTracks();
    await tracks.Retrieve('WorkID', props.params.WorkID, 'FrmID', props.params.FrmID, 'RDT');
    let index = -1;
    tracks.forEach((track) => {
      const actionType = track.ActionType;
      if (actionType === 'StartFlow' || actionType === 'Check' || actionType === 'ReturnWork' || actionType === 'UnSubmit' || actionType === 'CheckOver') {
        index++;
        trackLists.value.push({
          MyPK: track.MyPK,
          Rec: track.Rec,
          RecName: track.RecName,
          DeptNo: track.FK_Dept,
          DeptName: track.DeptName,
          ActionType: track.ActionType,
          Msg: track.Msg,
          RDT: track.RDT,
          Step: index,
        });
      }
    });
    //未处理人
    const workers = new GenerWorkers();
    if (props.generBill.BillState != 100 && props.generBill.BillState != 200) {
      //判断当前人员是否可以审核
      const worker = new GenerWorker();
      const mypk = props.params.WorkID + '_' + WebUser.No + '_' + props.generBill.CurrIdx;
      worker.MyPK = mypk;
      const i = await worker.RetrieveFromDBSources();
      if (i == 1 && worker.PassSta == 0) {
        isShow.value = true;
        isEdit.value = true;
        index++;
        trackLists.value.push({
          MyPK: worker.MyPK,
          Rec: worker.EmpNo,
          RecName: worker.EmpName,
          DeptNo: worker.DeptNo,
          DeptName: worker.DeptName,
          ActionType: '未审批',
          RDT: '',
          Step: index,
        });
      }
      if (props.generBill.CurrIdx == 0) {
        isShow.value = true;
        isEdit.value = true;
        index++;
        trackLists.value.push({
          MyPK: '',
          Rec: WebUser.No,
          RecName: WebUser.Name,
          DeptNo: WebUser.DeptNo,
          DeptName: WebUser.DeptName,
          ActionType: 'StartFlow',
          RDT: '',
          Step: index,
        });
      }
      await workers.Retrieve('WorkID', props.params.WorkID, 'FrmID', props.params.FrmID, 'Idx');
      workers.forEach((item) => {
        if (item.PassSta != 2 && item.EmpNo != WebUser.No) {
          index++;
          trackLists.value.push({
            MyPK: item.MyPK,
            Rec: item.EmpNo,
            RecName: item.EmpName,
            DeptNo: item.DeptNo,
            DeptName: item.DeptName,
            ActionType: '',
            RDT: '',
            Step: index,
          });
        }
      });
    }

    if (CommonConfig.IsShowWorkCheckUsefulExpres) {
      const ens = new BSEntities('BP.Sys.FastInputs');
      const data = await ens.DoMethodReturnJSON('InitData_Flow');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      const dataMsg = JSON.parse(JSON.stringify(data));
      state.tags = dataMsg;
    }
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
  const selectData = shallowRef<InstanceType<typeof UsefulExpresFlow>>();
  const handleOk = async () => {
    modal.footerModalVisible = false;
    InitPage();
  };
  defineExpose({ workCheckDoc });
  InitPage();
  onMounted(async () => {
    Event.on('InitFrm', async () => {
      await InitPage();
    });
  });
  onUnmounted(() => {
    Event.off('InitFrm');
  });
</script>
<style scoped lang="less">
  .header-title {
    position: relative;
    padding: 10px 12px;
    margin-bottom: 0;
    color: #000;
  }
  .header-title::before {
    content: '';
    position: absolute;
    top: 30%;
    left: -10px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: #1989fa;
  }
  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-label) {
    margin-left: -30px;
    width: 8%;
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-head) {
    background-color: transparent;
    left: 8%;

    // &::after {
    //   content: '- - - - -';
    //   vertical-align: 2px;
    //   margin: 0 8px;
    //   color: #b7b7b7;
    // }
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-left .ant-timeline-item-content) {
    left: 11%;
    width: calc(100% - 10px);
    text-align: left;
  }

  :deep(.ant-timeline.ant-timeline-label .ant-timeline-item-tail) {
    left: 8%;
  }

  .TrackStyle_StartFlow,
  .TrackStyle_Check,
  .TrackStyle_CheckOver,
  .TrackStyle_,
  .TrackStyle_null {
    background-color: #f5f5f5;
    // border: 1px solid #578aff !important;
  }

  .TrackStyle_Return,
  .TrackStyle_UnSubmit {
    border: 1px solid red !important;
    background-color: #fff1f1;
  }
  .font {
    font-size: 12px;
    color: #6c6c6c;
    font-weight: 600;
  }
  .cont-font {
    font-size: 14px;
  }
  .cont-weight {
    font-weight: 600;
  }

  .NodeNameStyle {
    font-size: 13px;
    font-weight: 600;
  }
  .TrackTitle {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
  }
  .fwcMsg {
    padding: 10px 0 0;
  }
  .GroupBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding: 10px;
    margin-bottom: 4px;
    background-color: whitesmoke;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupTitle {
    margin: 10px 0;
    border-radius: 5px;
    background-color: #e3dbd7;
  }
  .defaultGroupTitle1 {
    // padding: 5px 0;
    background-color: #f1f1f6;
    position: relative;
    &::before {
      position: absolute;
      top: 30%;
      left: 0;
      width: 3px;
      height: 16px;
      content: '';
      background-color: #5f7af9;
    }
  }
  .defaultGroupTitle2 {
    position: relative;
    border-radius: 0;
    // border-bottom: 2px solid #e3dbd7;
    // background: #fff;
    border-bottom: 2px solid #fea101;
    background: #2d2d2e;
    color: #e7ac45;
    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 5px;
      width: 25px;
      height: 30px;
      // background: linear-gradient(to right, #e6e6e6, #7ea9f0);
      background: linear-gradient(to right, #905e18, #fea101);
      transform: skew(-30deg);
    }
    & span {
      padding-left: 50px;
    }
  }
  .defaultGroupTitle3 {
    background: #fff;
  }
  .defaultGroupTitle4 {
    border-radius: 0;
    border-bottom: 1px solid #e3dbd7;
    background-color: #fff;
  }
</style>
