// 节点属性描述
import { Ref } from 'vue';
import { NodeType } from './config/typeDef';
import { Flow } from '../../TSClass/Flow';

export interface PosInfo {
  X: number;
  Y: number;
  Name: string;
}

export interface NodeInfo extends PosInfo {
  ID?: string;
  NodeID: string;
  RunModel: string;
  FWCSta: number;
  NodeType?: NodeType;
  UIWidth: number;
  UIHeight: number;
  UIAngle: number;
}

export interface DirectionInfo {
  Des: string | null;
  FK_Flow: string;
  GateWay: number;
  Idx: number;
  MyPK: string;
  Node: number;
  ToNode: number;
  ToNodeName: string;
}

export interface DragNodeInfo {
  type: string;
  icon: string;
  name: string;
}

export interface LabelInfo extends PosInfo {
  FK_Flow: string;
  MyPK: string;
}

export interface ProvideFlowInfo {
  flowEntity: Ref;
  updateFlowEntity: Function;
}

export interface ProvideNodeInfo {
  nodeEntity: Ref;
  nodeLoading: Ref;
  updateNodeEntity: Function;
}
