import HttpHandler from '/@/utils/gener/HttpHandler';
import { NodeInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
import { nextTick, Ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { NodeType } from '../config/x6Shapes';
import { Node as NodeEntity } from '/@/WF/TSClass/Node';
import BSEntity from '/@/utils/gener/BSEntity';
export function useX6Node(
  nodeList: Ref<Array<NodeInfo>>,
  loading: Ref<Boolean>,
  loadNodes: Function,
  flowNo: string,
  lineList: Ref<Array<Record<string, any>>>,
  deleteDirByIds: Function,
) {
  // 改变节点的位置
  const changeNodePosition = async (nodeId: string, left: number, top: number) => {
    const node = nodeList.value.find((node) => node.NodeID == nodeId);
    if (!node) return;
    const nodeEn = new NodeEntity(parseInt(nodeId));
    await nodeEn.Retrieve();
    nodeEn.SetValByKey('X', left);
    nodeEn.SetValByKey('Y', top);
    await nodeEn.Update();
  };

  const changeNodeSize = async (nodeId: string, width: number, height: number) => {
    const node = nodeList.value.find((node) => node.NodeID === nodeId);
    if (!node) return;
    const nodeEn = new NodeEntity(parseInt(nodeId));
    await nodeEn.Retrieve();
    nodeEn.SetValByKey('UIWidth', width);
    nodeEn.SetValByKey('UIHeight', height);
    await nodeEn.Update();
  };

  // 改变旋转角度 angle 为角度
  const changeNodeAngle = async (nodeId: string, angle: number) => {
    const node = nodeList.value.find((node) => node.NodeID === nodeId);
    if (!node) return;
    const nodeEn = new NodeEntity(parseInt(nodeId));
    await nodeEn.Retrieve();
    nodeEn.SetValByKey('UIAngle', angle);
    await nodeEn.Update();
  };

  const createNode = async (x: number, y: number, template: Recordable) => {
    try {
      loading.value = true;
      const { nodeType, mode = '0' } = template.attrs.typeInfo;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner2018');
      handler.AddPara('X', x);
      handler.AddPara('Y', y);
      handler.AddPara('FK_Flow', flowNo);

      let data: Recordable | null = null;
      switch (nodeType) {
        case NodeType.Route: {
          data = await handler.DoMethodReturnJson<any>('CreateCond');
          break;
        }
        case NodeType.Normal: {
          handler.AddPara('NodeModel', mode);
          data = await handler.DoMethodReturnJson<any>('CreateNode');
          break;
        }
        case NodeType.CC: {
          data = await handler.DoMethodReturnJson<any>('CreateCCNode');
          break;
        }
        case NodeType.SubFlowNode: {
          data = await handler.DoMethodReturnJson<any>('CreateSubFlowNode');
          break;
        }
      }
      if (!data) {
        message.error('没有判断的node类型');
        return;
      }
      const bsNodeEn = new BSEntity('BP.WF.Node', data.NodeID);
      await bsNodeEn.Retrieve();
      await loadNodes();
      await nextTick();
      return bsNodeEn.getData();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const syncPasteNodeInfo = async (sourceId: string, distId: string) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner2018');
    handler.AddPara('NodeID', sourceId);
    handler.AddPara('toNodeID', distId);
    handler.AddPara('FlowNo', flowNo);
    await handler.DoMethodReturnJson<any>('CopyNode');
  };

  // 删除激活的元素.
  const deleteElement = (id: string) =>
    new Promise<boolean>((resolve, reject) => {
      const modal = Modal.confirm({
        title: '提示',
        content: '确定删除此节点吗? 此节点所有连接线也将被一并删除。',
        onOk: async (_) => {
          try {
            await deleteNode(id);
            // message.success('删除成功');
            resolve(true);
          } catch (e: any) {
            message.error(e.toString());
            reject(false);
          } finally {
            modal.destroy();
          }
        },
        onCancel: (_) => {
          modal.destroy();
          reject(false);
        },
      });
    });

  const deleteNode = async (nodeID: string) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner2018');
      handler.AddPara('FK_Node', nodeID);
      await handler.DoMethodReturnJson('DeleteNode');
      nodeList.value = nodeList.value.filter((node) => {
        return node.NodeID !== nodeID;
      });
      await nextTick();
      const deleteIds = lineList.value
        .filter((line) => {
          return line.Node === parseInt(nodeID) || line.ToNode === parseInt(nodeID);
        })
        .map((line) => line.MyPK);
      await deleteDirByIds(deleteIds);
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    }
  };

  const updateNodePosType = async (nodeId: string) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner2018');
    handler.AddPara('NodeID', nodeId);
    await handler.DoMethodReturnJson('UpdateNodePosType');
  };

  return {
    syncPasteNodeInfo,
    createNode,
    updateNodePosType,
    changeNodePosition,
    changeNodeAngle,
    changeNodeSize,
    deleteElement,
  };
}
