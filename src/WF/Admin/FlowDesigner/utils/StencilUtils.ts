import type { Graph } from '@antv/x6';
import { userNodes, routeNodes, ccNodes, subFlowNodes, labelNodes } from '../config/x6Shapes';
import { Stencil } from '@antv/x6-plugin-stencil';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
function addShapeToStencil(graph: Graph, stencil: Stencil, list: Array<any>, name: string) {
  const nodeList: Array<any> = [];
  for (const item of list) {
    const userNodeInfo = graph.createNode(item);
    userNodeInfo.markup = undefined;
    nodeList.push(userNodeInfo);
  }
  stencil.load(nodeList, name);
}

export function initStencil(graph: Graph, el: HTMLElement) {
  const nodeGroups = [
    {
      title: `${'用户节点'}`,
      name: 'userNode',
      list: userNodes,
    },
    {
      title: `${'路由节点'}`,
      name: 'routeNode',
      list: routeNodes,
    },
    {
      title: `${'抄送节点'}`,
      name: 'ccNode',
      list: ccNodes,
    },
    {
      title: `${'子流程节点'}`,
      name: 'subFlowNode',
      list: subFlowNodes,
    },
    {
      title: `${'标签'}`,
      name: 'labelNode',
      list: labelNodes,
    },
  ];
  // #region 初始化 stencil
  const stencil = new Stencil({
    title: `${'流程设计器'}`,
    target: graph,
    stencilGraphWidth: 180,
    stencilGraphHeight: 0,
    collapsable: false,
    groups: nodeGroups.map(({ title, name }) => ({
      title,
      name,
      collapsable: false,
    })),
    layoutOptions: {
      columns: 1,
      columnWidth: 220,
      rowHeight: 60,
    },
  });
  el?.appendChild(stencil.container);
  for (const group of nodeGroups) {
    addShapeToStencil(graph, stencil, group.list, group.name);
  }
}
