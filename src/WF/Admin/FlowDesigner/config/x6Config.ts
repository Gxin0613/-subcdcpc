import { Shape } from '@antv/x6';
import { CloseCircleOutlined, CheckCircleOutlined, OrderedListOutlined, ReadOutlined } from '@ant-design/icons-vue';
import { Component } from 'vue';

export enum CSOptions {
  Disabled = 0,
  Enabled = 1,
  Readonly = 2,
  BatchSet = 'batchSet',
  Assist = 'assist',
  Attribute = 'attribute',
}

export const checkStatus: Array<StatusDef> = [
  {
    id: CSOptions.Enabled,
    icon: CheckCircleOutlined,
    name: '启用',
  },
  {
    id: CSOptions.Disabled,
    icon: CloseCircleOutlined,
    name: '禁用',
  },
  {
    id: CSOptions.Readonly,
    icon: ReadOutlined,
    name: '只读',
  },
  {
    id: CSOptions.Attribute,
    icon: OrderedListOutlined,
    name: '组件属性',
  },
  {
    id: CSOptions.BatchSet,
    icon: OrderedListOutlined,
    name: '批量设置',
  },
  {
    id: CSOptions.Assist,
    icon: OrderedListOutlined,
    name: '帮助',
  },
];

export interface StatusDef {
  id: string | number;
  icon: Component;
  name: string;
}

export const gridConfig = {
  visible: true,
  type: 'doubleMesh',
  args: [
    {
      color: '#eee', // 主网格线颜色
      thickness: 2, // 主网格线宽度
    },
    {
      color: '#ddd', // 次网格线颜色
      thickness: 2, // 次网格线宽度
      factor: 4, // 主次网格线间隔
    },
  ],
};

export const lineConfig = {
  // line 是选择器名称，选中的边的 path 元素
  line: {
    stroke: '#999',
    strokeWidth: 1,
  },
};

export const connectConfig = {
  router: 'orth',
  connector: 'rounded',
  // connector: {
  //   name: 'rounded',
  //   args: {
  //     radius: 1,
  //   },
  // },
  // snap: {
  //   radius: 20,
  // },
  // attrs: {
  //   line: {
  //     stroke: '#333',
  //     strokeWidth: 3,
  //   },
  // },
  zIndex: 0,
  allowBlank: false,
  allowLoop: false,
  allowMulti: false,
  attrs: {
    line: {
      stroke: '#999',
      strokeWidth: 2,
    },
  },
  createEdge() {
    return new Shape.Edge({
      attrs: {
        line: {
          stroke: '#999',
          strokeWidth: 2,
        },
      },
      zIndex: 0,
    });
  },
  highlight: true,
  validateConnection({ targetMagnet }) {
    return !!targetMagnet;
  },
};
