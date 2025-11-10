import { Graph } from '@antv/x6';
import { ref } from 'vue';
import { getNodeTemplateByType } from '/@flow/config/x6Shapes';
// import { Transform } from '@antv/x6-plugin-transform';
// import { Selection } from '@antv/x6-plugin-selection';
// import { Snapline } from '@antv/x6-plugin-snapline';
// import { Keyboard } from '@antv/x6-plugin-keyboard';
// import { Clipboard } from '@antv/x6-plugin-clipboard';
// import { History } from '@antv/x6-plugin-history';
import { connectConfig, gridConfig } from '/@flow/config/x6Config';
import { Model } from '@antv/x6';
import { LabelInfo, NodeInfo } from '/@flow/FlowAttr';
import { Directions } from '/@/WF/Admin/Cond2020/Direction';
import BSEntity from '/@/utils/gener/BSEntity';
// import { NodeType } from '../config/x6Shapes';

export function useX6Graph() {
  const graph = ref<Graph>();

  const initGraph = (el: HTMLElement, width: number, height: number, readonly = false) => {
    graph.value = new Graph({
      container: el,
      width: width,
      height: height,
      grid: gridConfig,
      background: { color: '#f2f5f7' },
      panning: {
        enabled: true,
        modifiers: ['alt', 'shift'],
      },
      interacting: {
        nodeMovable: !readonly, // 禁止节点移动
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: { ...connectConfig },

      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#f2f5f7',
              stroke: '#5555ff',
            },
          },
        },
      },
    });
    // initPlugins();
    // bindCommonEvents();
  };

  const removeUnUsedLines = (nodeList: NodeInfo[], lineList: Directions) => {
    const currentNodeIDList = nodeList.map((node) => parseInt(node.NodeID));
    const disabledlines: string[] = [];
    for (const line of lineList) {
      if (!currentNodeIDList.includes(line.Node) || !currentNodeIDList.includes(line.ToNode)) {
        disabledlines.push(line.MyPK);
      }
    }
    if (disabledlines.length > 0) {
      disabledlines.forEach((MyPK) => {
        const dir = new BSEntity('BP.WF.Template.Direction', MyPK);
        dir.Delete();
      });
    }
    const validLines = lineList.filter((line) => !disabledlines.includes(line.MyPK));
    return validLines as Directions;
  };

  const getLabelWidth = (str: string) => {
    const pattern = /[\u4e00-\u9fa5]/g;
    const matches = str.match(pattern);

    const chineseCharCount = matches?.length || 0;
    return chineseCharCount * 12 + (str.length - chineseCharCount) * 7;
  };

  const convertData = (nodeList: NodeInfo[], lineList: Directions, labelList: LabelInfo[]) => {
    const data: Model.FromJSONData = { nodes: [], edges: [] };
    // lineList = removeUnUsedLines(nodeList, lineList);
    for (const node of nodeList) {
      const template = getNodeTemplateByType(node.NodeType!, node.RunModel);
      if (!template) continue;
      const x6Node = JSON.parse(JSON.stringify(template));
      x6Node.id = node.NodeID;
      x6Node.label = node.Name;
      x6Node.attrs.id = node.NodeID;
      x6Node.attrs.label = node.Name;
      if (node.UIWidth > x6Node.width) x6Node.width = node.UIWidth;
      if (node.UIHeight > x6Node.height) x6Node.height = node.UIHeight;
      if (node.UIAngle > 0) x6Node.angle = node.UIAngle;
      x6Node.x = node.X;
      x6Node.y = node.Y;
      // 处理连接桩
      x6Node.ports.items = x6Node.ports.items.map((item) => ({ group: item.group, id: node.NodeID + '-' + item.group }));
      x6Node.data = node;
      x6Node.tools = [
        {
          name: 'node-editor',
        },
      ];
      data.nodes?.push(x6Node);
    }
    // 标签
    for (const tag of labelList) {
      data.nodes?.push({
        shape: 'graph-tag',
        x: tag.X,
        y: tag.Y,
        size: {
          width: getLabelWidth(tag.Name),
          height: 20,
        },
        data: {
          ...tag,
        },
        id: tag.MyPK,
      });
    }
    for (const line of lineList) {
      let vertices: Array<{ x: number; y: number }> = [];
      if (typeof line.Vertices === 'string' && line.Vertices.length > 0) {
        try {
          vertices = line.Vertices.split('|').map((item) => {
            const position = item.split(',');
            return { x: parseFloat(position[0] || 0), y: parseFloat(position[1] || 0) };
          });
        } catch (e: any) {
          vertices = [];
        }
      }
      // 处理连接桩
      const source = line.Node + '';
      const target = line.ToNode + '';
      // const source = line.FromPort ? { cell: line.Node + '', port: line.FromPort } : line.Node + '';
      // const target = line.ToPort ? { cell: line.ToNode + '', port: line.ToPort } : line.ToNode + '';
      data.edges?.push({
        shape: 'edge',
        source,
        target,
        data: line,
        label: line.Des,
        router: 'manhattan',
        // connector: {
        //   name: 'jumpover',
        //   args: {
        //     size: 4,
        //     radius: 8,
        //     type: 'cubic',
        //   },
        // },
        snap: {
          radius: 0,
        },
        attrs: {
          line: {
            stroke: '#999',
            strokeWidth: 2,
          },
          dataSource: line,
        },
        vertices,
      });
    }
    return data;
  };
  // const initPlugins = () => {
  //   graph.value?.use(transformPlg).use(selectionPlg).use(snapPlg);
  //   // .use(
  //   //   new Snapline({
  //   //     tolerance: 10,
  //   //   }),
  //   // )
  //   // .use(new Keyboard())
  //   // .use(new Clipboard())
  //   // .use(new History());
  // };
  return {
    graph,
    convertData,
    initGraph,
  };
}
