export enum NodeType {
  Normal = 0, // 普通节点
  Route = 1, // 路由节点
  CC = 2, // 抄送节点
  SubFlowNode = 3, // 子流程节点
}

export interface NormalNodeDef {
  id: string;
  runModel: string;
  name: string;
  icon: string;
  style: object;
  className: string;
  type: NodeType;
}

export interface TagDef {
  id: string;
  type: string;
  name: string;
  icon: string;
  style: object;
}

export interface StatusDef {
  id: string | number;
  name: string;
}

export type RouteNodeDef = Omit<NormalNodeDef, 'runModel'>;

export type CCNodeDef = Omit<NormalNodeDef, 'runModel'>;

export type SubFlowNodeDef = Omit<NormalNodeDef, 'runModel'>;

// 路由节点
export const routeNodes: Array<RouteNodeDef> = [
  {
    id: '21',
    type: NodeType.Route,
    name: '路由节点',
    icon: 'icon-odometer',
    style: {},
    className: 'route-node',
  },
];

// 抄送节点
export const ccNodes: Array<CCNodeDef> = [
  {
    id: '31',
    type: NodeType.CC,
    name: '抄送节点',
    icon: 'icon-odometer',
    style: {},
    className: 'cc-node',
  },
];

// 子流程节点
export const subFlowNodes: Array<CCNodeDef> = [
  {
    id: '41',
    type: NodeType.SubFlowNode,
    name: '子流程节点',
    icon: 'icon-odometer',
    style: {},
    className: 'subflow-node',
  },
];

// 普通节点
export const normalNodes: Array<NormalNodeDef> = [
  {
    id: '11',
    runModel: '0',
    name: '线性节点',
    icon: 'icon-time',
    style: {},
    type: NodeType.Normal,
    className: 'normal-node',
  },
  {
    id: '12',
    runModel: '2',
    name: '分流节点',
    icon: 'icon-odometer',
    style: {},
    type: NodeType.Normal,
    className: 'divert-node',
  },
  {
    id: '13',
    runModel: '1',
    name: '合流节点',
    icon: 'icon-odometer',
    style: {},
    type: NodeType.Normal,
    className: 'confluence-node',
  },
  {
    id: '14',
    runModel: '3',
    name: '分合流节点',
    icon: 'icon-odometer',
    style: {},
    type: NodeType.Normal,
    className: 'confluence-and-divert-node',
  },
  {
    id: '15',
    runModel: '4',
    name: '同表单子线程',
    icon: 'icon-odometer',
    style: {},
    type: NodeType.Normal,
    className: 'same-form-node',
  },
  {
    id: '16',
    runModel: '5',
    name: '异表单子线程',
    icon: 'icon-odometer',
    style: {},
    type: NodeType.Normal,
    className: 'diff-form-node',
  },
  {
    id: 'tag',
    runModel: 'tag',
    name: '标签',
    icon: 'icon-time',
    style: {},
    type: NodeType.Normal,
    className: 'tag',
  },
];

export enum CSOptions {
  Disabled = 0,
  Enabled = 1,
  Readonly = 2,
  BatchSet = 'batchSet',
  Assist = 'assist',
}

export const checkStatus: Array<StatusDef> = [
  {
    id: CSOptions.Enabled,
    name: '启用',
  },
  {
    id: CSOptions.Disabled,
    name: '禁用',
  },
  {
    id: CSOptions.Readonly,
    name: '只读',
  },
  {
    id: CSOptions.BatchSet,
    name: '批量设置',
  },
  {
    id: CSOptions.Assist,
    name: '帮助',
  },
];

export const tagTypes: Array<TagDef> = [
  {
    id: '11',
    type: '0',
    name: '标签',
    icon: 'icon-time',
    style: {},
  },
];
