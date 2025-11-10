<template>
  <div class="track-page">
    <Spin :spinning="loading">
      <div v-if="loading" style="width: 400px; height: 600px"></div>
    </Spin>
    <div ref="trackWrapper"> </div>
    <div class="id-control">
      <RadioGroup v-model:value="showId" size="small" @change="renderId">
        <RadioButton :value="1">{{ '显示ID' }}</RadioButton>
        <RadioButton :value="0">{{ '隐藏ID' }}</RadioButton>
      </RadioGroup>
    </div>
    <Transition name="fade">
      <div class="preview-container" :style="previewStyle" @mouseleave="onLeavePreviewModal" @mouseenter="clearTimer" v-if="previewNode">
        <!-- 经过的节点的操作人信息 ShowPerson判断是否显示操作人信息，主要是因为起始节点不显示 -->
        <div
          v-if="(previewNode.nodeState === NodeState.finished || previewNode.nodeState === NodeState.progress) && previewNode.ShowPerson"
          class="node-info-panel-box"
          :style="nodeInfoStyle"
        >
          <div v-if="previewNode.person?.length >= 3" style="padding-left: 12px">共有{{ flowCompleted ? '' : '待' }}处理人：{{ previewNode.person.length }} </div>
          <NScrollbar style="max-height: 370px" :trigger="previewNode.person?.length >= 3 ? 'none' : 'hover'">
            <div v-for="(item, index) in previewNode.person" :key="index" class="node-info-panel" style="width: 400px">
              <Row>
                <Col :span="8" class="empInfo">
                  <img v-if="item.avatar" :src="item.avatar" :width="40" />
                  <img v-else :src="DefaultUserIcon" :width="40" />
                  <div>{{ item.EmpName }}</div>
                  <div>{{ item.DeptName }}</div>
                </Col>
                <Col :span="16" style="padding-left: 10px">
                  <div>{{ '送达日期：' }}{{ item.RDT }}</div>
                  <!-- <div>{{ '应完成日期：' }}{{ item.SDT }}</div> -->
                  <div v-if="item.IsPass === 1">{{ '实际完成：' }}{{ item.CDT }}</div>
                  <div v-if="item.IsPass === 1">{{ '用时：' }}{{ item.duration }}</div>
                  <!--                  <div v-if="item.IsPass !== 1">-->
                  <!--                    <template v-if="item.isTimeout">-->
                  <!--                      {{ '已逾期：' }}-->
                  <!--                      <span style="color: #ff4444">{{ item.remains }}</span>-->
                  <!--                    </template>-->
                  <!--                    <template v-if="!item.isTimeout">-->
                  <!--                      {{ '还剩余：' }}-->
                  <!--                      <span style="color: #333333">{{ item.remains }}</span>-->
                  <!--                    </template>-->
                  <!--                  </div>-->
                  <div v-if="item.IsPass !== 1"
                    >{{ '是否打开？' }}<span style="color: #ff4444">{{ item.IsRead ? '是' : '否' }}</span>
                  </div>
                  <div>发送人：{{ item.Sender || '未知' }}</div>
                  <div v-if="item.Msg">提示信息：{{ item.Msg }}</div>
                </Col>
              </Row>
            </div>
          </NScrollbar>
        </div>
        <!-- 未经过的节点的操作人信息 -->
        <div v-else-if="previewNode.nodeState === NodeState.waiting && previewNode.NodeType === 0 && previewNode.waitingAccpers" class="node-info-panel-box" :style="nodeInfoStyle">
          <div class="node-info-panel">
            <div class="panel-column" v-for="(accper, index) in previewNode.waitingAccpers" :key="accper.FK_Node + '-' + index">
              <p class="cell"><img :src="accper.avatar" @error="defaultEmpIcon" :width="20" /></p>
              <p class="cell" style="flex: 1">{{ accper.EmpName + '/' + accper.DeptName }}</p>
            </div>
          </div>
        </div>
        <!-- 经过的抄送节点的信息 -->
        <div v-else-if="previewNode.cclist && previewNode.nodeState === NodeState.finished" class="node-info-panel-box" :style="nodeInfoStyle">
          <div class="node-info-panel">
            <div class="panel-column" v-for="cc in previewNode.cclist" :key="cc.MyPK" :style="cc.Sta == 1 ? 'color:green !important' : 'color:black'">
              <p class="cell" style="flex: 0.1"><img :src="userIcon + cc.CCTo + '.png'" @error="defaultEmpIcon" :width="20" /> </p>
              <p class="cell" style="flex: 0.5" v-if="cc.ReadDT">{{ (!!cc.CCToName || cc.GetValByKey('CCToName')) + '/' + (!!cc.DeptName || cc.GetValByKey('DeptName')) }}</p>
              <p class="cell" style="flex: 0.9" v-else>{{ (cc?.CCToName || cc.GetValByKey('CCToName')) + '/' + (cc?.DeptName || cc.GetValByKey('DeptName')) }}</p>
              <p class="cell" style="flex: 0.4" v-if="cc.ReadDT">{{ cc.ReadDT }}</p>
            </div>
          </div>
        </div>
        <!-- 未经过的抄送节点的信息 -->
        <div
          v-if="previewNode.cclist && (previewNode.nodeState === NodeState.progress || previewNode.nodeState === NodeState.waiting)"
          class="node-info-panel-box"
          :style="nodeInfoStyle"
        >
          <div class="node-info-panel">
            <div class="panel-column" v-for="cc in previewNode.cclist" :key="cc.MyPK">
              <p class="cell"><img :src="userIcon + cc.CCTo + '.png'" @error="defaultEmpIcon" :width="20" /></p>
              <p class="cell" style="flex: 1">{{ (cc?.CCToName || cc.GetValByKey('CCToName')) + '/' + (cc?.DeptName || cc.GetValByKey('DeptName')) }}</p>
            </div>
          </div>
        </div>
        <div v-if="previewNode.NodeType == NodeType.SubFlowNode" class="node-info-panel-box" :style="nodeInfoStyle">
          <div class="node-info-panel">
            <div class="panel-column" v-for="flow in previewNode.targetFlows" :key="flow.MyPK" :style="flow.SubFlowSta == 1 ? 'color:7756cc !important' : 'color:black'">
              <p class="cell" style="flex: 0.15">{{ flow.WorkID }}</p>
              <p class="cell" style="flex: 0.6">{{ flow.FlowName }}</p>
              <p class="cell" style="flex: 0.25; color: #7756cc; cursor: pointer" @click="selectSubFlow(flow)">{{ '查看轨迹' }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
  <Teleport to="body">
    <div v-if="subflowInfo.visible" class="sub-flow-chart" :style="subChartStyle">
      <div class="title">
        <span>子流程: {{ subflowInfo.params.FlowName }} - WorkID: {{ subflowInfo.params.WorkID }}</span>
        <div class="options">
          <FullscreenExitOutlined v-if="subflowInfo.enlarge" @click="changeWindowSize" />
          <FullscreenOutlined v-else @click="changeWindowSize" />
          <CloseOutlined class="close-btn" @click="closeSubflowWindow" />
        </div>
      </div>
      <Track :params="subflowInfo.params" />
    </div>
  </Teleport>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { calcDrawSize } from '../../Admin/FlowDesigner/utils/CalcUtils';
  import { CCLists } from '../../TSClass/FlowData/CCList';
  import { SubFlows } from '../../Admin/AttrNode/SubFlow/SubFlow';
  import { SelectAccpers } from '../../TSClass/FlowData/SelectAccper';
  export default defineComponent({
    name: 'Track',
  });
</script>
<script lang="ts" setup>
  import { Row, Col, Spin, message, RadioGroup, RadioButton } from 'ant-design-vue';
  import { CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { computed, onMounted, reactive, ref, shallowRef, unref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import { getAppEnvConfig } from '/@/utils/env';
  import { NodeState } from './TimeBaseExt';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { useX6Graph } from '../../Admin/FlowDesigner/hooks/useX6Graph';
  import { Directions } from '../../Admin/Cond2020/Direction';
  import { LabelInfo, NodeInfo } from '../../Admin/FlowDesigner/FlowAttr';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { addMobileSupport, calcPanelPosition, checkImg } from './utils/TrackUtils';
  import { NodeType } from '../../Admin/FlowDesigner/config/typeDef';
  import { NScrollbar } from 'naive-ui';
  import { Flow as FlowEntity } from '/@/WF/TSClass/Flow';
  const { graph, initGraph, convertData } = useX6Graph();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取代理路径
  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  //用户头像图片
  const userIcon = basicPath + '/DataUser/UserIcon/';

  // //没有用户头像图片时获取默认图片
  const defaultEmpIcon = (e) => {
    const img = e.srcElement;
    img.src = DefaultUserIcon;
    img.onerror = null;
  };
  // dayjs计算时长
  dayjs.extend(duration);

  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => ({}),
    },
  });
  const loading = ref(false);
  const nodeInfoStyle = computed(() => {
    return {
      zIndex: 1001,
      display: 'block',
    };
  });

  const previewStyle = computed(() => {
    return {
      left: previewPos.x + 'px',
      top: previewPos.y + 'px',
    };
  });

  const nodes = ref<Array<NodeInfo>>([]); //所有node
  const renderNodes = ref<Array<NodeInfo>>([]); //node渲染配置列表
  const directions = ref<Directions>(new Directions()); //链接线
  const labels = ref<LabelInfo[]>([]);
  const passedNodes = ref<Recordable[]>([]); //经过的node
  const tracks = ref<Recordable[]>([]); //轨迹
  const selectAccpers = ref<Recordable[]>([]); //未来处理人
  const cclist = ref<Recordable[]>([]); //未来处理人
  const nodeTrackMap = new Map();
  // 保存需要被隐藏为未来态的节点（用于退回后基于方向关系屏蔽当前节点之后的节点）
  let hiddenFutureNodeIds: Set<number> = new Set();
  const previewNode = ref<Nullable<Recordable>>(null);
  const previewPos = reactive({
    x: 0,
    y: 0,
  });

  let flowInfo: Nullable<Recordable> = null;
  let flowCompleted = false; // 判断流程是否完成
  /**
   * node的结构
   * node.nodeState=finished|waiting|progress,经过的节点，用于判断节点的颜色样式
   * 经过的nodeType=0的普通节点，有node.person，存储节点的处理人详情
   * 未经过的nodeType=0的普通节点，有node.waitingAccpers，存储未来处理人
   * 经过的nodeType=2的抄送节点，有node.cclist，存储抄送接收人信息，包括姓名，部门，状态，时间
   * 未经过的nodeType=2的抄送节点，有node.cclist，存储抄送接收人信息，包括姓名，部门
   */
  let trackList: Recordable[] = [];
  const analyzeFlow = async () => {
    const compNodes = JSON.parse(JSON.stringify(nodes.value)); //节点信息
    const compPrevNodes = JSON.parse(JSON.stringify(passedNodes.value)); //经过的节点finished和progress
    const startNode = compNodes.find((item) => item.Step === 1); //开始节点
    const startNodeTrack = JSON.parse(JSON.stringify(tracks.value)).filter((item) => item.NDFrom == startNode?.ID)?.[0]; //开始节点的数据，来自track
    // 流程完成情况处理
    trackList = unref(tracks);
    // // 实际移动的节点
    // 发送事件（包含退回），ActionType 参考后端定义：Forward=1, Return=2, ForwardFL=6, ForwardHL=7, Skip=26, Route=32, FlowOver=8, WorkCheck=22, AutoWorkCheck=221
    const sendEventList = trackList.filter((track) => [1, 2, 6, 7, 26, 32, 22, 221, 8].includes(track.ActionType));
    const routeEventList = trackList.filter((track) => track.ActionType == 32); // 路由事件
    const checkedEventList = trackList.filter((track) => track.ActionType == 22); // 审核事件
    const ccEventList = trackList.filter((track) => track.ActionType == 21); // 抄送事件
    const getDeptName = (atPara: string) => {
      if (!atPara) return '未知部门';
      const paraArr = atPara?.split('@');
      const dept = paraArr.find((item) => item.includes('DeptName'));
      return dept?.split('=')?.[1] || '未知';
    };
    // 处理路由节点事件
    routeEventList.forEach((evt) => {
      passedNodes.value.push({
        EmpName: evt.EmpToT,
        EmpNo: evt.EmpTo,
        FK_Emp: evt.EmpFrom,
        RDT: evt.RDT,
        CDT: evt.RDT,
        FK_Node: evt.NDTo,
        IsRead: true,
        Sender: evt.EmpFromT,
        remains: '无',
        isTimeout: false,
        IsPass: 1,
        SDT: '已完成',
      });
    });
    // console.log({ sendEventList });
    // if (flowCompleted) {
    const startCheckNode = sendEventList.find((evt) => evt.NDFrom == startNode.ID);
    // 放入开始节点
    nodeTrackMap.set(startNode.ID, [
      {
        EmpName: flowInfo?.StarterName,
        EmpNo: flowInfo?.Starter,
        FK_Emp: flowInfo?.Starter,
        RDT: flowInfo?.RDT,
        CDT: flowInfo?.RDT,
        FK_Node: startNode.ID,
        IsRead: true,
        Sender: flowInfo?.StarterName,
        remains: '无',
        isTimeout: false,
        IsPass: 1,
        SDT: '已完成',
        DeptName: getDeptName(startCheckNode?.NodeData),
      },
    ]);
    /**
     * 找到所有到达节点，因为没有记录路由出栈节点,只能根据到达节点处理关系
     */
    for (const evt of sendEventList) {
      let checkedNodes = sendEventList.filter((item) => item.NDFrom == evt.NDFrom && item.NDFrom != item.NDTo);
      if (flowCompleted)
        checkedNodes = [
          ...sendEventList.filter((item) => item.NDTo == evt.NDTo && item.NDFrom != item.NDTo),
          ...trackList.filter((track) => track.NDTo == evt.NDTo && track.ActionType == 27),
        ];

      if (nodeTrackMap.has(evt.NDTo)) continue;
      // checkedNodes = checkedNodes.sort((a, b) => a.RDT.localeCompare(b.RDT));
      // 如果 checkedNodes 的 EmpTo里面是同一个人， 比如退回后重新发送有多条记录，只保留最新一条记录
      const empSet = new Set(checkedNodes.map((item) => item.EmpTo));
      const uniqueEmpToList = Array.from(empSet);
      if (uniqueEmpToList.length < checkedNodes.length) {
        const filteredNodes: Recordable[] = [];
        for (const emp of uniqueEmpToList) {
          const empNodes = checkedNodes.filter((item) => item.EmpTo == emp);
          if (empNodes.length > 0) {
            // 按照 RDT 排序，保留最新的一条记录
            empNodes.sort((a, b) => b.RDT.localeCompare(a.RDT));
            filteredNodes.push(empNodes[0]);
          }
        }
        checkedNodes = filteredNodes;
      }
      const nodeData: Recordable[] = [];
      for (const checkedNode of checkedNodes) {
        // const prevNodeSendTime = trackList.find((item) => item.NDTo == evt.NDTo && item.NDFrom != item.NDTo)?.RDT || checkedNode?.RDT;
        let prevNodeSendTime = checkedNode?.RDT;
        if (!prevNodeSendTime) trackList.find((item) => item.NDTo == evt.NDTo && item.NDFrom != item.NDTo)?.RDT;
        nodeData.push({
          EmpName: evt.EmpToT,
          EmpNo: evt.EmpTo,
          FK_Emp: evt.EmpTo,
          RDT: prevNodeSendTime,
          CDT: evt.RDT,
          FK_Node: evt.NDTo,
          IsRead: true,
          Sender: evt.EmpFromT,
          remains: '无',
          isTimeout: false,
          IsPass: 1,
          SDT: '已完成',
          PrevNodeID: evt.NDFrom,
          DeptName: getDeptName(checkedNode?.NodeData),
          Msg: checkedNode?.Msg,
          ActionType: evt.ActionType, // 添加动作类型
          ActionTypeText: evt.ActionTypeText, // 添加动作类型文本
        });
      }
      nodeTrackMap.set(evt.NDTo, nodeData);
    }

    for (const evt of ccEventList) {
      let checkedNodes = checkedEventList.filter((item) => item.NDFrom == evt.NDFrom);
      if (flowCompleted) checkedNodes = checkedEventList.filter((item) => item.NDTo == evt.NDTo);
      const nodeData: Recordable[] = [];
      for (const checkedNode of checkedNodes) {
        nodeData.push({
          EmpName: evt.EmpToT,
          EmpNo: evt.EmpTo,
          FK_Emp: evt.EmpTo,
          RDT: evt.RDT,
          CDT: evt.RDT,
          FK_Node: evt.NDTo,
          IsRead: true,
          Sender: evt.EmpFromT,
          remains: '无',
          isTimeout: false,
          IsPass: 1,
          SDT: '已完成',
          DeptName: getDeptName(checkedNode?.NodeData),
        });
      }
      nodeTrackMap.set(evt.NDTo, nodeData);
    }

    // 对于有审核事件的节点更新审核信息
    const auditEvtList = trackList.filter((item) => item.ActionType == 22);
    for (const [key, val] of nodeTrackMap) {
      const evt = auditEvtList.find((evt) => evt.NDFrom == key);
      if (evt) {
        if (Array.isArray(val)) {
          for (const v of val) {
            v.EmpName = evt?.EmpFromT;
            v.EmpNo = evt?.EmpTo;
            v.DeptName = getDeptName(evt?.NodeData);
          }
          continue;
        }
        val.EmpName = evt?.EmpFromT;
        val.EmpNo = evt?.EmpTo;
        val.DeptName = getDeptName(evt?.NodeData);
      }
    }
    // 为节点数据设置头像（兼容数组与对象）
    const buildAvatar = async (empNo: string) => {
      let avatarSrc = userIcon + empNo + '.png';
      try {
        await checkImg(avatarSrc);
      } catch (_) {
        avatarSrc = DefaultUserIcon;
      }
      return avatarSrc;
    };
    for (const value of nodeTrackMap.values()) {
      if (Array.isArray(value)) {
        for (const v of value) {
          v.avatar = await buildAvatar(v.FK_Emp);
        }
        // 兼容后续直接读取 avatar 的场景
        (value as any).avatar = value[0]?.avatar;
      } else if (value && value.FK_Emp) {
        value.avatar = await buildAvatar(value.FK_Emp);
      }
    }
    // 获取节点用时
    const getDurationByPrevNode = (targetNode: Recordable) => {
      if (targetNode.FK_Node == startNode.ID) return '0秒';
      const endTime = new Date(targetNode.CDT.replace(/-/g, '/')).getTime();
      const startTime = new Date(targetNode.RDT.replace(/-/g, '/')).getTime();
      const duration = endTime - startTime;
      if (duration == 0) {
        return '无';
      }
      const dayjsObj = dayjs.duration(duration);
      return formatTime(dayjsObj);
    };
    // 循环所有节点，找到经过的节点
    for (const node of compNodes) {
      const passedNodes = nodeTrackMap.get(node.ID);
      if (passedNodes) {
        if (node.NodeType == NodeType.Normal) {
          node.person = [];
          for (const passedNode of passedNodes) {
            node.person.push({
              ...passedNode,
              duration: getDurationByPrevNode(passedNode),
            });
          }
          node.IsPass = 1;
          node.ShowPerson = true;
          node.Icon = userIcon + (passedNodes.length > 0 ? passedNodes[0].FK_Emp + '.png' : '');
          node.nodeState = NodeState.finished;
        } else if (node.NodeType == NodeType.CC) {
          node.person = [];
          for (const passedNode of passedNodes) {
            node.person.push({
              ...passedNode,
            });
          }
          node.IsPass = 1;
          node.ShowPerson = false;
          node.nodeState = NodeState.finished;
        } else {
          node.IsPass = 1;
          node.ShowPerson = false;
          node.nodeState = NodeState.finished;
        }
      }
      if (Array.isArray(compPrevNodes) && compPrevNodes.length > 0) {
        const { ID } = node;
        const handlers = compPrevNodes.filter((prevNode) => prevNode.FK_Node == ID);
        if (handlers.length > 0) {
          let isAllPass = true;
          handlers.forEach((item) => {
            isAllPass = isAllPass && item.IsPass === 1;
          });
          node.nodeState = isAllPass ? NodeState.finished : NodeState.progress;
          // 即使没有全部完成，仍然需要判断前驱节点是不是空白
          node.person = handlers.map((handler) => {
            handler.expand = false;
            if (handler.AtPara) {
              const paraArr = handler.AtPara?.split('@');
              const dept = paraArr.find((item) => item.includes('DeptName'));
              if (dept) {
                handler.DeptName = dept?.split('=')?.[1] || '未知';
              }
              // gwl.DeptName = dept;
            }
            return {
              ...handler,
              ...calcTaskTime(handler, startNode.ID),
              expand: false,
            };
          });
          node.Icon = userIcon + node.person.FK_Emp + '.png';
          node.ShowPerson = true;
        }
      }

      const sas = selectAccpers.value.filter((item) => item.FK_Node == node.ID);
      if (sas.length > 1) {
        node.EmpName = '多人处理';
      } else if (sas.length == 1) {
        node.EmpName = sas[0].EmpName;
      }

      node.waitingAccpers = sas;

      if (!passedNodes) {
        //未来节点
        node.person = null;
        node.nodeState = NodeState.waiting;
      }

      const ccs = cclist.value.filter((cc) => cc.NodeIDCC === node.ID);
      if (Array.isArray(ccs) && ccs.length > 0) {
        node.cclist = ccs;
        const gwls = compPrevNodes.filter((pNode) => pNode.FK_Node === ccs[0].NodeIDWork);
        if ((Array.isArray(gwls) && gwls.length > 0) || ccs[0].NodeIDWork == startNodeTrack?.NDFrom) {
          //如果抄送节点的工作节点是经过的状态(是起始节点或者在gwls里)，那么这个抄送节点也是经过的状态
          node.nodeState = NodeState.finished;
          let isAllPass = true;
          gwls.forEach((item) => {
            isAllPass = isAllPass && item.IsPass === 1;
          });
          if (!isAllPass) node.nodeState = NodeState.progress;
        } else {
          // node.nodeState = NodeState.waiting;
        }
      } else {
        node.cclist = null;
      }
    }

    // delete error node
    for (const node of compNodes.filter((node) => node.nodeState == NodeState.progress)) {
      if (node.ID == startNode.ID) continue; // exclude start node
      const dirs = unref(directions);
      const prevNodeList = dirs.filter((dir) => dir.ToNode == node.ID);
      let hasValidPrevNode = false;
      if (prevNodeList.length > 0) {
        const prevNodeIds = prevNodeList.map((item) => item.Node);
        for (const prevNodeId of prevNodeIds) {
          const cNode = nodeTrackMap.get(prevNodeId);
          if (!!cNode) {
            hasValidPrevNode = true;
            break;
          }
        }
      }
      if (hasValidPrevNode) {
        node.nodeState = NodeState.progress;
      } else {
        nodeTrackMap.delete(node.ID);
      }
    }
    const dirs = unref(directions);

    const delNextNodes = (nodeId: string | number) => {
      if (dirs.find((dir) => dir.ToNode === nodeId)) return;
      const nextNodes = dirs.filter((dir) => dir.Node == nodeId);
      if (nextNodes.length == 0) {
        return;
      }
      for (const nextNode of nextNodes) {
        if (nodeTrackMap.has(nextNode.ToNode)) {
          nodeTrackMap.delete(nextNode.ToNode);
          const cnd = compNodes.find((node) => node.ID == nextNode.ToNode);
          cnd.person = [];
          // cnd.waitingAccpers = [];
        }
        delNextNodes(nextNode.ToNode);
      }
    };

    // remove node after progress
    if (flowInfo?.FK_Node) delNextNodes(flowInfo?.FK_Node);

    // 针对退回：基于方向关系隐藏当前节点之后的所有可达节点（未完成流程时）
    if (!flowCompleted && flowInfo?.FK_Node) {
      hiddenFutureNodeIds = new Set<number>();
      const currId = parseInt(flowInfo.FK_Node);
      const dirsAll = unref(directions);
      const visited = new Set<number>();
      const dfs = (nodeId: number) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        const outs = dirsAll.filter((d) => d.Node == nodeId);
        for (const o of outs) {
          const to = Number(o.ToNode);
          if (!hiddenFutureNodeIds.has(to)) hiddenFutureNodeIds.add(to);
          dfs(to);
        }
      };
      dfs(currId);

      for (const node of compNodes) {
        if (hiddenFutureNodeIds.has(Number(node.ID))) {
          if (nodeTrackMap.has(node.ID)) nodeTrackMap.delete(node.ID);
          node.person = null;
          node.ShowPerson = false;
          node.nodeState = NodeState.waiting;
          if (node.NodeType == NodeType.CC) node.cclist = null;
        }
      }
    }
    renderNodes.value = compNodes;
  };

  // 计算时长
  function formatTime(duration) {
    const { years, months, days, hours, minutes, seconds } = duration.$d;
    return `${years > 0 ? years + '年-' : ''}${months > 0 ? months + '月-' : ''}${days > 0 ? days + '天-' : ''} ${hours > 0 ? hours + '小时' : ''}${
      minutes > 0 ? minutes + '分' : ''
    }${seconds > 0 ? seconds + '秒' : ''}`;
  }
  // 计算任务时间
  function calcTaskTime(gwl, startNodeID) {
    // 任务下达日期、应该完成日期、实际完成日期
    const { RDT, SDT, CDT, IsPass, FK_Node } = gwl;
    let person = gwl;
    const RDTObj = new Date(RDT.replace(/-/g, '/')).getTime();
    const CDTObj = new Date(CDT.replace(/-/g, '/')).getTime();
    const SDTObj = new Date(SDT.replace(/-/g, '/')).getTime();
    // 如果已处理
    if (IsPass === 1) {
      if (RDTObj === CDTObj) {
        person.duration = '0秒';
        return;
      }
      const duration = dayjs.duration(CDTObj - RDTObj);
      person.duration = formatTime(duration);
    } else if (IsPass === 0) {
      //计算还剩余或者已超时
      if (SDT != '无') {
        const ms = SDTObj - Date.now(); //有问题
        const remains = ms < 0 ? dayjs.duration(-ms) : dayjs.duration(ms);
        person.remains = formatTime(remains);
        person.isTimeout = ms <= 0;
      } else {
        person.remains = '无';
        person.isTimeout = false;
      }
    }
    if (FK_Node === startNodeID) {
      person.duration = '0秒';
      person.RDT = person.CDT;
    }
    return person;
  }

  const FUTURE_COLOR = '#A1B1C1';
  const nodeColorStyle = {
    [NodeState.waiting]: '#2080f0',
    [NodeState.finished]: '#4D9900',
    [NodeState.progress]: '#FF9933',
  };
  const trackWrapper = shallowRef<HTMLElement>();
  const closePreviewTimer = ref<any>(null);
  const subFlowList = ref<Array<Recordable>>([]);
  const subflowInfo = reactive<Recordable>({
    visible: false,
    offsetRight: '400px',
    offsetTop: '300px',
    params: {},
    enlarge: false,
    width: '800px',
    height: '600px',
  });
  const subChartStyle = computed(() => {
    return {
      right: subflowInfo.offsetRight,
      top: subflowInfo.offsetTop,
      width: subflowInfo.width,
      height: subflowInfo.height,
    };
  });
  const calcPosition = () => {
    const rect = trackWrapper.value?.getBoundingClientRect();
    if (!rect) return;
    const windowWidth = subflowInfo.enlarge ? 1600 : 800;
    const windowHeight = subflowInfo.enlarge ? 900 : 600;
    let right = (rect.width - windowWidth) / 2;
    subflowInfo.offsetRight = right < 0 ? '400px' : right + 'px';
    let top = (rect.height - windowHeight) / 2 + rect.top;
    subflowInfo.offsetTop = top < 0 ? '300px' : top + 'px';
  };
  const changeWindowSize = () => {
    subflowInfo.enlarge = !subflowInfo.enlarge;
    subflowInfo.width = subflowInfo.enlarge ? '1600px' : '800px';
    subflowInfo.height = subflowInfo.enlarge ? '900px' : '600px';
    calcPosition();
  };
  const closeSubflowWindow = () => {
    subflowInfo.visible = false;
  };
  const selectSubFlow = (flow: Recordable) => {
    subflowInfo.params = flow;
    calcPosition();
    subflowInfo.visible = true;
  };

  //请求数据
  const loadData = async () => {
    try {
      loading.value = true;
      const { FlowNo, FK_Flow, WorkID = 0, FID = 0 } = props.params;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler.AddPara('FK_Flow', FlowNo || FK_Flow);
      handler.AddPara('WorkID', WorkID);
      handler.AddPara('FID', FID);
      const flowData = await handler.DoMethodReturnJson<Recordable>('Chart_Init');
      console.info(flowData);
      await directions.value.Retrieve('FK_Flow', FlowNo || FK_Flow); //线
      flowInfo = flowData.FlowInfo?.[0] || null;
      flowCompleted = flowData.FlowInfo?.[0].WFState == 3; // 判断流程是否完成
      labels.value = flowData.WF_LabNote;
      nodes.value = flowData.WF_Node; //节点
      // 加载子流程数据
      // subFlowList.value = flowData.WF_NodeSubFlow;
      subFlowList.value = flowData.WF_GenerWorkFlow;
      // await loadSubFlow(flowData.WF_GenerWorkFlow);

      const nodeEns = new BSEntities('BP.WF.Nodes');
      await nodeEns.Retrieve('FK_Flow', FK_Flow);
      nodes.value.forEach((node) => {
        if (!node.hasOwnProperty('NodeID') && node.hasOwnProperty('ID') && !!node['ID']) {
          node.NodeID = node?.ID;
        }
        const targetNode = nodeEns.getData().find((nodeEn) => nodeEn.NodeID == node.NodeID);
        if (targetNode) {
          node.UIWidth = targetNode.UIWidth;
          node.UIHeight = targetNode.UIHeight;
        }
      });
      passedNodes.value = flowData.WF_GenerWorkerlist || []; //finished和progress的处理人

      tracks.value = flowData.Track; //轨迹，已经产生的操作
      //未来接收人
      const flow = new FlowEntity(FK_Flow);
      await flow.Retrieve();

      const calcFutureHandler = flow.IsFullSA;
      if (calcFutureHandler == 1) {
        const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
        handler1.AddPara('WorkID', WorkID);
        const result = await handler1.DoMethodReturnString('GetFutureNodes');
        const SAs = new SelectAccpers();
        await SAs.Retrieve('WorkID', WorkID);
        selectAccpers.value = result['SelectAccpers'] || [];
        //开始节点无法计算未来处理人
        // selectAccpers.value = [];
        for (const user of selectAccpers.value!) {
          let avatarSrc = userIcon + user.FK_Emp + '.png';
          try {
            await checkImg(avatarSrc);
          } catch (_) {
            avatarSrc = DefaultUserIcon;
          }
          user.avatar = avatarSrc;
        }
      }

      //抄送
      const ccs = new CCLists();
      await ccs.Retrieve('WorkID', WorkID);
      cclist.value = ccs;
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };

  const getNodeDesc = (relateUsers: Array<Recordable> | null, isPass: boolean) => {
    let text = '';
    if (!relateUsers) return { text, lines: 0 };
    if (relateUsers.length > 2) {
      return { text: `${relateUsers[0].EmpName} ${relateUsers[1].EmpName} 等${relateUsers.length}人${flowCompleted ? '' : '待'}处理`, lines: 1 };
    }

    const lines: string[] = [];
    relateUsers.forEach((user) => {
      const dt = isPass ? user.CDT : user.RDT;
      let time = dt;
      if (/\d{2}:\d{2}:\d{2}$/.test(dt)) {
        time = dt?.substring(0, dt?.length - 3);
      }

      if (typeof user.EmpName === 'string' && user.EmpName.includes(',')) {
        const emps = user.EmpName.split(',').filter((item) => !!item);
        if (emps.length > 2) {
          lines.push(`${emps[0]} ${emps[1]} 等${emps.length}人 ${time}`);
        } else {
          lines.push(emps.join(' ') + ' ' + time);
        }
      } else {
        const actionLabel = user.ActionType === 2 ? '[退回] ' : '';
        lines.push(`${actionLabel}${user.EmpName} ${time}`);
      }
    });

    text = lines.join('\n');
    return { text, lines: Math.max(1, lines.length) };
  };

  const initTrackChart = async () => {
    const wRect = trackWrapper.value!.getBoundingClientRect();

    const width = wRect.width;
    const height = window.innerHeight - wRect.top;
    initGraph(trackWrapper.value!, width, height, true);
    const data = convertData(unref(renderNodes), unref(directions) as Directions, unref(labels));
    if (!graph.value) {
      message.error('初始化设计器失败');
      return;
    }
    // const pastNodeList = passedNodes.value.map((node) => node.FK_Node);

    for (const node of passedNodes.value!) {
      let avatarSrc = userIcon + node.FK_Emp + '.png';
      try {
        await checkImg(avatarSrc);
      } catch (_) {
        avatarSrc = DefaultUserIcon;
      }
      node.avatar = avatarSrc;
    }

    for (const node of data.nodes!) {
      const { x, y } = graph.value.clientToLocal(node.x!, node.y!);
      node.x = x;
      node.y = y;
      node.tools = [];
      if (node.shape === 'graph-tag') {
        continue;
      }
      node.attrs!.id_display.text = '';
      // 如果流程还在进行中
      // let currentRouteNode;
      // if (!flowCompleted) currentRouteNode = passedNodes.value.find((pastNode) => pastNode.FK_Node === node.data.NodeID);
      // else
      const currentRouteNode = nodeTrackMap.get(node.data.NodeID);
      // 如果经过了此节点
      if (currentRouteNode) {
        // let avatarSrc = userIcon + currentRouteNode.FK_Emp + '.png';
        node.zIndex = 100;
        node.attrs!.img = {
          x: 10,
          y: Math.max(0, ((node.height || 40) - 20) / 2),
          width: 20,
          height: 20,
          href: currentRouteNode.avatar,
        };
        node.attrs!.body.strokeWidth = 1;
        node.attrs!.body.fill = nodeColorStyle[node.data.nodeState] || '#e0e3e7';
        node.attrs!.text.fill = 'white';
        node.attrs!.body.stroke = nodeColorStyle[node.data.nodeState] || '#e0e3e7';
        if (node.data.NodeType == 0) {
          const isPassIndicator = Array.isArray(currentRouteNode) ? currentRouteNode.every((v: any) => v.IsPass === 1) : (currentRouteNode as any).IsPass;
          const descInfo = getNodeDesc(node.data.person, isPassIndicator);
          const lineHeight = 14;
          const verticalPadding = 8; // 确保上下留白一致
          const trackBoxHeight = Math.max(18, descInfo.lines * lineHeight + verticalPadding * 2);

          if (node.data.RunModel == 2) {
            node.attrs!.img.x = 18;
          }

          node.markup = [
            {
              tagName: 'polygon',
              selector: 'body',
            },
            {
              tagName: 'image',
              selector: 'img',
            },
            {
              tagName: 'text',
              selector: 'label',
            },
            {
              tagName: 'text',
              selector: 'id_display',
            },
            {
              tagName: 'rect',
              selector: 'track_box',
            },
            {
              tagName: 'text',
              selector: 'track_text',
            },
          ];

          // 设置轨迹信息框
          if (descInfo.text) {
            const nodeWidth = node.width || 120;

            node.attrs!.track_box = {
              refX: '50%',
              refY: '100%',
              x: -nodeWidth / 2,
              y: 6,
              width: nodeWidth,
              height: trackBoxHeight,
              fill: '#E6F7FF',
              stroke: '#91caff',
              'stroke-dasharray': '3,2',
              'stroke-width': 1,
              rx: 6,
            };

            node.attrs!.track_text = {
              refX: '50%',
              refY: '100%',
              x: 0,
              y: 6 + trackBoxHeight / 2,
              text: descInfo.text,
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              'font-size': 10,
              'font-family': 'Arial, sans-serif',
              fill: '#0958d9',
            };
          } else {
            // 如果没有轨迹信息，隐藏轨迹框
            node.attrs!.track_box = {
              visibility: 'hidden',
              width: 0,
              height: 0,
            };
            node.attrs!.track_text = {
              visibility: 'hidden',
              text: '',
            };
          }
        }
        // 未经过节点
      } else if (flowCompleted) {
        node.attrs!.body.fill = '#FFFFFF';
        node.attrs!.body.stroke = '#A1B1C1';
        node.attrs!.text.fill = '#262626';
      } else {
        // 未来接收人
        if (Array.isArray(node.data.waitingAccpers) && node.data.waitingAccpers.length > 0) {
          const futureHandlers = node.data.waitingAccpers.map((user) => user.EmpName);
          const futureText =
            futureHandlers.length > 2 ? `等待处理: ${futureHandlers[0]}, ${futureHandlers[1]} 等${futureHandlers.length}人` : `等待处理: ${futureHandlers.join(', ')}`;
          // 根据文本长度计算高度，长文本可能需要换行
          const estimatedLines = Math.ceil(futureText.length / 20); // 大概每20个字符一行
          const lineHeight = 14;
          const verticalPadding = 8; // 确保上下留白一致
          const trackBoxHeight = Math.max(18, estimatedLines * lineHeight + verticalPadding * 2);

          node.zIndex = 100;
          node.attrs!.img = {
            x: 10,
            y: Math.max(0, ((node.height || 40) - 20) / 2),
            width: 20,
            height: 20,
            href: node.data.waitingAccpers[0].avatar,
          };
          node.attrs!.body.strokeWidth = 1;
          node.attrs!.body.fill = FUTURE_COLOR;
          node.attrs!.text.fill = 'white';
          node.attrs!.body.stroke = FUTURE_COLOR;
          node.markup = [
            {
              tagName: 'polygon',
              selector: 'body',
            },
            {
              tagName: 'image',
              selector: 'img',
            },
            {
              tagName: 'text',
              selector: 'label',
            },
            {
              tagName: 'rect',
              selector: 'track_box',
            },
            {
              tagName: 'text',
              selector: 'track_text',
            },
          ];

          // 设置未来处理人信息框
          const nodeWidth = node.width || 120;

          node.attrs!.track_box = {
            refX: '50%',
            refY: '100%',
            x: -nodeWidth / 2,
            y: 6,
            width: nodeWidth,
            height: trackBoxHeight,
            fill: 'rgba(161, 177, 193, 0.12)',
            stroke: FUTURE_COLOR,
            'stroke-dasharray': '3,2',
            'stroke-width': 1,
            rx: 6,
          };

          node.attrs!.track_text = {
            refX: '50%',
            refY: '100%',
            x: 0,
            y: 6 + trackBoxHeight / 2,
            text: futureText,
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'font-size': 10,
            'font-family': 'Arial, sans-serif',
            fill: FUTURE_COLOR,
          };
        } else {
          node.attrs!.body.fill = 'white';
        }
      }
    }
    // 当前进行中的节点
    const progressNodes = data.nodes!.filter((node) => node.data.nodeState == NodeState.progress);
    // 连接线处理还原为默认布局（避免顶部叠线导致的回旋）
    // 退回边集合（NDFrom -> NDTo）
    const returnPairs = trackList.filter((t) => t.ActionType == 2).map((t) => ({ from: String(t.NDFrom), to: String(t.NDTo) }));
    const returnPairSet = new Set(returnPairs.map((p) => `${p.from}-${p.to}`));
    for (const edge of data.edges!) {
      if (Array.isArray(edge.vertices)) {
        const np: typeof edge.vertices = [];
        for (const point of edge.vertices) {
          const localPoint = graph.value.pageToLocal(point.x, point.y);
          np.push({ x: localPoint.x, y: localPoint.y });
        }
        edge.vertices = np;
      }
      edge.tools = [];
      const targetNodes = nodeTrackMap.get(parseInt(edge.target as string));
      const targetList = Array.isArray(targetNodes) ? targetNodes : targetNodes ? [targetNodes] : [];
      const targetNode = targetList[0];
      const sourceNodeObj = data.nodes!.find((n) => n.id == edge.source);
      const targetNodeObj = data.nodes!.find((n) => n.id == edge.target);

      // 如果连接线目标节点已经经过 或者将要经过
      if (targetNode) {
        // const sameLevelNodes = passedNodes.value.filter((node) => node.FK_Node == edge.source);
        // const isNotUnique = sameLevelNodes.find((node) => node.IsPass == 1);
        // 如果此路径即将到达
        const anyUnPassed = targetList.some((tn) => tn.IsPass == 0);
        if (anyUnPassed && progressNodes.find((node) => node.id == targetNode.FK_Node)) {
          // edge.connector = { name: 'smooth' };
          edge.attrs = {
            line: {
              stroke: '#459dff',
              strokeDasharray: 5,
              targetMarker: 'classic',
              style: {
                animation: 'ant-line 30s infinite linear',
              },
            },
          };
        } else if (targetList.some((tn) => tn.IsPass == 1)) {
          let isValidSource = trackList.find((track) => track.NDFrom == edge.source && track.NDTo == edge.target && [1, 6, 26, 32, 2, 8, 221].includes(track.ActionType));
          if (isValidSource) {
            edge.attrs.line.stroke = '#1296db';
          } else {
            // 由于后端数据不准确，需要手动判断路由节点出口
            // 如果这个节点前一个节点是路由节点，并且他只被一个节点连接，且已经经过，那么可以认为这个节点是路由节点的出口
            const sources = data.edges!.filter((item) => item.target == targetNode.FK_Node);
            const prevNode = data.nodes!.find((node) => node.id == edge.source);
            if (sources.length == 1 && prevNode?.data?.NodeType == NodeType.Route) {
              edge.attrs.line.stroke = '#1296db';
            }
          }
        }
        // 如果流程完成，填充抄送节点
        if (flowCompleted) {
          const prevNode = nodeTrackMap.get(parseInt(edge.source as string));
          const currNode = data.nodes!.find((node) => node.id == edge.target);
          if (prevNode?.IsPass == 1 && currNode!.data.NodeType == NodeType.CC) {
            edge.attrs.line.stroke = '#1296db';
            currNode!.attrs!.body.fill = '#4D9900';
          }
        }
      } else {
        const isValidTarget = selectAccpers.value.find((user) => user.FK_Node == edge.target);
        const isValidSource =
          selectAccpers.value.find((user) => user.FK_Node == edge.source) || edge.source == flowInfo?.FK_Node || progressNodes.find((node) => node.id == edge.source);

        // console.log({isValidTarget})
        if (isValidTarget && isValidSource) {
          edge.attrs = {
            line: {
              stroke: FUTURE_COLOR,
              strokeDasharray: 10,
              targetMarker: 'classic',
              style: {
                animation: 'ant-line 100s infinite linear',
              },
            },
          };
        }
      }

      // Fallback：当源与目标节点都已完成但未被数据显式关联时，仍高亮连线，解决部分分流/合流边未着色
      if (!edge.attrs) edge.attrs = { line: {} as any } as any;
      if (!edge.attrs.line) edge.attrs.line = {} as any;
      // 如果发生退回（流程未结束），避免高亮当前节点之后的连线
      const currentFkNodeStr = flowInfo?.FK_Node ? String(flowInfo.FK_Node) : '';
      const avoidAfterCurrent = !flowCompleted && !!currentFkNodeStr && (String(edge.source) == currentFkNodeStr || String(edge.target) == currentFkNodeStr);
      const isHiddenFutureEdge = !flowCompleted && hiddenFutureNodeIds.has(Number(edge.target));
      if (
        !avoidAfterCurrent &&
        !isHiddenFutureEdge &&
        !edge.attrs.line.stroke &&
        sourceNodeObj?.data?.nodeState == NodeState.finished &&
        targetNodeObj?.data?.nodeState == NodeState.finished
      ) {
        edge.attrs.line.stroke = '#1296db';
      }

      // 去除扇出顶点插入，保持默认路由

      // 退回路径高亮（优先级最高，覆盖上述样式）
      const edgeKey = `${String(edge.source)}-${String(edge.target)}`;
      if (returnPairSet.has(edgeKey)) {
        edge.attrs.line.stroke = '#ff4d4f';
        edge.attrs.line.strokeDasharray = 6;
        edge.attrs.line.strokeWidth = 2 as any;
        edge.attrs.line.targetMarker = 'classic';
        edge.zIndex = 200;
        edge.attrs.line.style = { animation: 'ant-line 25s infinite linear' } as any;
      }
    }

    // 对于没有显式连线的退回路径，补绘一条临时红色虚线边
    for (const p of returnPairs) {
      const exists = data.edges!.some((e) => String(e.source) == p.from && String(e.target) == p.to);
      if (!exists) {
        data.edges!.push({
          source: p.from,
          target: p.to,
          attrs: {
            line: {
              stroke: '#ff4d4f',
              strokeDasharray: 6,
              strokeWidth: 2,
              targetMarker: 'classic',
              style: { animation: 'ant-line 25s infinite linear' },
            },
          },
          tools: [],
        } as any);
      }
    }

    // 子流程
    const allSubFlows = new SubFlows();
    await allSubFlows.Retrieve('FK_Flow', props.params.FK_Flow);
    //const subFlows = new SubFlows();
    //await subFlows.Retrieve('FK_Node', props.params.FK_Node, 'SubFlowType', 0, 'Idx');
    // 子流程处理
    debugger
    for (const targetNodeID of subFlowList.value.map((item) => item.PNodeID)) {
      const edgeList = data.edges?.filter((edge) => edge.source == targetNodeID) || [];
      for (const edge of edgeList) {
        const node = data.nodes?.find((node) => node.id == edge.target);
        if (node?.data?.NodeType == NodeType.SubFlowNode) {
          const nodeSFList = allSubFlows.filter(sf => sf.SubFlowShowNodeID == node.id)|| [];
          //获取对应的子流程
          const flowNos = nodeSFList?.map(item=>item.SubFlowNo).join(',') || '';
          const targetFlows = subFlowList.value.filter((sub) => sub.PNodeID == targetNodeID && flowNos.includes(sub.FK_Flow));
          node.label = '';
          node.attrs!.text.text = `当前共有${targetFlows.length}个子流程`;
          node.attrs!.text.fill = '#7756cc';
          node.attrs!.body.stroke = '#7756cc';
          node.data.targetFlows = targetFlows;
          edge.attrs = {
            line: {
              stroke: '#7756cc',
              strokeDasharray: 5,
              targetMarker: 'classic',
              style: {
                animation: 'ant-line 30s infinite linear',
              },
            },
          };
        }
      }
    }
    // end
    graph.value.fromJSON(data);
    const { drawWidth, drawHeight } = calcDrawSize(data);
    if (drawWidth > width || drawHeight > height) {
      graph.value.zoomToFit();
    }
    graph.value.centerContent();
    // 实现移动端拖动
    addMobileSupport(trackWrapper.value!, graph.value);
    // end
    const wrapperBoundingRect = trackWrapper.value?.getBoundingClientRect();

    // events
    graph.value.on('node:mouseenter', ({ node }) => {
      clearTimer();
      if (!wrapperBoundingRect) return;

      const previewData = node.getData();
      if (previewData.NodeType !== NodeType.SubFlowNode) {
        if (!Array.isArray(previewData.person)) return;
        if (previewData.person.length === 0) return;
      }
      let panelWidth = 400;
      if (Array.isArray(previewData.waitingAccpers) && previewData.waitingAccpers.length > 0) {
        panelWidth = 160;
      }
      let panelHeight = 0;
      if (Array.isArray(previewData.person)) {
        if (previewData.person?.length < 3) panelHeight = 130 * previewData.person.length;
        else panelHeight = 400;
      }
      const panelPos = calcPanelPosition(
        wrapperBoundingRect,
        node.size().width,
        node.size().height,
        graph.value!.localToGraph(node.position()),
        panelWidth,
        // (previewData.person?.length || 0) * 130,
        panelHeight,
      );
      previewPos.x = panelPos.x;
      previewPos.y = panelPos.y;
      previewNode.value = previewData;
    });

    graph.value.on('node:mouseleave', () => {
      closePreviewTimer.value = setTimeout(() => {
        previewNode.value = null;
        clearTimer();
      }, 150);
    });
    // end
  };

  const showId = ref(0);
  const renderId = () => {
    const nodes = graph.value!.getNodes();
    for (const node of nodes) {
      node.attr('id_display/text', showId.value == 1 ? `[ ${node.getData().NodeID} ]` : '');
    }
  };

  const clearTimer = () => {
    clearTimeout(closePreviewTimer.value);
    closePreviewTimer.value = null;
  };
  const onLeavePreviewModal = () => {
    clearTimer();
    previewNode.value = null;
  };

  onMounted(async () => {
    await loadData();
    await analyzeFlow();
    initTrackChart();
  });
</script>
<style lang="less" scoped>
  .track-page {
    position: relative;
  }

  .id-control {
    position: absolute;
    z-index: 2000;
    left: 10px;
    top: 80px;
  }

  .preview-container {
    position: absolute;
    cursor: move;
    line-height: 28px;
    color: #333333;
    font-size: 12px;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: all ease 0.33s;
    z-index: 999;

    .basis-info {
      display: flex;
      align-items: center;
      flex-direction: column;

      .user {
        display: flex;

        .node-user-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }
      }
    }

    .node-person-info {
      // position: absolute;
      // left: 106%;
      line-height: 18px;
      padding: 2px 6px;
      background: white;
      //border-radius: 8px;
      color: #999999;
      box-sizing: border-box;
      cursor: pointer;
      transition: all ease 0.2s;
      z-index: 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .close {
        position: absolute;
        top: 2px;
        right: 6px;
        font-size: 12px;
      }
    }

    .node-info-panel-box {
      box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
      max-height: 400px;
      overflow-y: scroll;
    }

    .node-info-panel {
      background-color: rgb(250 249 228);
      padding: 2px 8px;
      font-size: 12px;
      color: black;
      border: 1px solid #eeeeee;
      cursor: auto;
      user-select: text;

      .panel-title {
        text-align: center;
        font-weight: 600;
      }

      .panel-column {
        display: flex;
        align-items: center;
        justify-content: center;

        .cell {
          flex-shrink: 0;
          font-size: 12px;
          box-sizing: border-box;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 8px;
          margin-top: 1px;
          margin-bottom: 0;
        }

        .key {
          flex: 0.35;
          background-color: #eeeeee;
        }

        .val {
          flex: 0.65;
          background-color: #f8f8f8;
        }
      }
    }

    .empInfo {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      border-right-width: 1px;
      border-color: #eeeeee;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  :deep(.graph-tag) {
    color: #4e7cba;
    text-align: center;
    background-color: transparent;
    white-space: nowrap;
    font-size: 12px;
  }

  .fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .sub-flow-chart {
    position: fixed;
    z-index: 3000;
    right: 400px;
    top: 300px;
    width: 800px;
    height: 600px;
    overflow: hidden;
    background-color: white;
    border-radius: 12px;
    border: 1px solid #310f1b;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;

    .title {
      height: 40px;
      line-height: 40px;
      padding: 0 12px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #310f1b;

      .options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 60px;
      }
    }
  }
</style>
