import { ref } from 'vue';
import type { LabelInfo, NodeInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
import BSEntities from '/@/utils/gener/BSEntities';
import { Direction, Directions } from '/@/WF/Admin/Cond2020/Direction';

export function useDataLoader(flowNo: string) {
  // 节点、连接线、标签
  const nodeList = ref<Array<NodeInfo>>([]);
  const lineList = ref<Directions>(new Directions());
  const labelList = ref<Array<LabelInfo>>([]);
  const loadNodes = async () => {
    const nodeEns = new BSEntities('BP.WF.Nodes');
    await nodeEns.Retrieve('FK_Flow', flowNo);
    nodeList.value = nodeEns.getData();
    nodeList.value.forEach((node) => (node.NodeID = node.NodeID + ''));
  };

  const getDirections = async () => {
    await lineList.value.Retrieve('FK_Flow', flowNo);
  };

  const getLabels = async () => {
    const labels = new BSEntities('BP.WF.Template.LabNotes');
    await labels.Retrieve('FK_Flow', flowNo);
    labelList.value = labels.getData();
  };

  // 保存连接线
  const saveDirs = async (nodeId: string, toNodeId: string) => {
    const dir = new Direction();
    await dir.Init();
    dir.setPKVal(`${flowNo}_${nodeId}_${toNodeId}`);
    dir.SetValByKey('Node', nodeId);
    dir.SetValByKey('ToNode', toNodeId);
    dir.SetValByKey('FK_Flow', flowNo);
    await dir.Save();
    const lineObj = Object.fromEntries(dir.Row);
    lineList.value.push(lineObj as any);
    return lineObj;
  };

  return {
    nodeList,
    lineList,
    labelList,
    loadNodes,
    getDirections,
    getLabels,
    saveDirs,
  };
}
