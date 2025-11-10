import { nextTick, provide, Ref, ref } from 'vue';
import { Flow } from '/@/WF/TSClass/Flow';
import { debounce } from 'lodash-es';
import { flowEntityKeys, nodeEntityKeys, selectedNodeKey } from '/@/WF/Admin/FlowDesigner/utils/keys';
import { message } from 'ant-design-vue';
import { NodeFD } from '../NodeFD';
import Events from '/@/utils/Events';
import { Directions } from '../../Cond2020/Direction';

// 节点id类型，可能为string或者number
type NodeIdType = string | number;
export function useProvider(flowNo: string, nodeList, loading: Ref<Boolean>, jpInstance) {
  const flowEntity = ref<Flow>(new Flow(flowNo));
  const updateFlowEntity = debounce(async (key: string, val: any, isPara: boolean) => {
    if (isPara) {
      flowEntity.value.SetPara(key, val);
    } else {
      flowEntity.value[key] = val;
    }
    await flowEntity.value.Update();
    if (jpInstance && key === 'LineRole') {
      try {
        await nextTick();
        loading.value = true;
        const connection = jpInstance.getAllConnections();
        connection.map((conn) => {
          conn.setConnector({
            stroke: 'red',
          });
        });
      } catch (e: any) {
        console.error(e);
        message.error(e.toString());
      } finally {
        loading.value = false;
      }
    }
  }, 300);
  // 当前选中节点
  const selectedNodeId = ref('-1');
  const nodeEntity = ref<Nullable<NodeFD>>(null);
  const nodeLoading = ref(false);
  const selectNode = (nodeId: string) => {
    nodeEntity.value = null;
    selectedNodeId.value = nodeId;
    if (!nodeId) return;
    nodeLoading.value = true;
    setTimeout(async () => {
      try {
        const nodeEn = new NodeFD(parseInt(nodeId));
        await nodeEn.Retrieve();
        nodeEntity.value = nodeEn;
        selectedNodeId.value = nodeId;
      } catch (e: any) {
        message.error(e.toString());
      } finally {
        nodeLoading.value = false;
      }
    }, 100);
  };
  const updateNodeEntity = async (key: string, val: any, isPara: boolean) => {
    if (!nodeEntity.value) {
      message.error('出现错误，节点不存在');
      return;
    }
    // 更新实体
    if (isPara) {
      nodeEntity.value.SetPara(key, val);
    } else {
      nodeEntity.value[key] = val;
    }
    // 更新集合对象
    const node = nodeList.value.find((node) => parseInt(node.NodeID) === parseInt(nodeEntity.value?.NodeID as NodeIdType));
    if (node) {
      node[key] = val;
    }
    if (key === 'Name') {
      // const node = document.querySelector(`#node-text-${nodeEntity.value?.NodeID}`);
      // if (node) {
      //   node.innerHTML = val;
      // }
      Events.emit('updateLabel', val);
      const relatedEdges = new Directions();
      await relatedEdges.Retrieve('ToNode', nodeEntity.value.NodeID);
      if (relatedEdges.length > 0) {
        const queue = relatedEdges.map((edge) => {
          edge.SetValByKey('ToNodeName', val);
          return edge.Update();
        });
        await Promise.all(queue);
      }
    }
    await nodeEntity?.value?.Update();
  };
  // 为所有后代组件提供可访问数据
  provide(flowEntityKeys, {
    flowEntity,
    updateFlowEntity,
  });
  provide(nodeEntityKeys, {
    nodeEntity,
    updateNodeEntity,
    nodeLoading,
  });
  provide<Ref<string>>(selectedNodeKey, selectedNodeId);

  return {
    selectedNodeId,
    flowEntity,
    selectNode,
  };
}
