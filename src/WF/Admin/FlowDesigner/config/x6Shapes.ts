import { Shape } from '@antv/x6';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
// const primaryColor = '#EFF4FF';
const strokeColor = '#CACACA';
const portColor = '#CACACA';

const topPort = {
  position: 'top',
  attrs: {
    circle: {
      r: 6,
      magnet: true,
      stroke: portColor,
      strokeWidth: 1,
      fill: '#fff',
      style: {
        visibility: 'hidden',
      },
    },
  },
  zIndex: 999,
};
const rightPort = {
  position: 'right',
  attrs: {
    circle: {
      r: 6,
      magnet: true,
      stroke: portColor,
      strokeWidth: 1,
      fill: '#fff',
      style: {
        visibility: 'hidden',
      },
    },
  },
  zIndex: 999,
};
const bottomPort = {
  position: 'bottom',
  attrs: {
    circle: {
      r: 6,
      magnet: true,
      stroke: portColor,
      strokeWidth: 1,
      fill: '#fff',
      style: {
        visibility: 'hidden',
      },
    },
  },
  zIndex: 999,
};
const leftPort = {
  position: 'left',
  attrs: {
    circle: {
      r: 6,
      magnet: true,
      stroke: portColor,
      strokeWidth: 1,
      fill: '#fff',
      style: {
        visibility: 'hidden',
      },
    },
  },
  zIndex: 999,
};
const portItems = [
  {
    group: 'top',
  },
  {
    group: 'right',
  },
  {
    group: 'bottom',
  },
  {
    group: 'left',
  },
];
const ports = {
  groups: {
    left: leftPort,
    top: topPort,
    right: rightPort,
    bottom: bottomPort,
  },
  items: portItems,
};

export enum NodeType {
  Tag = -1,
  Normal = 0, // 普通节点
  Route = 1, // 路由节点
  CC = 2, // 抄送节点
  SubFlowNode = 3, // 子流程节点
}

export const baseNodeMarkup = [
  {
    tagName: 'polygon',
    selector: 'body',
  },
  {
    tagName: 'text',
    selector: 'label',
  },
  {
    tagName: 'text',
    selector: 'id_display',
  },
];
export type CommonAttrs = {
  [x: string]: any;
  body: Recordable;
  label?: Recordable;
  text: Recordable;
};

const commonAttrs: CommonAttrs = {
  body: {
    strokeWidth: 1,
    stroke: strokeColor,
    fill: 'white',
  },
  text: {
    fontSize: 12,
    fill: '#262626',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
  },
  id_display: {
    refY: '-10px',
    refX: '20px',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
    fill: '#262626',
    fontSize: '14px',
  },
};

const ccAttrs: CommonAttrs = {
  ...commonAttrs,
  text: {
    refY: '18px',
    fontSize: 12,
    fill: '#262626',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
  },
};

export type NodeMarkUp = {
  tagName: string;
  selector: string;
};
type X6NodeShape = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'polyline' | 'path' | 'image' | 'html';
export type X6Node = {
  id?: string;
  label: string;
  shape: X6NodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: string;
  attrs: CommonAttrs & {
    typeInfo: {
      nodeType: NodeType;
      mode?: number;
    };
  };
  ports: any;
  markup: NodeMarkUp[];
};

export type UserNode = Omit<X6Node, 'x' | 'y'>;
export type RouteNode = UserNode;
export type CCNode = UserNode;
export type SubFlowNode = UserNode;
// 用户节点
export const userNodes: Array<UserNode> = [
  {
    id: '11',
    label: `${'线性'}`,
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    points: '0 0, 100 0, 100 100, 0 100',
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 0,
      },
      ...commonAttrs,
    },
    ports: { ...ports },
  },
  {
    id: '12',
    label: `${'分流'}`,
    points: '15 0, 0 100, 100 100, 85 0',
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 2,
      },
      ...commonAttrs,
    },
    ports: {
      groups: {
        left: {
          ...leftPort,
          position: {
            name: 'line',
            args: {
              start: { x: '15%', y: 0 },
              end: { x: 0, y: '100%' },
            },
          },
        },
        top: topPort,
        right: {
          ...rightPort,
          position: {
            name: 'line',
            args: {
              start: { x: '85%', y: 0 },
              end: { x: '100%', y: '100%' },
            },
          },
        },
        bottom: bottomPort,
      },
      items: portItems,
    },
  },
  {
    id: '13',
    label: `${'合流'}`,
    points: '0 0, 15 100, 85 100, 100 0',
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 1,
      },
      ...commonAttrs,
    },
    ports: {
      groups: {
        left: {
          ...leftPort,
          position: {
            name: 'line',
            args: {
              start: { x: 0, y: 0 },
              end: { x: '15%', y: '100%' },
            },
          },
        },
        top: topPort,
        right: {
          ...rightPort,
          position: {
            name: 'line',
            args: {
              start: { x: '100%', y: 0 },
              end: { x: '85%', y: '100%' },
            },
          },
        },
        bottom: bottomPort,
      },
      items: portItems,
    },
  },
  {
    id: '14',
    label: `${'分合流'}`,
    points: '15 0, 0 50, 15 100, 85 100, 100 50, 85 0',
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 3,
      },
      ...commonAttrs,
    },
    ports: { ...ports },
  },
  {
    id: '15',
    label: `${'同表单'}`,
    points: '15 0, 0 100, 85 100, 100 0',
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 4,
      },
      ...commonAttrs,
    },
    ports: {
      groups: {
        left: {
          ...leftPort,
          position: {
            name: 'line',
            args: {
              start: { x: '15%', y: 0 },
              end: { x: 0, y: '100%' },
            },
          },
        },
        top: topPort,
        right: {
          ...rightPort,
          position: {
            name: 'line',
            args: {
              start: { x: '100%', y: 0 },
              end: { x: '85%', y: '100%' },
            },
          },
        },
        bottom: bottomPort,
      },
      items: portItems,
    },
  },
  {
    id: '16',
    label: `${'异表单'}`,
    points: '0 0, 15 100, 100 100, 85 0',
    width: 140,
    height: 30,
    shape: 'polygon' as X6NodeShape, // Fix: Ensure shape is of type X6NodeShape
    attrs: {
      typeInfo: {
        nodeType: NodeType.Normal,
        mode: 5,
      },
      ...commonAttrs,
    },
    ports: {
      groups: {
        left: {
          ...leftPort,
          position: {
            name: 'line',
            args: {
              start: { x: 0, y: 0 },
              end: { x: '15%', y: '100%' },
            },
          },
        },
        top: topPort,
        right: {
          ...rightPort,
          position: {
            name: 'line',
            args: {
              start: { x: '85%', y: 0 },
              end: { x: '100%', y: '100%' },
            },
          },
        },
        bottom: bottomPort,
      },
      items: portItems,
    },
  },
].map((node) => {
  return {
    ...node,
    markup: baseNodeMarkup,
  };
});
// 路由节点
export const routeNodes: Array<RouteNode> = [
  {
    id: '21',
    label: `${'路由'}`,
    width: 140,
    height: 65,
    shape: 'polygon',
    points: '50 0, 100 50, 50 100, 0 50',
    attrs: {
      ...commonAttrs,
      typeInfo: {
        nodeType: NodeType.Route,
      },
    },
    ports: {
      ...ports,
    },
    markup: baseNodeMarkup,
  },
];
// 抄送节点
export const ccNodes: Array<CCNode> = [
  {
    id: '31',
    label: `${'抄送'}`,
    width: 140,
    height: 45,
    shape: 'polygon',
    points: '0 20, 100 20, 100 80, 75 80, 75 100, 50 80, 0 80',
    attrs: {
      ...ccAttrs,
      typeInfo: {
        nodeType: NodeType.CC,
      },
    },
    ports: {
      groups: {
        left: leftPort,
        top: topPort,
        right: rightPort,
        bottom: {
          ...bottomPort,
          position: {
            name: 'line',
            args: {
              start: { x: 0, y: '75%' },
              end: { x: '100%', y: '75%' },
            },
          },
        },
      },
      items: portItems,
    },
    markup: baseNodeMarkup,
  },
];
// 子流程节点
export const subFlowNodes: Array<SubFlowNode> = [
  {
    id: '41',
    label: `${'子流程'}`,
    width: 140,
    height: 30,
    shape: 'polygon',
    points: '0 0, 85 0, 100 50, 85 100, 0 100 15 50',
    attrs: {
      ...commonAttrs,
      typeInfo: {
        nodeType: NodeType.SubFlowNode,
      },
    },
    ports: {
      groups: {
        left: {
          ...leftPort,
          ...bottomPort,
          position: {
            name: 'line',
            args: {
              start: { x: 0, y: 0 },
              end: { x: '30%', y: '100%' },
            },
          },
        },
        top: topPort,
        right: rightPort,
        bottom: bottomPort,
      },
      items: portItems,
    },
    markup: baseNodeMarkup,
  },
];
// 标签节点
Shape.HTML.register({
  shape: 'graph-tag',
  width: 60,
  height: 30,
  effect: ['data'],
  attrs: {
    typeInfo: {
      nodeType: NodeType.Tag,
    },
  },
  html(cell) {
    const tag = cell?.getData()?.Name || `${'标签'}`;
    const div = document.createElement('div');
    div.className = 'graph-tag';
    div.innerHTML = tag;
    return div;
  },
});
export const labelNodes: Recordable[] = [
  {
    shape: 'graph-tag',
    attrs: {
      typeInfo: {
        nodeType: NodeType.Tag,
      },
    },
  },
];
export const getNodeTemplateByType = (nodeType: NodeType, runMode = '0'): any => {
  switch (nodeType) {
    case NodeType.Normal:
      return userNodes.find((node) => node.attrs.typeInfo.mode === parseInt(runMode));
    case NodeType.Route:
      return routeNodes[0];
    case NodeType.CC:
      return ccNodes[0];
    case NodeType.SubFlowNode:
      return subFlowNodes[0];
    default:
      throw new Error(`类型 [${nodeType}] 不存在`);
  }
};
