import { reactive } from 'vue';
import BSEntity from '/@/utils/gener/BSEntity';
import Events from '/@/utils/Events';
import type { Edge } from '@antv/x6';
import { DirectionInfo } from '/@flow/FlowAttr';
import { Direction } from '/@/WF/Admin/Cond2020/Direction';
import { message } from 'ant-design-vue';

export function useX6Edge() {
  const edgeInfo = reactive({
    visible: false,
    title: '连接线标签',
    delLoading: false,
    modifyLoading: false,
    inputVal: '',
    instance: <Nullable<Edge>>null,
  });

  const resetModal = () => {
    edgeInfo.inputVal = '';
    edgeInfo.visible = false;
    edgeInfo.delLoading = false;
    edgeInfo.modifyLoading = false;
    edgeInfo.instance = null;
  };

  const deleteDir = async () => {
    const dir = new BSEntity('BP.WF.Template.Direction', edgeInfo.instance?.attrs?.dataSource?.MyPK as string);
    await dir.Delete();
    edgeInfo.instance?.remove();
    resetModal();
  };

  const setCondition = async () => {
    const { MyPK, Node, ToNode } = edgeInfo.instance?.attrs?.dataSource as unknown as DirectionInfo;
    await modifyDirLabel();

    const title = `${Node} -> ${ToNode} 方向条件设置`;
    Events.emit('openDrawer', {
      EnName: 'TS.WF.Cond',
      PKVal: MyPK,
      NodeID: MyPK,
      title,
      type: 'DtlSearch',
      expand: false,
      basicInfoVisible: true,
    });
    resetModal();
  };

  // const updateToNodes = async () => {};

  const batchSetCondition = async (edgeInstance: Nullable<Edge>, flowNo: string) => {
    const directionPK = edgeInstance?.attrs?.dataSource?.MyPK;
    if (!directionPK) {
      message.warn('为获取到连接线信息，请重试');
      return;
    }
    Events.emit('openDrawer', {
      EnName: 'GPN_CopyTurnCond',
      props: {
        FlowNo: flowNo,
        PKVal: directionPK,
      },
      title: '复制方向条件',
      type: 'GPN',
      expand: false,
      basicInfoVisible: true,
    });
    resetModal();
  };

  const deleteDirByIds = async (targetIds: string[]) => {
    const tasks: Promise<void>[] = [];
    targetIds.forEach((id) => {
      const delFunc = new BSEntity('BP.WF.Template.Direction', id).Delete();
      tasks.push(delFunc);
    });
    await Promise.all(tasks);
  };

  const insertDir = async (flowNo: string, nodeId: string, toNodeId: string, nodeType: number, toNodeName: string, fromPort = null, toPort = null) => {
    const dir = new Direction();
    await dir.Init();
    dir.setPKVal(`${flowNo}_${nodeId}_${toNodeId}`);
    dir.SetValByKey('Node', nodeId);
    dir.SetValByKey('ToNode', toNodeId);
    dir.SetValByKey('FK_Flow', flowNo);
    dir.SetValByKey('NodeType', nodeType);
    dir.SetValByKey('ToNodeName', toNodeName);
    if (fromPort) dir.SetValByKey('FromPort', fromPort);
    if (toPort) dir.SetValByKey('ToPort', toPort);
    await dir.Insert();
    return dir;
  };

  const modifyDirLabel = async () => {
    // const { MyPK } = edgeInfo.instance?.attrs?.dataSource as unknown as DirectionInfo;
    // const dir = new BSEntity('BP.WF.Template.Direction', MyPK);
    // await dir.Init();
    // dir.setVal('Des', edgeInfo.inputVal);
    // await dir.Update();
    const entity = edgeInfo.instance?.attrs?.dataSource as unknown as Direction;
    entity.SetValByKey('Des', edgeInfo.inputVal);
    await entity.Update();
    edgeInfo.instance?.attr('dataSource/label', edgeInfo.inputVal);
    edgeInfo.instance?.setLabels([edgeInfo.inputVal]);
    resetModal();
  };

  const modifyDirVertices = async (vertices: Array<{ x: number; y: number }>) => {
    const entity = edgeInfo.instance?.attrs?.dataSource as unknown as Direction;
    // vertices.map(({ x, y }) => `${x},${y}`).join('-');
    entity.SetValByKey('Vertices', vertices.map(({ x, y }) => `${x},${y}`).join('|'));
    await entity.Update();
  };
  // 连接线操作 end

  return {
    edgeInfo,
    resetModal,
    insertDir,
    deleteDir,
    setCondition,
    batchSetCondition,
    deleteDirByIds,
    modifyDirLabel,
    modifyDirVertices,
  };
}
