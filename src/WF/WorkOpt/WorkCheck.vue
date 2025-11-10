<template>
  <div class="p-1" style="padding: 0.25rem 0.25rem 4rem 0.25rem">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <template v-if="ready">
          <template v-if="displayMode == 'normalMode'">
            <div v-for="track in tracks" :key="track.MyPK">
              <WorkCheckParse
                v-if="(track.IsDoc === true || track.IsDoc === '1') && props.isReadonly === false"
                ref="workCheckParse-W"
                :track="track"
                :frmWorkCheck="frmWorkCheck"
                :params="query"
                :is-readonly="props.isReadonly"
              />

              <WorkCheckParse v-else ref="workCheckParse-R" :track="track" :frmWorkCheck="frmWorkCheck" :params="query" :is-readonly="props.isReadonly" />
            </div>
          </template>
          <template v-if="displayMode == 'trackMode'">
            <WorkCheckParseTrack
              v-if="(myTrack != null && isReadonly == false) || isReadonly === true"
              ref="workCheckParse-W"
              :track-list="trackWorks"
              :myTrack="myTrack"
              :frmWorkCheck="frmWorkCheck"
              :params="query"
              :is-readonly="props.isReadonly"
            />
            <WorkCheckParseTrack
              v-else
              ref="workCheckParse-R"
              :track-list="trackWorks"
              :myTrack="myTrack"
              :frmWorkCheck="frmWorkCheck"
              :params="query"
              :is-readonly="props.isReadonly"
            />
          </template>
          <template v-if="displayMode == 'trackTimeMode'">
            <WorkCheckParseTrackTime
              v-if="(myTrack != null && isReadonly == false) || isReadonly === true"
              ref="workCheckParse-W"
              :track-list="trackWorks"
              :myTrack="myTrack"
              :frmWorkCheck="frmWorkCheck"
              :params="query"
              :is-readonly="props.isReadonly"
            />
            <WorkCheckParseTrackTime
              v-else
              ref="workCheckParse-R"
              :track-list="trackWorks"
              :myTrack="myTrack"
              :frmWorkCheck="frmWorkCheck"
              :params="query"
              :is-readonly="props.isReadonly"
            />
          </template>
        </template>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Spin, message } from 'ant-design-vue';
  // 父组件传过来的属性
  import { getCurrentInstance, reactive, ref, watch } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import WorkCheckParse from './WorkCheckParse.vue';
  import WorkCheckParseTrack from './WorkCheckParseTrack.vue';
  import WorkCheckParseTrackTime from './WorkCheckParseTrackTime.vue';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import { ActionType } from '/@/WF/WorkOpt/OneWork/ActionType';
  import { buildUUID } from '/@/utils/uuid';
  import WebUser from '/@/bp/web/WebUser';
  import { NodeWorkCheck } from '../Admin/AttrNode/NodeWorkCheck';
  import { GetStrPara } from '/@/utils/gener/StringUtils';
import { cloneDeep } from 'lodash';
  dayjs.extend(duration);
  const props = defineProps({
    nodeInfo: {
      type: Object,
      default: () => ({}),
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
    isSave: {
      type: Boolean,
      default: false,
    },
    examineMode: {
      type: String,
      default: '',
    },
    nodeIds: {
      type: String,
      default: '',
    },
    isSignCheck: {
      type: Boolean,
      default: false,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);

  const displayMode = ref(props.examineMode);
  watch(
    () => props.examineMode,
    async (val) => {
      displayMode.value = val;
      await InitPage();
    },
  );

  // const { examineMode } = toRefs(props);
  //当前节点审核组件信息
  const frmWorkCheck = ref<Record<string, any>>({});
  //审核集合
  const tracks = ref<Record<string, any>[]>([]);
  //轨迹审核
  const trackWorks = ref<Record<string, any>[]>([]);
  const aths = ref<Record<string, any>[]>([]);
  const myTrack = ref<Record<string, any>>(null);
  const ready = ref(false);
  const isLoad = ref(false);
  const flowEndAdded = ref(false);
  //移除掉返回的流程结束数据
  const trackToRemove = ref();
  const workID = props.params.RealWorkID || props.params.WorkID;
  const query = ref(cloneDeep(props.params));
  query.value.WorkID = workID;
  const InitPage = async () => {
    try {
      ready.value = false;
      loading.value = true;
      if (query.value?.DoWhat == 'WorkCheck') {
        const NodeID = query.value.NodeID;
        const en = new NodeWorkCheck(NodeID);
        await en.RetrieveFromDBSources();
        switch (en.FWCShowModel) {
          case 0:
            displayMode.value = 'normalMode';
            break;
          case 1:
            displayMode.value = 'trackMode';
            break;
          case 2:
            displayMode.value = 'trackTimeMode';
            break;
          default:
            displayMode.value = 'normalMode';
            break;
        }
      }
      //获取审核组件的信息
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(query.value);
      handler.AddPara('IsReadonly', props.isReadonly == true ? 1 : 0);
      const data = ref();
      console.log('displayMode.value', displayMode.value);
      let result;
      if(props.nodeInfo == null){
        tracks.value = [];
        result = null;
      }else{
        if (displayMode.value === 'normalMode') {
          if (props.nodeInfo?.FWCVer == 0) data.value = await handler.DoMethodReturnString('WorkCheck_Init');
          else data.value = await handler.DoMethodReturnString('WorkCheck_Init2019');
        } else data.value = await handler.DoMethodReturnString('WorkTrack_Init');

        if (typeof data.value === 'string' && data.value.includes('err@')) {
          message.error(data.value.replace('err@', ''));
          return;
        }
        result = JSON.parse(JSON.stringify(data.value));
        frmWorkCheck.value = result.WF_FrmWorkCheck[0];
       
        if (props.isSignCheck) {
          if (!!props.nodeIds)
            tracks.value = result.Tracks.filter((item) => {
              return props.nodeIds.includes(item.NodeID + ',');
            });
          else tracks.value = [];
        } else {
          tracks.value = result.Tracks;
        }
      }
      const FWCTimeModel = parseInt(frmWorkCheck.value?.FWCTimeModel || 0);
      flowEndAdded.value = false;
      tracks.value.forEach((track, idx) => {
        let msg = track.Msg || '';
        msg = msg.replace(/<BR>/g, '\t\n');
        msg = msg.replace(/协作发送WorkCheck@/g, '').replace(/多人接收(见信息栏)WorkCheck@/g, '');
        if (msg.includes('WorkCheck@') == true) {
          const val = msg.split('WorkCheck@');
          if (val.length == 2) msg = val[1];
        }
        track.Msg = msg;
        //倒序
        if (FWCTimeModel == 0) {
          //停留时间 当前track-下一个track
          if (track.NodeID.toString().endsWith('01') == false && idx < tracks.value.length - 1) {
            if (!track.RDT) track.HS = '';
            else {
              if (track.ActionType === ActionType.Shift) track.HS = '0秒';
              else {
                const duration = dayjs.duration(dayjs(track.RDT).diff(tracks.value[idx + 1].RDT, 'second') || 0, 'second');
                if (duration.hours() == 0 && duration.days() == 0) track.HS = duration.format('m分钟ss秒');
                else if (duration.days() == 0) track.HS = duration.format('H小时m分钟ss秒');
                else track.HS = duration.format('D天H小时m分钟ss秒');
              }
            }
          }
        }
        //正序
        if (FWCTimeModel == 1) {
          //停留时间 当前track-上一个track
          if (track.NodeID.toString().endsWith('01') == false && idx > 0) {
            if (!track.RDT) track.HS = '';
            else {
              if (track.ActionType === ActionType.Shift) track.HS = '0秒';
              else {
                const duration = dayjs.duration(dayjs(track.RDT).diff(tracks.value[idx - 1].RDT, 'second') || 0, 'second');
                if (duration.hours() == 0 && duration.days() == 0) track.HS = duration.format('m分钟ss秒');
                else if (duration.days() == 0) track.HS = duration.format('H小时m分钟ss秒');
                else track.HS = duration.format('D天H小时m分钟ss秒');
              }
            }
          }
        }
      });
      // 深拷贝tracks数组
      trackWorks.value = JSON.parse(JSON.stringify(tracks.value));
      if (displayMode.value == 'trackMode') {
        //判断结束抄送节点
        for (let i = 0; i < tracks.value.length; i++) {
          //结束时抄送 || 结束时  //添加一个结束节点展示流程结束
          // frmWorkCheck //当前的审核组件信息
          if (
            ((tracks.value[i].ActionType === ActionType.FlowOver &&
              !!tracks.value[i]?.NDFrom == !!tracks.value[i + 1]?.NDFrom &&
              tracks.value[i + 1] &&
              tracks.value[i + 1].ActionType === ActionType.CC) ||
              tracks.value[i].ActionType === ActionType.FlowOver ||
              frmWorkCheck.value?.FWCIsShowTruck == 1) &&
            !flowEndAdded.value
          ) {
            // trackWorks.value[i].ActionType = ActionType.Forward;
            //倒序
            if (FWCTimeModel == 0) {
              trackWorks.value.unshift({
                NodeID: tracks.value[i].NodeID,
                Msg: '流程结束',
                ActionType: 8,
                MyPk: buildUUID(), //防止子页面循环时key值重复
              });
            } else {
              //正序
              trackWorks.value.push({
                NodeID: tracks.value[i].NodeID,
                Msg: '流程结束',
                ActionType: 8,
                MyPk: buildUUID(), //防止子页面循环时key值重复
              });
            }
            flowEndAdded.value = true; // 标记已经添加过流程结束节点;
          }
        }
        aths.value = result?.Aths;
      }
      if (!!result && !!result?.MyTrack) myTrack.value = !!result?.MyTrack ? result?.MyTrack[0] : null;
      trackWorks.value.forEach((workItem) => {
        if (workItem.NodeID.toString().endsWith('01') && myTrack?.value?.NodeID.toString().endsWith('01') && workItem.ActionType === ActionType.Forward) {
          workItem.EmpFrom = WebUser.No;
          workItem.EmpFromT = WebUser.Name;
        }
      });

      //审核立场
      for (const track of trackWorks.value) {
        const resultTag: any = GetStrPara(track.Tag);
        if (resultTag?.SendNode) {
          const en = new NodeWorkCheck(resultTag?.SendNode);
          await en.RetrieveFromDBSources();
          if (!!en.FWCView) {
            const fwcViewObj: any = GetStrPara(en.FWCView);
            track.FWCMsg = !!fwcViewObj ? fwcViewObj[resultTag.FWCView] : '';
          }
        }
      }

      //发送与跳转同时存在时，移除发送数据
      //start
      //存储数据
      const filterLists = ref<Record<string, any>[]>([]);
      //存储前一个对象
      const previousItem = ref<any>(null);
      trackWorks.value.forEach((item) => {
        if (previousItem.value && previousItem.value.NodeID === item.NodeID && previousItem.value.ActionType === ActionType.Skip && item.ActionType === ActionType.Forward) {
          return;
        }
        filterLists.value.push(item);
        previousItem.value = item;
      });
      trackWorks.value = filterLists.value;
      //end

      // ActionType==26 =>ndTo
      // ActionType==8 =>ndFrom
      //如果跳转后就是流程结束，我们就移除掉返回的流程结束这个数据
      //start
      for (const track of trackWorks.value) {
        if (track.ActionType == ActionType.FlowOver && !!track.NDFrom) {
          for (const item of trackWorks.value) {
            if (item.ActionType === ActionType.Skip && item.NDTo === track.NDFrom) {
              trackToRemove.value = track;
            }
          }
        }
      }
      trackWorks.value = trackWorks.value.filter((item) => item != trackToRemove.value);
      console.log('trackLists.value', trackWorks.value);
      //end

      isLoad.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
      ready.value = true;
    }
  };
  InitPage();
  //保存审核组件
  const instance = getCurrentInstance();
  const WorkCheckSave = async (isSaveOnly) => {
    // 判断当前是什么显示模式
    if (props.examineMode == 'trackTimeMode') {
      let refT = instance?.refs['workCheckParse-W'] as InstanceType<typeof WorkCheckParseTrackTime>;
      if (!!refT && Array.isArray(refT)) refT = refT[0];
      if (!!refT) {
        return await refT?.SaveWorkCheck?.(isSaveOnly);
      }
      return;
    }
    // if (props.examineMode == 'normalMode') {
    let refW = instance?.refs['workCheckParse-W'] as InstanceType<typeof WorkCheckParseTrack>;
    if (!!refW && Array.isArray(refW)) refW = refW[0];
    if (!!refW) {
      return await refW?.SaveWorkCheck?.(isSaveOnly);
    }
    // }
    // 如果是轨迹形式，拿到轨迹组件的ref，然后保存
  };
  defineExpose({ WorkCheckSave });
</script>
<style scoped></style>
