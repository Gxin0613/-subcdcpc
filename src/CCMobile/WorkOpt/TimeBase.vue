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
    <div v-if="modalObj.visiable == false" style="margin-left: 20px; padding-top: 63px">
      <Timeline mode="left">
        <TimelineItem v-for="node in timeBase" :key="node.MyPk" :class="getClass(node)">
          <template #dot>
            <!-- 未来节点用数字作时间轴icon -->
            <div v-if="node.nodeState == 'waiting' && node.nodeType == timeLineNodeType.flowNode" class="numberIconBox">
              <Icon icon="octicon:circle-24" class="circle"> </Icon>
              <div class="numberIcon">
                <span>{{ node.icon }}</span>
              </div>
            </div>
            <Icon :icon="node.icon" :style="node.iconStyle" v-else />
          </template>
          <template #label>
            <div style="margin-right: 10px; font-size: 16px" v-if="node.nodeType == timeLineNodeType.flowNode && node.nodeState != 'waiting'">{{ node.lable }}</div>
            <!-- 未来节点作浅色显示 -->
            <div style="margin-right: 10px; font-size: 16px; color: rgba(0, 0, 0, 0.45)" v-if="node.nodeType == timeLineNodeType.flowNode && node.nodeState == 'waiting'">{{
              node.lable
            }}</div>
            <!-- 用户的头像，姓名，部门 -->
            <div v-if="node.nodeType == timeLineNodeType.gwlNode" style="margin-right: 10px; font-size: 15px">
              <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center">
                <div style="width: 100px; display: flex; justify-content: center">
                  <img :src="node.empIcon" @error="defaultIcon" :width="30" />
                </div>
                <TypographyText style="width: 100px; word-wrap: none; text-align: center; display: block" :ellipsis="{ tooltip: node.empName }" :content="node.empName" />
                <TypographyText style="width: 100px; word-wrap: none; text-align: center; display: block" :ellipsis="{ tooltip: node.empDept }" :content="node.empDept" />
              </div>
            </div>
          </template>
          <div v-if="node.nodeState == 'finished'">
            <!-- 基本信息 -->
            <div v-if="node.nodeType == timeLineNodeType.flowNode" style="margin-bottom: 20px">
              <Row>
                <Col :span="4">
                  <img :src="node.actionIconUrl" style="height: 25px; width: 25px" />
                </Col>
                <Col :span="20">
                  <div style="font-size: 16px">{{ node.actionTypeText }}</div>
                </Col>
              </Row>
              <Row>
                <div>{{ node.RDT }}</div>
              </Row>
            </div>
            <div v-if="node.nodeType == timeLineNodeType.gwlNode" style="height: 50px"></div>
            <!-- 接收信息 接收的节点和接收人 -->
            <div v-if="node.nodeType == timeLineNodeType.toNode" style="margin-bottom: 20px">
              <Row>
                <span>{{ node.ToNodeLab }}{{ '：' }}</span>
                <span style="color: green">{{ node.ToNodeName }}</span>
              </Row>
              <Row>
                <span>{{ node.ToEmpLab }}{{ '：' }}</span>
                <span style="color: green">{{ node.ToEmpName }}</span>
              </Row>
            </div>
            <!-- 动作携带的信息，审核信息，退回信息等 -->
            <div v-if="node.nodeType == timeLineNodeType.msgNode" style="margin-bottom: 20px">
              <Row>
                <span>{{ node.msgLab }}{{ '：' }}</span>
                <span style="color: green">{{ node.msg }}</span>
              </Row>
            </div>
            <!-- 查看表单 -->
            <div v-if="node.nodeType == timeLineNodeType.frmNode" style="margin-bottom: 20px">
              <a @click="openModal(node.frmParams!)">{{ '查看表单' }}</a>
            </div>
            <!-- 抄送人列表 -->
            <div v-if="node.nodeType == timeLineNodeType.ccNode" style="margin-bottom: 20px">
              <Row>{{ '抄送给：' }}</Row>
              <Row v-for="(item, index) in node.cclist" :key="index" style="align-items: center; height: 25px">
                <Icon icon="entypo:dot-single" />
                <TypographyText
                  style="width: 100px; margin-right: 10px"
                  :ellipsis="{ tooltip: item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName] }"
                  :content="item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName]"
                />
                <div v-if="item[CCListAttr.Sta] == 1 || item[CCListAttr.Sta] == 2" style="color: green; margin-right: 10px; width: 45px">{{ item[CCListAttr.StaText] }}</div>
                <div v-else-if="item[CCListAttr.Sta] == 3" style="color: red; margin-right: 10px; width: 45px">{{ item[CCListAttr.StaText] }}</div>
                <div v-else style="color: #108ee9; margin-right: 10px; width: 45px">{{ item[CCListAttr.StaText] }}</div>
                <div>{{ item[CCListAttr.ReadDT] }}</div>
              </Row>
            </div>
            <!-- 子流程列表 -->
            <div v-if="node.nodeType == timeLineNodeType.subFlowNode" style="margin-bottom: 20px">
              <div>{{ '子流程列表未解析' }}</div>
            </div>
          </div>
          <div v-else-if="node.nodeState == 'progress'">
            <!-- 基本信息 -->
            <div v-if="node.nodeType == timeLineNodeType.flowNode" style="margin-bottom: 20px">
              <Row>
                <Col :span="4">
                  <img :src="node.actionIconUrl" style="height: 25px; width: 25px" />
                </Col>
                <Col :span="20">
                  <div style="font-size: 16px">{{ node.actionTypeText }}</div>
                </Col>
              </Row>
            </div>
            <!-- 未审核的处理人 -->
            <div v-if="node.nodeType == timeLineNodeType.gwlNode" style="margin-bottom: 20px">
              <Row style="white-space: nowrap">{{ '工作到达日期：' }}{{ node.RDT }}</Row>
              <Row style="white-space: nowrap">{{ '工作应完成日期：' }}{{ node.SDT }}</Row>
              <Row
                >{{ '已耗时：' }}<div style="color: red">{{ node.PassTime }}</div></Row
              >
              <Row
                >{{ node.OverTimeLab + '：' }}
                <div v-if="node.OverTimeLab == '还剩余'" style="color: green">{{ node.OverTime }}</div>
                <div v-else-if="node.OverTimeLab == '已超时'" style="color: red">{{ node.OverTime }}</div>
              </Row>
              <Row>
                <Tag v-if="node.isRead == 1" style="background-color: green; color: white; border: 0">{{ node.isReadText }}</Tag>
                <Tag v-else-if="node.isRead == 0" style="background-color: #108ee9; color: white; border: 0">{{ node.isReadText }}</Tag>
              </Row>
            </div>
          </div>
          <div v-else-if="node.nodeState == 'waiting'" style="color: rgba(0, 0, 0, 0.45) !important">
            <!-- 基本信息 -->
            <div v-if="node.nodeType == timeLineNodeType.flowNode" style="margin-bottom: 20px">
              <Row>
                <div style="font-size: 16px">{{ node.actionTypeText }}</div>
              </Row>
            </div>
            <!-- 未来节点处理人 -->
            <div v-if="node.nodeType == timeLineNodeType.accpersNode" style="margin-bottom: 20px">
              <Row style="width: 100%">
                {{ '处理人：' }}
                <!-- 只有一个处理人，作一行显示 -->
                <div v-if="Array.isArray(node.Accpers) && node.Accpers.length == 1" style="width: 90%">
                  <TypographyText
                    style="width: 90%; margin-right: 10px; color: rgba(0, 0, 0, 0.45)"
                    :ellipsis="{ tooltip: node.Accpers[0][SelectAccperAttr.EmpName] + '/' + node.Accpers[0][SelectAccperAttr.DeptName] }"
                    :content="node.Accpers[0][SelectAccperAttr.EmpName] + '/' + node.Accpers[0][SelectAccperAttr.DeptName]"
                  />
                </div>
              </Row>
              <!-- 多个处理人做列表显示 -->
              <Row v-for="(item, index) in node.Accpers" :key="index" style="align-items: center; height: 25px" v-if="node.Accpers.length > 1">
                <Icon icon="entypo:dot-single" />
                <TypographyText
                  style="width: 90%; margin-right: 10px; color: rgba(0, 0, 0, 0.45)"
                  :ellipsis="{ tooltip: item[SelectAccperAttr.EmpName] + '/' + item[SelectAccperAttr.DeptName] }"
                  :content="item[SelectAccperAttr.EmpName] + '/' + item[SelectAccperAttr.DeptName]"
                />
              </Row>
            </div>
            <!-- 未来节点抄送人 -->
            <div v-if="node.nodeType == timeLineNodeType.ccNode" style="margin-bottom: 20px">
              <Row>{{ '抄送给：' }}</Row>
              <Row v-for="(item, index) in node.cclist" :key="index" style="align-items: center; height: 25px">
                <Icon icon="entypo:dot-single" />
                <TypographyText
                  style="width: 90%; margin-right: 10px; color: rgba(0, 0, 0, 0.45)"
                  :ellipsis="{ tooltip: item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName] }"
                  :content="item[CCListAttr.CCToName] + '/' + item[CCListAttr.DeptName]"
                />
              </Row>
            </div>
          </div>
          <div v-else-if="node.nodeType">
            <div style="font-size: 16px; color: rgba(0, 0, 0, 0.45)">{{ node.actionTypeText }}</div>
          </div>
        </TimelineItem>
      </Timeline>
    </div>
    <Popup v-model:show="modalObj.visiable" position="top" :style="{ width: '100%', backgroundColor: '#fafafd' }">
      <NavBar :title="'查看表单'" :fixed="true" left-arrow @click-left="modalObj.visiable = false" />
      <!--      <Track v-if="popModal.modalType == 'TimeBase' && SystemConfig.CustomNo === 'TianYu'" :params="query" />-->
      <Component :is="modalObj.component" :params="modalObj.params" />
    </Popup>
  </Spin>
</template>
<script lang="ts">
  export default {
    name: 'TimeBase',
  };
</script>
<script lang="ts" setup>
  import { Timeline, TimelineItem, message, Row, Col, TypographyText, Drawer, Tag, Spin } from 'ant-design-vue';
  import { Popup, NavBar } from 'vant';
  import Icon from '/@/components/Icon';
  import { FlowNode, GWL, TimeLineNode } from '/@/WF/WorkOpt/OneWork/TimeBaseExt';
  import { markRaw, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { CCListAttr, CCLists } from '/@/WF/TSClass/FlowData/CCList';
  import { SelectAccperAttr } from '/@/WF/TSClass/FlowData/SelectAccper';
  import { NodeSimples } from '/@/WF/Admin/AttrNode/NodeSimple';
  import { ActionType } from '/@/WF/WorkOpt/OneWork/ActionType';
  import { timeLineNodeType, ActionTypeStr } from '/@/WF/WorkOpt/OneWork/TimeBaseExt';
  import WebUser from '/@/bp/web/WebUser';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import dayjs from 'dayjs';
  import { NodeAttr } from '/@/WF/TSClass/Node';
  import { getAppEnvConfig } from '/@/utils/env';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取代理路径
  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  //用户头像图片
  const userIcon = basicPath + '/DataUser/UserIcon/';
  //没有用户头像图片时获取默认图片
  const defaultIcon = (e) => {
    const img = e.srcElement;
    img.src = DefaultUserIcon;
    img.onerror = null;
  };
  const { loadComponent } = useComponentLoader();
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const modalObj = reactive({
    width: window.innerWidth,
    visiable: false,
    url: '',
    component: {},
    params: {},
    bodyStyle: {
      height: window.innerHeight,
      width: window.innerWidth,
    },
  });
  const loading = ref(false);
  const timeBase = ref<Array<TimeLineNode>>([]);
  const ListData = ref<Array<FlowNode>>([]);
  const fNodes = ref<Record<string, any>[]>([]);
  const InitPage = async () => {
    try {
      loading.value = true;
      //轨迹数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('TimeBase_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      //抄送数据
      const CC = new CCLists();
      await CC.Init();
      await CC.Retrieve('WorkID', props.params.WorkID);

      //未经过的处理人
      const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler1.AddPara('WorkID', props.params.WorkID);
      const data1 = await handler1.DoMethodReturnString('GetFutureNodes');
      const selectAccpers = data1['SelectAccpers'] || [];
      fNodes.value = data1['Nodes'] || [];
      //先获取当前流程的节点,用于分组
      const flowNodes = new NodeSimples();
      await flowNodes.Retrieve('FK_Flow', props.params.FK_Flow);
      console.log(data, { CC }, { selectAccpers }, { flowNodes });

      ParseFlowNode(result, selectAccpers, flowNodes, CC); //按照节点整理流程信息
      console.log('listData:', ListData.value);
      ParseTimeBase(); //构造时间轴
      console.log('timeBase:', timeBase.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  /**
   * 整理整个流程的节点信息
   * @param trackData 已经经过的节点的轨迹信息
   * @param Accpers 未经过节点的处理人信息
   * @param flowNodes 流程的所有节点
   * @param ccList 流程的抄送信息
   */
  const ParseFlowNode = (trackData, Accpers: SelectAccperAttr[], flowNodes: NodeAttr[], ccList: Array<CCListAttr>) => {
    const tracks = trackData['Track']; //所有的信息.
    //获得流程引擎注册表信息.
    // const gwf = trackData['WF_GenerWorkFlow'][0];
    //审核组件信息.
    const fwc = trackData['FrmWorkCheck'][0];
    //获得当前节点的工作人员列表.
    const gwls = trackData['WF_GenerWorkerlist'];
    //子流程
    const subFlows = trackData['WF_SubFlow'];
    //解析列表
    const idx = ref(0);
    const trackResults = tracks.filter(
      (track) =>
        track.ActionType != ActionType.FlowBBS &&
        track.ActionType != ActionType.WorkCheck &&
        (fwc.FWCMsgShow == '1' && track.NDFrom == props.params.FK_Node && WebUser.No != track.EmpTo) == false &&
        (track.ActionType == ActionType.ForwardFL && track.NDFrom != parseInt(props.params.FK_Flow) + '01') == false,
    );
    let routeData: Array<FlowNode> = [];
    trackResults.forEach((track) => {
      if (track.FID != 0) {
        //ToDo子线程的解析暂未处理
      }
      const flowNode = <FlowNode>{};
      if (track.ActionType === ActionType.Route) {
        flowNode.RDT = dayjs(track.RDT).format('MM月DD日HH时mm分');
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
        //当前处理人部门
        if (track.NodeData) {
          const nodeDataArr = track.NodeData?.split('@');
          const dept = nodeDataArr.filter((item) => item.includes('DeptName'))[0].split('=')[1];
          flowNode.EmpDept = dept;
        } else {
          flowNode.EmpDept = '无';
        }
        //抄送列表
        flowNode.CCList = [];
        //节点状态
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
      }
      if (track.ActionType === ActionType.CC) {
        flowNode.ToNodeLab = '抄送节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '抄送给';
        flowNode.ToEmpName = track.EmpToT || '';
        flowNode.MsgLab = '抄送内容';
        flowNode.IsOpenFrm = false;
        flowNode.Msg = track.Msg;
      }
      if (track.ActionType === ActionType.UnSend) {
        flowNode.ToNodeLab = '撤销到';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '撤销给';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.MsgLab = '意见';
        flowNode.IsOpenFrm = false;
        flowNode.Msg = '无';
      }

      if (track.ActionType === ActionType.Forward || track.ActionType === ActionType.FlowOver || track.ActionType == ActionType.TeampUp) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '到达人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = CommonConfig.Hide_IsOpenFrm ? true : false;
        flowNode.MsgLab = '审核意见';
        if (track.ActionType == ActionType.TeampUp) flowNode.MsgLab = '会签意见';
        //处理情况的解析
        if (fwc.FWCVer == 0) {
          const checkTrack = tracks.filter((item) => item.NDFrom == track.NDFrom && item.ActionType == ActionType.WorkCheck && item.EmpFrom == track.EmpFrom);
          if (checkTrack.length > 0) flowNode.Msg = checkTrack[0].Msg;
        } else {
          const val = track.Msg.replace('null', '').split('WorkCheck@');
          if (val.length == 2) flowNode.Msg = val[1];
        }
      }

      if (track.ActionType == ActionType.Press) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '接收人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '催办信息';
        flowNode.Msg = track.Msg;
      }
      if (track.ActionType == ActionType.Shift) {
        flowNode.ToNodeLab = '到达节点';
        flowNode.ToNodeName = track.NDToT;
        flowNode.ToEmpLab = '接收人员';
        flowNode.ToEmpName = track.EmpToT;
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '移交信息';
        flowNode.Msg = track.Msg;
      }
      if (track.ActionType == ActionType.Hungup) {
        flowNode.IsOpenFrm = false;
        flowNode.MsgLab = '挂起原因';
        flowNode.Msg = track.Msg;
      }

      flowNode.Msg = flowNode.Msg || '无';
      if (flowNode.Msg == '0') flowNode.Msg = '无';
      if (typeof flowNode.Msg == 'boolean') flowNode.Msg = '';
      if (!!flowNode.Msg && flowNode.Msg != '无') flowNode.Msg = flowNode.Msg.replace(new RegExp('\t\n', 'g'), '<br>').replace('null', '');
      flowNode.RDT = dayjs(track.RDT).format('MM月DD日HH时mm分');
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
      flowNode.SubFlow = subFlows.filter((subFlow) => (subFlow.FK_Node = track.NDFrom && subFlow.SubFlowSta == 1));
      //当前处理人部门
      if (track.NodeData) {
        const nodeDataArr = track.NodeData?.split('@');
        const dept = nodeDataArr.filter((item) => item.includes('DeptName'))[0].split('=')[1];
        flowNode.EmpDept = dept;
      } else {
        flowNode.EmpDept = '无';
      }
      //抄送列表
      //flowNode.CCList = ccList.filter((item) => item[CCListAttr.NodeIDWork] == track.NDFrom);
      flowNode.CCList = ccList.filter((item) => item[CCListAttr.NodeIDCC] == track.NDTo);
      //节点状态
      flowNode.nodeState = 'finished';

      if (track.ActionType != ActionType.Route && routeData.length != 0) {
        flowNode.ToNodeName = routeData[0].ToNodeName;
        flowNode.ToEmpName = flowNode.EmpName;
        ListData.value.push(flowNode);
        for (let i = 0; i < routeData.length; i++) {
          let item = routeData[i];
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
    });
    //是否还有未审核的处理人
    if (Array.isArray(gwls) && gwls.length > 0) {
      const showIsRead = CommonConfig.Hide_IsRead == false ? 1 : -2; //CommonConfig.Hide_IsRead 是否显示已阅读: true 显示
      //当前节点未审核的处理人
      const gwlResults = gwls.filter((gwl) => gwl.IsPass != 1 && gwl.IsPass != 3 && gwl.IsPass >= 0 && gwl.FK_Node == props.params.FK_Node && gwl.IsRead != showIsRead);
      const gwlList: GWL[] = [];
      const flowNode = <FlowNode>{};
      gwlResults.forEach((gwl) => {
        //构造当前节点的处理人列表
        const gwlItem = <GWL>{};
        flowNode.NodeName = gwl.NodeName;
        gwlItem.isRead = parseInt(gwl.IsRead) == 0 ? 0 : 1;
        gwlItem.isReadText = parseInt(gwl.IsRead) == 0 ? '未阅' : '已阅';
        // flowNode.ToEmpLab = '处理人';
        gwlItem.empNo = gwl.FK_Emp;
        gwlItem.empName = gwl.EmpName;
        //部门信息
        if (gwl.AtPara) {
          const atParaArr = gwl.AtPara?.split('@') || [];
          const deptName = atParaArr.find((item) => item.includes('DeptName'));
          if (deptName) {
            gwlItem.empDept = deptName?.split('=')?.[1] || '未知';
          }
          // gwlItem.empDept = deptName;
        }
        gwlItem.RDT = gwl.RDT;
        gwlItem.SDT = gwl.SDT;
        const seconds = dayjs().diff(gwlItem.RDT, 'second');
        gwlItem.PassTime = formatSeconds(seconds);
        if (!gwlItem.SDT || gwlItem.SDT === '无') {
          gwlItem.OverTimeLab = '还剩余';
          gwlItem.OverTime = '无';
        } else {
          if (dayjs().format('YYYY-MM-DD HH:mm:ss') > gwlItem.SDT) {
            gwlItem.OverTimeLab = '已超时';
            const overSeconds = dayjs().diff(gwlItem.SDT, 'second');
            gwlItem.OverTime = formatSeconds(overSeconds);
          } else {
            gwlItem.OverTimeLab = '还剩余';
            const overSeconds = dayjs(gwlItem.SDT).diff(new Date(), 'second');
            gwlItem.OverTime = formatSeconds(overSeconds);
          }
        }
        gwlList.push(gwlItem);
      });
      flowNode.MyPK = '';
      flowNode.nodeState = 'progress';
      flowNode.ActionTypeText = '等待处理';
      flowNode.idx = idx.value++;
      flowNode.gwls = gwlList;
      ListData.value.push(flowNode);
    }
    //未经过的节点
    fNodes.value.forEach(async (node) => {
      let accpers = Accpers.filter((accper) => accper[SelectAccperAttr.FK_Node] == node[NodeAttr.NodeID]);
      accpers = accpers.map((item) => {
        return Object.assign(item, { type: '处理人', EmpName: item[SelectAccperAttr.EmpName] });
      });
      if (Array.isArray(accpers) && accpers.length > 0) {
        let nodeCCList = ccList.filter((item) => item[CCListAttr.NodeIDWork] == node[NodeAttr.NodeID]);
        nodeCCList = nodeCCList.map((item) => {
          return Object.assign(item, { type: '抄送人', EmpName: item[CCListAttr.CCToName] });
        });
        const flowNode = <FlowNode>{};
        flowNode.nodeState = 'waiting';
        flowNode.idx = idx.value++;
        flowNode.NodeName = node[NodeAttr.Name];
        flowNode.Accpers = accpers;
        flowNode.CCList = nodeCCList;
        //当前节点的抄送规则
        ListData.value.push(flowNode);
      } else {
        const flowNode = <FlowNode>{};
        flowNode.nodeState = 'waiting';
        flowNode.idx = idx.value++;
        flowNode.NodeName = node[NodeAttr.Name];
        flowNode.Accpers = [];
        flowNode.CCList = [];
        flowNode.NodeType = node.NodeType;
        //当前节点的抄送规则
        ListData.value.push(flowNode);
      }
    });
  };
  //将节点信息分为不同的时间轴节点
  const ParseTimeBase = () => {
    //遍历所有节点,构造时间轴结构
    ListData.value.forEach((listItem) => {
      if (listItem.nodeState == 'finished') {
        //已经过的节点
        if (listItem.NodeName) {
          //节点信息
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'nodeInfo';
          timeBaseNode.icon = 'ant-design:check-circle-outlined';
          timeBaseNode.iconStyle = 'font-size: 32px; margin: 5px';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.flowNode;
          timeBaseNode.lable = listItem.NodeName;
          timeBaseNode.actionTypeText = listItem.ActionTypeText;
          timeBaseNode.actionIconUrl = ActionTypeStr(listItem.ActionType);
          timeBaseNode.RDT = listItem.RDT;
          timeBase.value.push(timeBaseNode);
        }
        if (listItem.EmpName) {
          //操作人信息
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'gwlNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.gwlNode;
          timeBaseNode.empNo = listItem.EmpFrom;
          timeBaseNode.empName = listItem.EmpName;
          timeBaseNode.empDept = listItem.EmpDept;
          timeBaseNode.empIcon = userIcon + listItem.EmpFrom + '.png';
          timeBase.value.push(timeBaseNode);
        }
        if (listItem.ToNodeName) {
          //发送到哪个节点，给谁
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'toNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.toNode;
          timeBaseNode.ToNodeLab = listItem.ToNodeLab;
          timeBaseNode.ToNodeName = listItem.ToNodeName;
          timeBaseNode.ToEmpLab = listItem.ToEmpLab;
          timeBaseNode.ToEmpName = listItem.ToEmpName;
          timeBase.value.push(timeBaseNode);
        }
        if (listItem.Msg != '无' && listItem.Msg != null) {
          //审核信息，抄送信息
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'msgNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.msgNode;
          timeBaseNode.msgLab = listItem.MsgLab;
          timeBaseNode.msg = listItem.Msg;
          timeBase.value.push(timeBaseNode);
        }
        if (listItem.IsOpenFrm) {
          //查看表单
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'frmNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.frmNode;
          timeBaseNode.frmParams = {
            WorkID: listItem.WorkID,
            FK_Flow: props.params.FlowNo,
            NodeID: listItem.NDFrom,
          };
          timeBase.value.push(timeBaseNode);
        }
        if (Array.isArray(listItem.CCList) && listItem.CCList.length > 0) {
          //抄送人列表
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'ccNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.ccNode;
          timeBaseNode.cclist = listItem.CCList;
          timeBase.value.push(timeBaseNode);
        }
        //子流程未解析
      } else if (listItem.nodeState == 'progress') {
        if (listItem.NodeName) {
          //节点基本信息
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'nodeInfo';
          timeBaseNode.icon = 'ant-design:check-circle-filled';
          timeBaseNode.iconStyle = 'font-size: 32px; margin: 5px';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.flowNode;
          timeBaseNode.lable = listItem.NodeName;
          timeBaseNode.actionTypeText = listItem.ActionTypeText;
          timeBaseNode.actionIconUrl = ActionTypeStr(listItem.ActionType);
          timeBase.value.push(timeBaseNode);
        }
        if (Array.isArray(listItem.gwls) && listItem.gwls.length > 0) {
          listItem.gwls.forEach((gwl, index) => {
            const timeBaseNode: TimeLineNode = <TimeLineNode>{};
            timeBaseNode.MyPk = listItem.idx.toString() + 'gwlNode' + index.toString();
            timeBaseNode.icon = 'octicon:dot-fill-24';
            timeBaseNode.iconStyle = '';
            timeBaseNode.nodeState = listItem.nodeState;
            timeBaseNode.nodeType = timeLineNodeType.gwlNode;
            timeBaseNode.empNo = gwl.empNo;
            timeBaseNode.empIcon = userIcon + gwl.empNo + '.png';
            timeBaseNode.empName = gwl.empName;
            timeBaseNode.empDept = gwl.empDept;
            timeBaseNode.RDT = gwl.RDT;
            timeBaseNode.SDT = gwl.SDT;
            timeBaseNode.PassTime = gwl.PassTime;
            timeBaseNode.OverTimeLab = gwl.OverTimeLab;
            timeBaseNode.OverTime = gwl.OverTime;
            timeBaseNode.isRead = gwl.isRead;
            timeBaseNode.isReadText = gwl.isReadText;
            timeBase.value.push(timeBaseNode);
          });
        }
      } else if (listItem.nodeState == 'waiting') {
        if (listItem.NodeName) {
          //节点基本信息
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'nodeInfo';
          timeBaseNode.icon = (listItem.idx + 1).toString();
          timeBaseNode.iconStyle = '';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.flowNode;
          timeBaseNode.lable = listItem.NodeName;
          timeBaseNode.actionTypeText = listItem.ActionTypeText || '未经过';
          timeBaseNode.actionIconUrl = ActionTypeStr(listItem.ActionType);
          timeBase.value.push(timeBaseNode);
        }

        if (Array.isArray(listItem.Accpers) && listItem.Accpers.length > 0) {
          //处理人列表
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'accpersNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = 'color:rgba(0, 0, 0, 0.25)';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.accpersNode;
          timeBaseNode.Accpers = listItem.Accpers;
          timeBase.value.push(timeBaseNode);
        }
        if (Array.isArray(listItem.CCList) && listItem.CCList.length > 0) {
          //抄送接收人列表
          const timeBaseNode: TimeLineNode = <TimeLineNode>{};
          timeBaseNode.MyPk = listItem.idx.toString() + 'ccNode';
          timeBaseNode.icon = 'octicon:dot-24';
          timeBaseNode.iconStyle = 'color:rgba(0, 0, 0, 0.25)';
          timeBaseNode.nodeState = listItem.nodeState;
          timeBaseNode.nodeType = timeLineNodeType.ccNode;
          timeBaseNode.cclist = listItem.CCList;
          timeBase.value.push(timeBaseNode);
        }
      }
    });
    const timeBaseNode: TimeLineNode = <TimeLineNode>{};
    timeBaseNode.MyPk = 'endNode';
    timeBaseNode.icon = 'bi:stop-circle';
    timeBaseNode.iconStyle = 'font-size: 32px; margin: 5px;color:rgba(0, 0, 0, 0.25)';
    timeBaseNode.nodeType = timeLineNodeType.endNode;
    timeBaseNode.actionTypeText = '流程结束';
    timeBase.value.push(timeBaseNode);
  };
  //节点设置横线
  const getClass = (node) => {
    return {
      'custom-timeline': node.nodeType === 0,
    };
  };
  /**
   *秒数转化为时分秒
   * @param value
   */
  const formatSeconds = (value) => {
    //  秒
    const second = ref(parseInt(value));
    //  分
    const minute = ref(0);
    //  小时
    const hour = ref(0);
    //  天
    const day = ref(0);
    const isF = second.value < 0 ? true : false;
    if (isF == true) second.value = Math.abs(second.value);

    //  如果秒数大于60，将秒数转换成整数
    if (second.value > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute.value = parseInt(second.value / 60);
      //  获取秒数，秒数取佘，得到整数秒数
      second.value = parseInt(second.value % 60);
      //  如果分钟大于60，将分钟转换成小时
      if (minute.value > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour.value = parseInt(minute.value / 60);
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute.value = parseInt(minute.value % 60);
      }
      if (hour.value > 24) {
        day.value = parseInt(hour.value / 24);
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        hour.value = parseInt(hour.value % 24);
      }
    }
    let result = '' + parseInt(second.value) + '秒';
    if (minute.value > 0) {
      result = '' + parseInt(minute.value) + '分' + result;
    }
    if (hour.value > 0) {
      result = '' + parseInt(hour.value) + '小时' + result;
    }
    if (day.value > 0) {
      result = '' + parseInt(day.value) + '天' + result;
    }
    if (isF == true) result = '-' + result;
    return result;
  };
  /**
   * 打开弹窗，使用component展示表单F
   * @param params component参数
   */
  const openModal = (params: { FK_Flow: string; WorkID: number; NodeID: number }) => {
    modalObj.visiable = true;
    modalObj.component = markRaw(loadComponent('/@/CCMobile/Frm.vue'));
    modalObj.params = {
      ...params,
      isComponent: true,
      fieldIsReadonly: true,
      isReadonly: true,
    };
    console.log(modalObj);
  };
  const closeModal = () => {
    modalObj.visiable = false;
  };
  InitPage();
</script>
<style lang="less" scoped>
  .numberIconBox {
    height: 32px;
    width: 32px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.25) !important;
    .numberIcon {
      position: absolute;
      z-index: 999;
      font-size: 16px;
    }
  }
  .circle {
    position: absolute;
    z-index: 998;
    font-size: 32px !important;
  }
  .custom-timeline::before {
    content: '';
    position: absolute;
    top: -15%;
    left: 50%;
    width: 50%;
    height: 1px;
    background-color: #c6c6c6;
    z-index: -1;
    transform: translateX(-50%);
  }
  .btn-type:hover {
    background-color: #4356ff;
    color: #fff;
  }
  .van-tabbar-item--active {
    background-color: #4356ff;
    color: #fff;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
