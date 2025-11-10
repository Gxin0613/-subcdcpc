import { ActionType } from './ActionType';
import { String } from 'lodash';
import { CCListAttr } from '../../TSClass/FlowData/CCList';
import { SelectAccperAttr } from '../../TSClass/FlowData/SelectAccper';

export function ActionTypeStr(at) {
  // const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //获取代理路径
  // const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  //用户头像图片
  const DefaultIcon = './resource/WF/Img/dot.png';
  switch (at) {
    case ActionType.Start:
      return './resource/WF/Img/Action/Start.png';
    case ActionType.Forward:
      return './resource/WF/Img/Action/Forward.png';
    case ActionType.Return:
      return './resource/WF/Img/Action/Return.png';
    case ActionType.ReturnAndBackWay:
      return './resource/WF/Img/Action/ReturnAndBackWay.png';
    case ActionType.Shift:
      return './resource/WF/Img/Action/Shift.png';
    case ActionType.UnShift:
      return './resource/WF/Img/Action/UnShift.png';
    case ActionType.UnSend:
      return './resource/WF/Img/Action/UnSend.png';
    case ActionType.ForwardFL:
      return './resource/WF/Img/Action/ForwardFL.png';
    case ActionType.ForwardHL:
      return './resource/WF/Img/Action/ForwardHL.png';
    case ActionType.CallChildenFlow:
      return './resource/WF/Img/Action/CallChildenFlow.png';
    case ActionType.StartChildenFlow:
      return './resource/WF/Img/Action/StartChildenFlow.png';
    case ActionType.SubThreadForward:
      return './resource/WF/Img/Action/SubFlowForward.png';
    case ActionType.RebackOverFlow:
      return './resource/WF/Img/Action/RebackOverFlow.png';
    case ActionType.FlowOverByCoercion:
      return './resource/WF/Img/Action/FlowOverByCoercion.png';
    case ActionType.Hungup:
      return './resource/WF/Img/Action/Hungup.png';
    case ActionType.UnHungup:
      return './resource/WF/Img/Action/UnHungup.png';
    case ActionType.ShiftByCoercion:
      return './resource/WF/Img/Action/ShiftByCoercion.png';
    case ActionType.Press:
      return './resource/WF/Img/Action/Press.png';
    case ActionType.DeleteFlowByFlag:
      return './resource/WF/Img/Action/DeleteFlowByFlag.png';
    case ActionType.UnDeleteFlowByFlag:
      return './resource/WF/Img/Action/UnDeleteFlowByFlag.png';
    case ActionType.CC:
      return './resource/WF/Img/Action/CC.png';
    case ActionType.WorkCheck:
      return './resource/WF/Img/Action/WorkCheck.png';
    case ActionType.AskforHelp:
      return './resource/WF/Img/Action/AskforHelp.png';
    case ActionType.Skip:
      return './resource/WF/Img/Action/Skip.png';
    case ActionType.Order:
      return './resource/WF/Img/Action/Order.png';
    case ActionType.TeampUp:
      return './resource/WF/Img/Action/TeampUp.png';
    case ActionType.FlowBBS:
      return './resource/WF/Img/Action/FlowBBS.png';
    case ActionType.Info:
      return './resource/WF/Img/Action/Info.png';
    default:
      return DefaultIcon;
  }
}
export const getCCStaText = (Sta: number) => {
  switch (Sta) {
    case 0:
      return '还剩余';
    case 1:
      return '已超时';
    case 2:
      return '还剩余';
    case 3:
      return '已超时';
  }
};
//流程节点信息,数据
export interface FlowNode {
  MyPK: string;
  WorkID: number;
  FK_Flow: String;
  FID: number;
  idx: number;
  nodeState: 'finished' | 'progress' | 'waiting'; //不同的节点使用不同的icon
  icon: string; //动作图标
  NDFrom: number; //发送节点
  NodeName: string; //节点名字，轨迹是发送节点的名字，待办和未来是节点的名字，
  ActionType: number; //动作
  ActionTypeText: string;
  ToNodeLab: string; //下一个节点的标签
  ToNodeName: string; //下一个节点的名称
  MsgLab: string;
  Msg: string; //处理信息
  EmpFrom: string; //当前处理人ID
  EmpName: string; //当前处理人
  EmpDept: string; //当前处理人的部门
  ToEmpLab: string;
  ToEmp: string; //节点发送给谁
  ToEmpName: string;
  RDT: string; //工作下达时间
  IsOpenFrm: boolean;
  SubThread: [];
  SubFlow: [];
  CCList: CCListAttr[]; //抄送列表
  Accpers: SelectAccperAttr[]; //处理人列表
  gwls: GWL[]; //当前节点未处理人列表
  NodeType: number;
}
//用于渲染时间轴节点，渲染的结构
export interface TimeLineNode {
  //#region 公共属性
  MyPk: string;
  TrackID: string;
  label: string;
  icon: string; //时间轴节点图标
  iconStyle: string; //时间轴节点图标样式，颜色，大小，边距等
  nodeState: 'finished' | 'progress' | 'waiting'; //不同的节点使用不同的icon
  nodeType: number; //不同的type使用不同的下方属性
  //#endregion 公共属性
  //#region finished节点属性
  actionIconUrl?: string; //流程动作图标，发送，撤回之类
  actionTypeText?: string; //流程动作名称
  ToNodeLab: string; //下一个节点的标签
  ToNodeName: string; //下一个节点的名称
  ToEmpLab: string; //节点发送给谁
  ToEmpName: string;
  msgLab?: string; //信息标签：审核信息，撤回信息，催办信息
  msg?: string; //信息内容
  frmParams?: {
    //打开表单的参数
    FK_Flow: string;
    WorkID: number;
    NodeID: number;
  };
  cclist?: CCListAttr[]; //抄送列表
  //#endregion finished节点属性
  //#region progress节点属性
  empNo?: string; //处理人编号
  empName?: string; //处理人名称
  empIcon?: string; //处理人头像
  empDept?: string;
  RDT?: string; //工作接收时间
  SDT?: string; //工作应完成时间
  isRead?: 0 | 1; //当前处理人是否已阅
  isReadText?: string; //当前处理人是否已阅
  OverTimeLab?: '还剩余' | '已超时';
  OverTime?: string; //剩余时间或者超过时间
  PassTime?: string; //耗时
  //#endregion progress节点属性
  //#region waiting节点属性
  Accpers: SelectAccperAttr[];
  //cclist
  //#endregion waiting节点属性
}
//时间轴节点类型
export enum timeLineNodeType {
  /// <summary>
  /// 流程信息节点
  ///用来描述节点名称，动作，动作icon，时间
  /// </summary>
  flowNode = 0,
  /// <summary>
  /// 接受信息节点
  ///finished节点的接受节点名称，接受人名称
  /// </summary>
  toNode = 1,
  /// <summary>
  /// finished节点的信息，用于显示操作信息：撤回信息，审核信息，发送给谁
  /// </summary>
  msgNode = 2,
  /// <summary>
  /// finished节点的抄送人列表，每个抄送人：姓名，部门，已阅未阅，收到抄送的时间
  /// waiting节点的抄送人列表，每个抄送人的：姓名部门
  /// </summary>
  ccNode = 3,
  /// <summary>
  /// finished节点打开表单,用于打开表单查看，必须有frmParams属性
  /// </summary>
  frmNode = 4,
  /// <summary>
  /// finished节点子流程，暂未实现
  /// </summary>
  subFlowNode = 5,
  /// <summary>
  /// finished节点的操作人,名称，头像，部门
  /// progress节点的处理人节点，用于描述当前节点的处理人，每个处理人的姓名、部门、接收时间、应完成时间、耗时、剩余时间/超出时间、已阅未阅
  /// </summary>
  gwlNode = 6,
  /// <summary>
  /// waiting节点的处理人节点，用于描述未来处理人列表，每个处理人的姓名和部门
  /// </summary>
  accpersNode = 7,
  /// <summary>
  ///结束节点，全流程唯一。
  /// </summary>
  endNode = 8,
}
//当前节点处理人
export interface GWL {
  empName: string;
  empNo: string;
  empDept: string;
  SDT: string; //应完成时间
  PassTime: string; //耗时
  OverTimeLab: '还剩余' | '已超时';
  OverTime: string; //剩余时间
  RDT: string; //工作处理时间
  isRead: 0 | 1;
  isReadText: string;
}
//节点状态
export enum NodeState {
  /// <summary>
  /// 已完成的节点
  /// </summary>
  finished = 0,
  /// <summary>
  /// 当前停留的节点
  /// </summary>
  progress = 1,
  /// <summary>
  /// 未来的节点
  /// </summary>
  waiting = 2,
}
