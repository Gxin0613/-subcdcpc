<!-- 节点有三种状态：finished，progress，waiting -->
<!-- finished有七种信息：timeLineNodeType.flowNode，timeLineNodeType.gwlNode，timeLineNodeType.toNode，timeLineNodeType.msgNode，
                     timeLineNodeType.frmNode，timeLineNodeType.ccNode，timeLineNodeType.subFlowNode。 -->
<!-- progress有两种信息：timeLineNodeType.flowNode，timeLineNodeType.gwlNode。 -->
<!-- waiting有三种信息：timeLineNodeType.flowNode，timeLineNodeType.accpersNode，timeLineNodeType.ccNode。 -->
<!-- TimeLine组件不能嵌套，不能树形解析，因此将每个流程节点里的不同信息，解析成不同时间轴节点，显示不同信息，将树形转为列表如：
节点一里有抄送人列表，动作信息（审核信息等），打开表单查看，处理人信息，
在时间轴上解析成六个节点：流程节点（显示节点一的基础信息），动作信息节点，处理人信息节点，抄送节点，查看表单节点 -->
<template>
  <Spin :spinning="loading">
    <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }}</div>
    <div class="timeline-container">
      <Timeline mode="left">
        <!-- 使用计算属性对节点进行分组 -->
        <template v-for="(group, groupIndex) in groupedNodes" :key="groupIndex">
          <!-- 节点分隔线 -->
          <div v-if="groupIndex > 0" class="node-separator">
            <div class="separator-line"></div>
          </div>
          <!-- 分组标题 -->
          <div v-if="group.nodeLabel" class="node-group-header">
            <div class="node-title">{{ group.nodeLabel }}</div>
            <div class="node-subtitle" v-if="group.nodeState === 'finished'">{{ '已处理' }}</div>
            <div class="node-subtitle in-progress" v-else-if="group.nodeState === 'progress'">{{ '处理中' }}</div>
            <div class="node-subtitle waiting" v-else-if="group.nodeState === 'waiting'">{{ '待处理' }}</div>
          </div>
          <!-- 节点内容 -->
          <TimelineItem v-for="node in group.nodes" :key="node.MyPk" :class="getClass(node)">
            <!-- 时间线图标 -->
            <template #dot>
              <div v-if="node.nodeState === 'waiting' && node.nodeType === timeLineNodeType.flowNode" class="timeline-number-icon">
                <Icon icon="octicon:circle-24" class="timeline-circle" />
                <div class="timeline-number">
                  <span>{{ node.icon }}</span>
                </div>
              </div>
              <Icon v-else :icon="node.icon" :style="node.iconStyle" />
            </template>

            <!-- 标签部分 -->
            <template #label>
              <!-- 节点名称 -->
              <div
                v-if="node.nodeType === timeLineNodeType.flowNode"
                :class="['timeline-node-label', { 'timeline-waiting': node.nodeState === 'waiting' }]"
                style="padding-left: 40px"
              >
                {{ node.label }}
              </div>

              <!-- 用户信息卡片 -->
              <div v-if="node.nodeType === timeLineNodeType.gwlNode || node.nodeType === timeLineNodeType.toNode" class="timeline-user-card">
                <div class="timeline-user-avatar-container">
                  <img :src="node.empIcon + '?t=' + Math.random()" @error="defaultIcon" class="timeline-user-avatar" />
                </div>
                <div class="timeline-user-info">
                  <TypographyText class="timeline-user-name" :ellipsis="{ tooltip: node.empName }" :content="node.empName" />
                  <TypographyText class="timeline-user-dept" :ellipsis="{ tooltip: node.empDept }" :content="node.empDept" />
                </div>
              </div>
            </template>

            <!-- 已完成节点内容 -->
            <div v-if="node.nodeState === 'finished'" class="timeline-content finished">
              <!-- 基本信息 -->
              <div v-if="node.nodeType === timeLineNodeType.flowNode" class="timeline-info-block" style="padding-left: 40px">
                <div class="timeline-action-header">
                  <img :src="node.actionIconUrl + '?t=' + Math.random()" class="timeline-action-icon" />
                  <span class="timeline-action-text">{{ node.actionTypeText }}</span>
                </div>
                <div class="timeline-date">{{ node.RDT }}</div>
              </div>

              <!-- 空白占位区 -->
              <!-- <div v-if="node.nodeType === timeLineNodeType.gwlNode" class="timeline-spacer"></div> -->

              <!-- 节点和人员接收信息 -->
              <div v-if="node.nodeType === timeLineNodeType.toNode" class="timeline-info-block">
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ node.ToNodeLab }}：</span>
                  <span class="timeline-value">{{ node.ToNodeName }}</span>
                </div>
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ node.ToEmpLab }}：</span>
                  <span class="timeline-value">{{ node.ToEmpName }}</span>
                </div>
              </div>

              <!-- 审核信息 -->
              <div v-if="node.nodeType === timeLineNodeType.msgNode" class="timeline-info-block">
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ node.msgLab }}</span>
                  <span class="timeline-value" v-html="node.msg"></span>
                </div>
                <!-- 审核立场 -->
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ node.fwcView }}</span>
                  <span class="timeline-value" v-html="node.fwcMsg"></span>
                </div>
              </div>

              <!-- 表单链接 -->
              <div v-if="node.nodeType === timeLineNodeType.frmNode" class="timeline-info-block">
                <a v-if="node.frmParams.FormType != 5" class="timeline-form-link" @click="openModal(node.frmParams, node.TrackID, node.frmParams.NodeFrmID, -1)">{{
                  '查看表单'
                }}</a>
                <Popover v-else :title="'表单列表'" v-model:open="visibleStates[groupIndex]">
                  <template #content>
                    <span v-for="nodeFrm in formTrees" :key="nodeFrm.No">
                      <a class="timeline-form-link" @click.stop="openModal(node.frmParams, node.TrackID, nodeFrm.No, groupIndex)">{{ nodeFrm.Name }}</a>
                    </span>
                  </template>
                  <Button type="link" @click="getNodeFrms(node.frmParams.NodeID)">{{ '查看表单' }}</Button>
                </Popover>
              </div>

              <!-- 抄送人列表 -->
              <div v-if="node.nodeType === timeLineNodeType.ccNode" class="timeline-info-block">
                <div class="timeline-info-header">{{ '抄送给：' }}</div>
                <div v-for="(item, index) in node.cclist" :key="index" class="timeline-cc-item">
                  <Icon icon="entypo:dot-single" />
                  <TypographyText
                    class="timeline-cc-name"
                    :ellipsis="{ tooltip: item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName] }"
                    :content="item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName]"
                  />
                  <div
                    :class="[
                      'timeline-cc-status',
                      item[CCListAttr.Sta] === 1 || item[CCListAttr.Sta] === 2 ? 'status-completed' : item[CCListAttr.Sta] === 3 ? 'status-rejected' : 'status-pending',
                    ]"
                  >
                    {{ item[CCListAttr.StaText] }}
                  </div>
                  <div class="timeline-cc-date">{{ item[CCListAttr.ReadDT] }}</div>
                </div>
              </div>

              <!-- 子流程列表 -->
              <div v-if="node.nodeType === timeLineNodeType.subFlowNode" class="timeline-info-block">
                <div class="timeline-info-header">{{ '子流程列表未解析' }}</div>
              </div>
            </div>

            <!-- 进行中节点内容 -->
            <div v-else-if="node.nodeState === 'progress'" class="timeline-content in-progress">
              <!-- 基本信息 -->
              <div v-if="node.nodeType === timeLineNodeType.flowNode" class="timeline-info-block">
                <div class="timeline-action-header">
                  <img :src="node.actionIconUrl + '?t=' + Math.random()" class="timeline-action-icon" />
                  <span class="timeline-action-text">{{ node.actionTypeText }}</span>
                </div>
              </div>

              <!-- 未审核的处理人信息 -->
              <div v-if="node.nodeType === timeLineNodeType.gwlNode" class="timeline-info-block">
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ '工作到达日期：' }}</span>
                  <span class="timeline-value">{{ node.RDT }}</span>
                </div>
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ '工作应完成日期：' }}</span>
                  <span class="timeline-value">{{ node.SDT }}</span>
                </div>
                <div v-if="!node.NodeID?.toString().endsWith('01')" class="timeline-info-row">
                  <span class="timeline-label">{{ '已耗时：' }}</span>
                  <span class="timeline-value time-elapsed">{{ node.PassTime }}</span>
                </div>
                <div class="timeline-info-row">
                  <span class="timeline-label">{{ node.OverTimeLab }}：</span>
                  <span :class="['timeline-value', node.OverTimeLab === '还剩余' ? 'time-remaining' : 'time-overdue']">
                    {{ node.OverTime }}
                  </span>
                </div>
                <div class="timeline-tag-container">
                  <Tag :class="['timeline-tag', node.isRead === 1 ? 'tag-read' : 'tag-unread']">
                    {{ node.isReadText }}
                  </Tag>
                </div>
              </div>
            </div>

            <!-- 等待中节点内容 -->
            <div v-else-if="node.nodeState === 'waiting'" class="timeline-content waiting">
              <!-- 基本信息 -->
              <div v-if="node.nodeType === timeLineNodeType.flowNode" class="timeline-info-block">
                <div class="timeline-action-text waiting">{{ node.actionTypeText }}</div>
              </div>

              <!-- 未来节点处理人 -->
              <div v-if="node.nodeType === timeLineNodeType.accpersNode" class="timeline-info-block">
                <div class="timeline-info-header waiting">{{ '处理人：' }}</div>

                <!-- 单个处理人显示 -->
                <div v-if="Array.isArray(node.Accpers) && node.Accpers.length === 1" class="timeline-single-handler">
                  <TypographyText
                    class="timeline-handler-name waiting"
                    :ellipsis="{ tooltip: node.Accpers[0][SelectAccperAttr.EmpName] + '/' + node.Accpers[0][SelectAccperAttr.DeptName] }"
                    :content="node.Accpers[0][SelectAccperAttr.EmpName] + '/' + node.Accpers[0][SelectAccperAttr.DeptName]"
                  />
                </div>

                <!-- 多个处理人列表 -->
                <div v-for="(item, index) in node.Accpers" :key="index" class="timeline-handler-item" v-if="node.Accpers.length > 1">
                  <Icon icon="entypo:dot-single" />
                  <TypographyText
                    class="timeline-handler-name waiting"
                    :ellipsis="{ tooltip: item[SelectAccperAttr.EmpName] + '/' + item[SelectAccperAttr.DeptName] }"
                    :content="item[SelectAccperAttr.EmpName] + '/' + item[SelectAccperAttr.DeptName]"
                  />
                </div>
              </div>

              <!-- 未来节点抄送人 -->
              <div v-if="node.nodeType === timeLineNodeType.ccNode" class="timeline-info-block">
                <div class="timeline-info-header waiting">{{ '抄送给：' }}</div>
                <div v-for="(item, index) in node.cclist" :key="index" class="timeline-cc-item waiting">
                  <Icon icon="entypo:dot-single" />
                  <TypographyText
                    class="timeline-cc-name waiting"
                    :ellipsis="{ tooltip: item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName] }"
                    :content="item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName]"
                  />
                </div>
              </div>
            </div>

            <!-- 流程结束节点 -->
            <div v-else-if="node.nodeType" class="timeline-content end-node">
              <div class="timeline-end-text">{{ node.actionTypeText }}</div>
            </div>
          </TimelineItem>
        </template>
      </Timeline>
      <!--        <Drawer :visible="modalObj.visible" :title="'查看表单'" width="800" @close.stop="closeModal" :getContainer="false" destroyOnClose style="z-index: 1001 !important">-->
      <!--          <SingleFrm v-if="modalObj.visible" :params="modalObj.params" />-->
      <!--        </Drawer>-->
      <Modal
        v-model:open="modalObj.visible"
        :title="'查看表单'"
        :width="modalObj.width"
        :body-style="modalObj.bodyStyle"
        :footer="null"
        destroy-on-close
        :centered="false"
        :style="{ right: 0, marginRight: 0, top: 0, height: 'calc(100vh)' }"
        @cancel="closeModal"
      >
        <SingleFrm :params="modalObj.params" />
      </Modal>
    </div>
  </Spin>
</template>
<script lang="ts" setup>
  import { Timeline, TimelineItem, message, TypographyText, Tag, Spin, Modal, Popover, Button, Drawer } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { computed, defineProps, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { CCListAttr, CCLists } from '../../TSClass/FlowData/CCList';
  import { SelectAccperAttr } from '../../TSClass/FlowData/SelectAccper';
  import { NodeSimples } from '../../Admin/AttrNode/NodeSimple';
  import { ActionType } from './ActionType';
  import { timeLineNodeType, ActionTypeStr } from './TimeBaseExt';
  import WebUser from '/@/bp/web/WebUser';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import dayjs from 'dayjs';
  import { NodeAttr } from '../../TSClass/Node';
  import { getAppEnvConfig } from '/@/utils/env';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { NodeWorkCheck } from '../../Admin/AttrNode/NodeWorkCheck';
  import { GetStrPara } from '/@/utils/gener/StringUtils';
  import SingleFrm from '/@/WF/CCForm/SingleFrm.vue';
  import { Node } from '/@/WF/TSClass/Node';
  import { cloneDeep, forEach } from 'lodash-es';
  interface FlowNode {
    RDT?: string;
    ActionType?: number;
    ActionTypeText?: string;
    IsOpenFrm?: boolean;
    NodeName?: string;
    ToNodeName?: string;
    EmpFrom?: string;
    EmpName?: string;
    MyPK?: string;
    WorkID?: number;
    FK_Flow?: string;
    NDFrom?: number;
    FID?: number;
    SubFlow?: any[];
    ToNodeLab?: string;
    ToEmpLab?: string;
    ToEmpName?: string;
    EmpDept?: string;
    CCList?: any[];
    nodeState?: 'finished' | 'progress' | 'waiting';
    idx?: number;
    Msg?: string;
    MsgLab?: string;
    gwls?: GWL[];
    Accpers?: any[];
    NodeType?: number;
    FWCView?: string;
    FWCMsg?: string;
  }

  interface GWL {
    WorkID:number;
    isRead?: number;
    isReadText?: string;
    empNo?: string;
    empName?: string;
    empDept?: string;
    RDT?: string;
    SDT?: string;
    PassTime?: string;
    OverTimeLab?: string;
    OverTime?: string;
    fk_node?: string;
  }

  interface TimeLineNode {
    MyPk: string;
    icon: string;
    iconStyle: string;
    nodeState?: 'finished' | 'progress' | 'waiting';
    nodeType: number;
    label?: string;
    actionTypeText?: string;
    actionIconUrl?: string;
    RDT?: string;
    empNo?: string;
    empName?: string;
    empDept?: string;
    empIcon?: string;
    ToNodeLab?: string;
    ToNodeName?: string;
    ToEmpLab?: string;
    ToEmpName?: string;
    msgLab?: string;
    msg?: string;
    fwcView?: string; //审核立场
    fwcMsg?: string;
    frmParams?: {
      WorkID: number;
      FK_Flow: string;
      NodeID: number;
      FormType: number;
      NodeFrmID: string;
    };
    TrackID?: string;
    cclist?: any[];
    Accpers?: any[];
    SDT?: string;
    PassTime?: string;
    OverTimeLab?: string;
    OverTime?: string;
    isRead?: number;
    isReadText?: string;
    NodeID?: string;
  }

  interface ErrorObj {
    hasError: boolean;
    tips: string;
  }

  interface ModalObj {
    width: string;
    visible: boolean;
    url: string;
    component: Record<string, any>;
    params: Record<string, any>;
    bodyStyle: {
      height: string;
      overflowY: string;
    };
  }

  // Environment config setup
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  // Get proxy path
  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  // User avatar image path
  const baseStart = basicPath.endsWith('/') ? basicPath : basicPath + '/';
  const userIcon = baseStart + 'DataUser/UserIcon/';

  // Default icon fallback handler
  const defaultIcon = (e: Event): void => {
    const img = e.target as HTMLImageElement;
    img.src = DefaultUserIcon;
    img.onerror = null;
  };

  const { loadComponent } = useComponentLoader();

  // Define props with proper TypeScript interface
  const props = defineProps<{
    params: {
      WorkID: number;
      FK_Flow: string;
      FK_Node: string;
    };
  }>();

  // Reactive state with proper types
  const errorObj = reactive<ErrorObj>({
    hasError: false,
    tips: '',
  });

  const modalObj = reactive<ModalObj>({
    width: window.innerWidth * 0.8 + 'px',
    visible: false,
    url: '',
    component: {},
    params: {},
    bodyStyle: {
      height: 'calc(100vh)',
      overflowY: 'auto',
    },
  });

  const loading = ref<boolean>(false);
  const timeBase = ref<TimeLineNode[]>([]);
  const ListData = ref<FlowNode[]>([]);
  const fNodes = ref<Record<string, any>[]>([]);
  interface FlowFormTree {
    No: string;
    Name: string;
    ParentNo: string;
  }
  const formTrees = ref<FlowFormTree[]>([]);
  const visibleStates = ref<boolean[]>([]);

  const getNodeFrms = async (nodeID) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    const paras = cloneDeep(props.params);
    paras.NodeID = nodeID;
    paras.FK_Node = nodeID;
    handler.AddJson(paras);
    const data = await handler.DoMethodReturnString('FlowFormTree2021_Init');
    if (typeof data == 'string' && data.includes('err@') == true) {
      //发送时发生错误
      message.error(data.replace('err@', ''));
      return;
    }
    const result = JSON.parse(JSON.stringify(data));
    const trees = result['FormTree'];
    const forms = result['Forms'];
    formTrees.value = forms;
    return trees;
  };
  const wfState = ref(0);
  /**
   * Initialize page data
   */
  const InitPage = async (): Promise<void> => {
    try {
      loading.value = true;
      // Tracking data
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('TimeBase_Init');

      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }

      const result = JSON.parse(JSON.stringify(data));
      const gwf = result['WF_GenerWorkFlow'][0];
      wfState.value = gwf.WFState;

      // Copy data
      const CC = new CCLists();
      await CC.Init();
      await CC.Retrieve('WorkID', props.params.WorkID);

      // Unprocessed handlers
      const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler1.AddJson(props.params);
      const data1 = await handler1.DoMethodReturnString('GetFutureNodes');
      const selectAccpers = data1['SelectAccpers'] || [];
      fNodes.value = data1['Nodes'] || [];

      // First get the current process nodes for grouping
      const flowNodes = new NodeSimples();
      await flowNodes.Retrieve('FK_Flow', props.params.FK_Flow);

      // Parse flow node information
      await ParseFlowNode(result, selectAccpers, flowNodes, CC);

      // Construct timeline
      ParseTimeBase();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Sort out node information for the entire process
   * @param trackData - Track information for nodes that have been passed
   * @param Accpers - Handler information for nodes that have not been passed
   * @param flowNodes - All nodes of the process
   * @param ccList - CC information for the process
   */
  const ParseFlowNode = async (trackData: Record<string, any>, Accpers: any[], flowNodes: any[], ccList: any[]): Promise<void> => {
    const tracks = trackData['Track'] || []; // All information
    // Get the audit component information
    const fwc = trackData['FrmWorkCheck']?.[0] || {};
    // Get the current node's worker list
    const gwls = trackData['WF_GenerWorkerlist'] || [];
    // Subprocesses
    const subFlows = trackData['WF_SubFlow'] || [];
    const node = trackData['WF_Node']?.[0] || {};
    // Parse list
    const idx = ref(0);
    const trackResults = tracks.filter(
      (track: any) =>
        track.ActionType !== ActionType.FlowBBS &&
        track.ActionType !== ActionType.WorkCheck &&
        !(fwc.FWCMsgShow === '1' && track.NDFrom === parseInt(props.params.FK_Node) && WebUser.No !== track.EmpTo) &&
        !(track.ActionType === ActionType.ForwardFL && track.NDFrom !== parseInt(props.params.FK_Flow) + '01'),
    );

    let routeData: FlowNode[] = [];

    // trackResults.forEach(async (track: any) => {
    for (const track of trackResults) {
      if (track.FID !== 0) {
        // TODO: Subthread parsing not yet handled
      }

      const flowNode: FlowNode = {};

      if (track.ActionType === ActionType.Route) {
        flowNode.RDT = track.RDT ? dayjs(track.RDT).format('MM月DD日HH时mm分') : '';
        flowNode.ActionType = track.ActionType;
        flowNode.ActionTypeText = track.ActionTypeText;
        flowNode.IsOpenFrm = false;
        flowNode.NodeName = track.NDFromT;
        flowNode.ToNodeName = track.NDToT;
        flowNode.EmpFrom = track.EmpFrom;
        flowNode.EmpName = track.EmpFromT;
        flowNode.MyPK = track.MyPK;
        flowNode.WorkID = track.WorkID;
        flowNode.FK_Flow = props.params.FK_Flow;
        flowNode.NDFrom = track.NDFrom;
        flowNode.FID = track.FID;
        flowNode.SubFlow = [];
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '到达人员';
        flowNode.ToEmpName = track.EmpToT;

        // Current handler department
        if (track.NodeData) {
          const nodeDataArr = track.NodeData?.split('@') || [];
          const deptItem = nodeDataArr.find((item: string) => item.includes('DeptName'));
          flowNode.EmpDept = deptItem ? deptItem.split('=')[1] : '无';
        } else {
          flowNode.EmpDept = '无';
        }

        // CC list
        flowNode.CCList = [];
        // Node status
        flowNode.nodeState = 'finished';
        routeData.push(flowNode);
        return;
      }

      if (track.ActionType === ActionType.Return) {
        flowNode.ToNodeLab = '退回到';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '退回给';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.MsgLab = '退回意见如下';
        flowNode.IsOpenFrm = false;
        flowNode.Msg = track.Msg;
        flowNode.MyPK = track.MyPK;
      }

      if (track.ActionType === ActionType.CC) {
        flowNode.ToNodeLab = '抄送节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '抄送给';
        flowNode.ToEmpName = track.EmpToT || '';
        flowNode.MsgLab = '抄送内容';
        flowNode.IsOpenFrm = false;
        flowNode.Msg = track.Msg;
        flowNode.MyPK = track.MyPK;
      }

      if (track.ActionType === ActionType.UnSend) {
        flowNode.ToNodeLab = '撤销到';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '撤销给';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.MsgLab = '意见';
        flowNode.IsOpenFrm = false;
        flowNode.Msg = '无';
        flowNode.MyPK = track.MyPK;
      }

      if (track.ActionType === ActionType.Forward || track.ActionType === ActionType.FlowOver || track.ActionType === ActionType.TeampUp) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '到达人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = CommonConfig.Hide_IsOpenFrm ? true : false;
        flowNode.MsgLab = '审核意见：';
        flowNode.MyPK = track.MyPK;
        if (track.ActionType === ActionType.TeampUp) {
          flowNode.MsgLab = '会签意见';
        }

        // Parse handling situation
        if (fwc.FWCVer === 0) {
          const checkTrack = tracks.find((item: any) => item.NDFrom === track.NDFrom && item.ActionType === ActionType.WorkCheck && item.EmpFrom === track.EmpFrom);

          if (checkTrack) {
            flowNode.Msg = checkTrack.Msg;
          }
          if (track.Tag.includes('FWCView')) {
            flowNode.FWCView = '审核立场：';
            const resultTag: any = GetStrPara(track.Tag);
            if (resultTag?.SendNode) {
              const en = new NodeWorkCheck(resultTag?.SendNode);
              await en.RetrieveFromDBSources();
              const fwcViewObj: any = GetStrPara(en.FWCView);
              flowNode.FWCMsg = !!fwcViewObj ? fwcViewObj[resultTag.FWCView] : '';
            }
          }
        } else {
          const val = (track.Msg || '').replace('null', '').split('WorkCheck@');
          if (val.length === 2) {
            flowNode.Msg = val[1];
          }
        }
      }

      if (track.ActionType === ActionType.Press) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '接收人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '催办信息';
        flowNode.Msg = track.Msg;
        flowNode.MyPK = track.MyPK;
      }

      if (track.ActionType === ActionType.Shift) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '接收人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '移交信息';
        flowNode.Msg = track.Msg;
        flowNode.MyPK = track.MyPK;
      }

      if (track.ActionType === ActionType.Hungup) {
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '挂起原因';
        flowNode.Msg = track.Msg;
        flowNode.MyPK = track.MyPK;
      }

      // Handle message content
      flowNode.Msg = flowNode.Msg || '无';
      if (flowNode.Msg === '0') flowNode.Msg = '无';
      if (typeof flowNode.Msg === 'boolean') flowNode.Msg = '';
      if (flowNode.Msg && flowNode.Msg !== '无') {
        flowNode.Msg = flowNode.Msg.replace(new RegExp('\t\n', 'g'), '<br>').replace('null', '');
      }

      flowNode.RDT = track.RDT ? dayjs(track.RDT).format('MM月DD日HH时mm分') : '';
      flowNode.ActionType = track.ActionType;
      flowNode.ActionTypeText = track.ActionTypeText;
      flowNode.NodeName = track.NDFromT;
      flowNode.EmpFrom = track.EmpFrom;
      flowNode.EmpName = track.EmpFromT;
      flowNode.idx = idx.value++;
      flowNode.MyPK = track.MyPK;
      flowNode.WorkID = track.WorkID;
      flowNode.FK_Flow = props.params.FK_Flow;
      flowNode.NDFrom = track.NDFrom;
      flowNode.FID = track.FID;

      // Filter subflows
      flowNode.SubFlow = subFlows.filter((subFlow: any) => subFlow.FK_Node === track.NDFrom && subFlow.SubFlowSta === 1);

      // Current handler department
      if (track.NodeData) {
        const nodeDataArr = track.NodeData?.split('@') || [];
        const deptItem = nodeDataArr.find((item: string) => item.includes('DeptName'));
        flowNode.EmpDept = deptItem ? deptItem.split('=')[1] : '无';
      } else {
        flowNode.EmpDept = '无';
      }

      // CC list
      flowNode.CCList = ccList.filter((item: any) => item[CCListAttr.NodeIDCC] === track.NDFrom);

      // Node status
      flowNode.nodeState = 'finished';
      if (track.ActionType !== ActionType.Route && routeData.length !== 0) {
        flowNode.ToNodeName = routeData[0].ToNodeName;
        flowNode.ToEmpName = flowNode.EmpName;
        ListData.value.push(flowNode);

        for (let i = 0; i < routeData.length; i++) {
          const item = routeData[i];
          if (i + 1 < routeData.length) {
            item.ToNodeName = routeData[i + 1].NodeName;
            item.ToEmpName = track.EmpFromT;
          } else {
            item.ToNodeName = track.NDToT;
            item.ToEmpName = track.EmpToT;
          }
          item.idx = idx.value++;

          ListData.value.push(item);
        }

        routeData = [];
      } else {
        ListData.value.push(flowNode);
      }
    }
    // );

    // Check if there are still unprocessed handlers
    if (Array.isArray(gwls) && gwls.length > 0) {
      const showIsRead = CommonConfig.Hide_IsRead === false ? 1 : -2;

      // Current node unaudited handlers
      let gwlResults = gwls.filter(
        (gwl: any) => gwl.IsPass !== 1 && gwl.IsPass !== 3 && gwl.IsPass >= 0 && gwl.FK_Node === parseInt(props.params.FK_Node) && gwl.IsRead !== showIsRead,
      );
      //分流节点下发到子线程，子线程待办显示
      if(gwlResults.length==0 && (node.RunModel == 1 || node.RunModel == 2 || node.RunModel == 3)){
        gwlResults = gwls.filter(
        (gwl: any) => gwl.IsPass !== 1 && gwl.IsPass !== 3 && gwl.IsPass >= 0 && gwl.FID === parseInt(props.params.WorkID) && gwl.IsRead !== showIsRead,
      );
      }

      const gwlList: GWL[] = [];
      const mapList={};
      gwlResults.forEach((gwl: any) => {
        // Construct list of handlers for the current node
        const gwlItem: GWL = {
          WorkID: 0
        };
        gwlItem.NodeName = gwl.NodeName;
        gwlItem.isRead = parseInt(gwl.IsRead) === 0 ? 0 : 1;
        gwlItem.isReadText = parseInt(gwl.IsRead) === 0 ? '未阅' : '已阅';
        gwlItem.empNo = gwl.FK_Emp;
        gwlItem.empName = gwl.EmpName;
        gwlItem.fk_node = gwl.FK_Node;
        gwlItem.WorkID = gwl.WorkID;
        // Department information
        if (gwl.AtPara) {
          const atParaArr = gwl.AtPara?.split('@') || [];
          const deptName = atParaArr.find((item: string) => item.includes('DeptName'));
          if (deptName) {
            gwlItem.empDept = deptName?.split('=')?.[1] || '未知';
          }
        }

        gwlItem.RDT = gwl.RDT;
        gwlItem.SDT = gwl.SDT;

        const seconds = gwlItem.RDT ? dayjs().diff(gwlItem.RDT, 'second') : 0;
        gwlItem.PassTime = formatSeconds(seconds);

        if (!gwlItem.SDT || gwlItem.SDT === '无') {
          gwlItem.OverTimeLab = '还剩余';
          gwlItem.OverTime = '无';
        } else {
          if (dayjs().format('YYYY-MM-DD HH:mm:ss') > gwlItem.SDT && !gwl.FK_Node.toString().endsWith('01')) {
            gwlItem.OverTimeLab = '已超时';
            const overSeconds = dayjs().diff(gwlItem.SDT, 'second');
            gwlItem.OverTime = formatSeconds(overSeconds);
          } else {
            gwlItem.OverTimeLab = '还剩余';
            const overSeconds = dayjs(gwlItem.SDT).diff(new Date(), 'second');
            gwlItem.OverTime = formatSeconds(overSeconds);
          }
        }
        if(!mapList[gwlItem.WorkID]) mapList[gwlItem.WorkID] = [gwlItem];
        else mapList[gwlItem.WorkID].push(gwlItem);//gwlList.push(gwlItem);
      });
      for (const key in mapList) { 
          const flowNode = {} as FlowNode;
          if(mapList[key].length != 0)
            flowNode.NodeName = mapList[key][0].NodeName;
          flowNode.MyPK = '';
          flowNode.nodeState = 'progress';
          flowNode.ActionTypeText = '等待处理';
          flowNode.idx = idx.value++;
          flowNode.gwls = mapList[key];
          ListData.value.push(flowNode);
      } 
     
    }

    // Nodes not yet reached
    fNodes.value.forEach((node: any) => {
      let accpers = Accpers.filter((accper: any) => accper[SelectAccperAttr.FK_Node] === node[NodeAttr.NodeID]);

      accpers = accpers.map((item: any) => {
        return { ...item, type: '处理人', EmpName: item[SelectAccperAttr.EmpName] };
      });

      if (Array.isArray(accpers) && accpers.length > 0) {
        let nodeCCList = ccList.filter((item: any) => item[CCListAttr.NodeIDWork] === node[NodeAttr.NodeID]);

        nodeCCList = nodeCCList.map((item: any) => {
          return { ...item, type: '抄送人', EmpName: item[CCListAttr.CCToName] };
        });

        const flowNode = {} as FlowNode;
        flowNode.nodeState = 'waiting';
        flowNode.idx = idx.value++;
        flowNode.NodeName = node[NodeAttr.Name];
        flowNode.Accpers = accpers;
        flowNode.CCList = nodeCCList;

        ListData.value.push(flowNode);
      } else {
        const flowNode = {} as FlowNode;
        flowNode.nodeState = 'waiting';
        flowNode.idx = idx.value++;
        flowNode.NodeName = node[NodeAttr.Name];
        flowNode.Accpers = [];
        flowNode.CCList = [];
        flowNode.NodeType = node.NodeType;

        ListData.value.push(flowNode);
      }
    });
  };

  /**
   * Divide node information into different timeline nodes
   */
  const ParseTimeBase = async (): void => {
    debugger
    // Traverse all nodes to construct timeline structure
    for (const listItem: FlowNode of ListData.value) {
      if (listItem.nodeState === 'finished') {
        // Nodes that have been passed
        if (listItem.NodeName) {
          // Node information
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}nodeInfo`,
            icon: 'ant-design:check-circle-outlined',
            iconStyle: 'font-size: 32px; margin: 5px',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.flowNode,
            label: listItem.NodeName,
            actionTypeText: listItem.ActionTypeText,
            actionIconUrl: ActionTypeStr(listItem.ActionType),
            RDT: listItem.RDT,
          };

          timeBase.value.push(timeBaseNode);
        }

        // if (listItem.EmpName) {
        //   // Operator information
        //   const timeBaseNode: TimeLineNode = {
        //     MyPk: `${listItem.idx}gwlNode`,
        //     icon: 'octicon:circle-24',
        //     iconStyle: '',
        //     nodeState: listItem.nodeState,
        //     nodeType: timeLineNodeType.gwlNode,
        //     empNo: listItem.EmpFrom,
        //     empName: listItem.EmpName,
        //     empDept: listItem.EmpDept,
        //     empIcon: userIcon + listItem.EmpFrom + '.png',
        //   };

        //   timeBase.value.push(timeBaseNode);
        // }

        if (listItem.ToNodeName) {
          // Which node to send to, to whom
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}toNode`,
            icon: 'octicon:circle-24',
            iconStyle: '',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.toNode,
            ToNodeLab: listItem.ToNodeLab,
            ToNodeName: listItem.ToNodeName,
            ToEmpLab: listItem.ToEmpLab,
            ToEmpName: listItem.ToEmpName,
            empNo: listItem.EmpFrom,
            empName: listItem.EmpName,
            empDept: listItem.EmpDept,
            empIcon: userIcon + listItem.EmpFrom + '.png',
          };

          timeBase.value.push(timeBaseNode);
        }

        if (listItem.Msg !== '无' && listItem.Msg != null) {
          // Review information, CC information
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}msgNode`,
            icon: 'octicon:circle-24',
            iconStyle: '',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.msgNode,
            msgLab: listItem.MsgLab,
            fwcView: listItem.FWCView,
            msg: listItem.Msg,
            fwcMsg: listItem.FWCMsg,
          };

          timeBase.value.push(timeBaseNode);
        }

        if (listItem.IsOpenFrm) {
          const node = new Node();
          node.NodeID = listItem.NDFrom;
          await node.RetrieveFromDBSources();
          // View form
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}frmNode`,
            icon: 'octicon:circle-24',
            iconStyle: '',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.frmNode,
            frmParams: {
              WorkID: listItem.WorkID!,
              FK_Flow: listItem.FK_Flow!,
              NodeID: listItem.NDFrom!,
              FormType: node.FormType,
              NodeFrmID: node.NodeFrmID || 'ND' + node.NodeID,
            },
            TrackID: listItem.MyPK,
          };

          timeBase.value.push(timeBaseNode);
        }

        if (Array.isArray(listItem.CCList) && listItem.CCList.length > 0) {
          // CC list
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}ccNode`,
            icon: 'octicon:circle-24',
            iconStyle: '',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.ccNode,
            cclist: listItem.CCList,
          };

          timeBase.value.push(timeBaseNode);
        }
        // Subprocess not parsed
      } else if (listItem.nodeState === 'progress') {
        if (listItem.NodeName) {
          // Basic node information
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}nodeInfo`,
            icon: 'ant-design:check-circle-filled',
            iconStyle: 'font-size: 32px; margin: 5px',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.flowNode,
            label: listItem.NodeName,
            actionTypeText: listItem.ActionTypeText,
            actionIconUrl: ActionTypeStr(listItem.ActionType),
          };

          timeBase.value.push(timeBaseNode);
        }

        if (Array.isArray(listItem.gwls) && listItem.gwls.length > 0) {
          listItem.gwls.forEach((gwl: GWL, index: number) => {
            const timeBaseNode: TimeLineNode = {
              MyPk: `${listItem.idx}gwlNode${index}`,
              icon: 'cib:discover',
              iconStyle: '',
              nodeState: listItem.nodeState,
              nodeType: timeLineNodeType.gwlNode,
              empNo: gwl.empNo,
              empIcon: userIcon + gwl.empNo + '.png',
              empName: gwl.empName,
              empDept: gwl.empDept,
              RDT: gwl.RDT,
              SDT: gwl.SDT,
              PassTime: gwl.PassTime,
              OverTimeLab: gwl.OverTimeLab,
              OverTime: gwl.OverTime,
              isRead: gwl.isRead,
              isReadText: gwl.isReadText,
              NodeID: gwl.fk_node,
            };

            timeBase.value.push(timeBaseNode);
          });
        }
      } else if (listItem.nodeState === 'waiting') {
        if (listItem.NodeName) {
          // Basic node information
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}nodeInfo`,
            icon: (listItem.idx! + 1).toString(),
            iconStyle: '',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.flowNode,
            label: listItem.NodeName,
            actionTypeText: listItem.ActionTypeText || '未经过',
            actionIconUrl: ActionTypeStr(listItem.ActionType),
          };

          timeBase.value.push(timeBaseNode);
        }

        if (Array.isArray(listItem.Accpers) && listItem.Accpers.length > 0) {
          // List of handlers
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}accpersNode`,
            icon: 'octicon:circle-24',
            iconStyle: 'color:rgba(0, 0, 0, 0.25)',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.accpersNode,
            Accpers: listItem.Accpers,
          };

          timeBase.value.push(timeBaseNode);
        }

        if (Array.isArray(listItem.CCList) && listItem.CCList.length > 0) {
          // CC recipient list
          const timeBaseNode: TimeLineNode = {
            MyPk: `${listItem.idx}ccNode`,
            icon: 'octicon:circle-24',
            iconStyle: 'color:rgba(0, 0, 0, 0.25)',
            nodeState: listItem.nodeState,
            nodeType: timeLineNodeType.ccNode,
            cclist: listItem.CCList,
          };

          timeBase.value.push(timeBaseNode);
        }
      }
    }
    const color = wfState.value === 3 ? 'inherit' : 'rgba(0, 0, 0, 0.25)';
    // Add end node
    const timeBaseNode: TimeLineNode = {
      MyPk: 'endNode',
      icon: 'bi:stop-circle',
      iconStyle: 'font-size: 32px; margin: 5px;color:' + color,
      nodeType: timeLineNodeType.endNode,
      actionTypeText: '流程结束',
    };

    timeBase.value.push(timeBaseNode);
  };

  const getClass = (node: TimeLineNode): Record<string, boolean> => {
    if (node.nodeType === timeLineNodeType.gwlNode) return 'user-timeline';
    return {
      'custom-timeline': node.nodeType === timeLineNodeType.flowNode,
    };
  };

  const formatSeconds = (value: number): string => {
    // Seconds
    const second = ref(parseInt(value.toString()));
    // Minutes
    const minute = ref(0);
    // Hours
    const hour = ref(0);
    // Days
    const day = ref(0);

    const isNegative = second.value < 0;
    if (isNegative) {
      second.value = Math.abs(second.value);
    }

    // If seconds > 60, convert to minutes
    if (second.value > 60) {
      // Get minutes, divide by 60 and get integer
      minute.value = Math.floor(second.value / 60);
      // Get seconds, mod 60
      second.value = Math.floor(second.value % 60);

      // If minutes > 60, convert to hours
      if (minute.value > 60) {
        // Get hours, divide minutes by 60
        hour.value = Math.floor(minute.value / 60);
        // Get remaining minutes
        minute.value = Math.floor(minute.value % 60);
      }

      // If hours > 24, convert to days
      if (hour.value > 24) {
        day.value = Math.floor(hour.value / 24);
        // Get remaining hours
        hour.value = Math.floor(hour.value % 24);
      }
    }

    let result = `${second.value}秒`;

    if (minute.value > 0) {
      result = `${minute.value}分${result}`;
    }

    if (hour.value > 0) {
      result = `${hour.value}小时${result}`;
    }

    if (day.value > 0) {
      result = `${day.value}天${result}`;
    }

    if (isNegative) {
      result = `-${result}`;
    }

    return result;
  };

  const openModal = (params: { FK_Flow: string; WorkID: number; NodeID: number }, trackID: string, frmID: string, _index = -1): void => {
    if (_index > -1) visibleStates.value[_index] = false;

    modalObj.visible = true;
    modalObj.params = {
      ...params,
      isComponent: true,
      TrackID: trackID,
      FrmID: frmID,
      FK_MapData: frmID,
      IsReadonly: 1,
    };
    //baseComponent.value?.openModalByUrl('查看表单', '/src/WF/CCFrom/SingleFrm.vue', modalObj.params);
  };

  /**
   * Close modal dialog
   */
  const closeModal = (): void => {
    modalObj.visible = false;
  };

  // 计算分组后的节点
  const groupedNodes = computed(() => {
    if (!timeBase.value || timeBase.value.length === 0) return [];

    const groups: Recordable[] = [];
    let currentGroup: Recordable | null = null;

    // 遍历所有节点
    for (const node of timeBase.value) {
      // 当遇到流程节点时开始新分组
      if (node.nodeType === timeLineNodeType.flowNode) {
        // 如果已有分组，先保存
        if (currentGroup) {
          groups.push(currentGroup);
        }

        // 创建新分组
        currentGroup = {
          nodeLabel: node.label || '流程结束',
          nodeState: node.nodeState,
          nodes: [node],
        };
      }
      // 流程结束节点特殊处理
      else if (node.nodeType === timeLineNodeType.endNode) {
        // 如果已有分组，先保存
        if (currentGroup) {
          groups.push(currentGroup);
        }

        // 创建结束节点分组
        currentGroup = {
          nodeLabel: '流程结束',
          nodeState: '',
          nodes: [node],
        };
      }
      // 向当前分组添加其他节点
      else if (currentGroup) {
        currentGroup.nodes.push(node);
      }
    }

    // 添加最后一个分组
    if (currentGroup && !groups.includes(currentGroup)) {
      groups.push(currentGroup);
    }
    visibleStates.value = Array(groups.length).fill(false);

    return groups;
  });
  InitPage();
</script>
<style lang="less" scoped>
  .timeline-container {
    padding: 20px;
    margin: 0 auto;
    width: 55%;
    box-shadow: 3px 3px 14px rgb(0 0 0 / 31%);
  }

  // 节点分组样式
  .node-separator {
    margin: 5px 0;
    padding-left: 12px;
  }

  .separator-line {
    height: 1px;
    background: linear-gradient(to right, #f0f0f0, #d9d9d9, #f0f0f0);
    margin-left: 7px;
  }

  .node-group-header {
    display: flex;
    align-items: center;
    margin: 16px 0 16px 36px;
    position: relative;
  }

  .node-title {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    margin-right: 10px;
  }

  .node-subtitle {
    font-size: 13px;
    color: #52c41a;
    background-color: rgba(82, 196, 26, 0.1);
    padding: 2px 8px;
    border-radius: 10px;

    &.in-progress {
      color: #fa8c16;
      background-color: rgba(250, 140, 22, 0.1);
    }

    &.waiting {
      color: rgba(0, 0, 0, 0.45);
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  // 基础样式
  .timeline-content {
    margin-bottom: 20px;
  }

  .timeline-info-block {
    margin-bottom: 16px;
  }

  .timeline-info-row {
    display: flex;
    margin-bottom: 8px;
    align-items: center;
  }

  .timeline-label {
    font-weight: 500;
    margin-right: 4px;
  }

  .timeline-value {
    color: #52c41a;
  }

  // 时间线样式
  .timeline-number-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timeline-circle {
    color: rgba(0, 0, 0, 0.25);
    font-size: 24px;
  }

  .timeline-number {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    font-weight: 500;
  }

  // 节点标签样式
  .timeline-node-label {
    margin-right: 10px;
    margin-top: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .timeline-waiting {
    color: rgba(0, 0, 0, 0.45);
  }

  // 用户信息卡片样式
  .timeline-user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 10px;
    margin-top: -30px;
  }

  .timeline-user-avatar-container {
    display: flex;
    justify-content: center;
    width: 100px;
  }

  .timeline-user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #f0f0f0;
  }

  .timeline-user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
  }

  .timeline-user-name,
  .timeline-user-dept {
    width: 100px;
    overflow: hidden;
    text-align: center;
    display: block;
  }

  // 动作样式
  .timeline-action-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .timeline-action-icon {
    height: 24px;
    width: 24px;
    margin-right: 10px;
  }

  .timeline-action-text {
    font-size: 16px;
    font-weight: 500;
  }

  .timeline-date {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }

  // 间隔
  .timeline-spacer {
    height: 50px;
  }

  // 表单链接
  .timeline-form-link {
    color: #1890ff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  // 抄送人列表
  .timeline-info-header {
    font-weight: 500;
    margin-bottom: 8px;
  }

  .timeline-cc-item,
  .timeline-handler-item {
    display: flex;
    align-items: center;
    height: 28px;
    margin-bottom: 4px;
  }

  .timeline-cc-name,
  .timeline-handler-name {
    width: 120px;
    margin-right: 10px;
    overflow: hidden;
  }

  .timeline-cc-status {
    width: 45px;
    margin-right: 10px;
    text-align: center;
  }

  .status-completed {
    color: #52c41a;
  }

  .status-rejected {
    color: #f5222d;
  }

  .status-pending {
    color: #1890ff;
  }

  .timeline-cc-date {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }

  // 时间指示器
  .time-elapsed,
  .time-overdue {
    color: #f5222d;
  }

  .time-remaining {
    color: #52c41a;
  }

  // 标签样式
  .timeline-tag-container {
    margin-top: 4px;
  }

  .timeline-tag {
    border: none;
    &.tag-read {
      background-color: #52c41a;
      color: white;
    }
    &.tag-unread {
      background-color: #1890ff;
      color: white;
    }
  }

  // 等待节点样式
  .waiting {
    color: rgba(0, 0, 0, 0.45);
  }

  // 流程结束节点
  .timeline-end-text {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.45);
  }

  // 自定义时间线样式
  .custom-timeline {
    :deep(.ant-timeline-item-tail) {
      border-left: 2px solid #1890ff;
    }
  }
  /*.user-timeline {
    height: 0px !important;
    padding-bottom: 0px;
  }*/
</style>
