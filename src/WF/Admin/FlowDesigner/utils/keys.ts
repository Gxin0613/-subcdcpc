import { InjectionKey } from 'vue';
import { ProvideFlowInfo, ProvideNodeInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';

export const flowEntityKeys = Symbol() as InjectionKey<ProvideFlowInfo>; // 流程key
export const nodeEntityKeys = Symbol() as InjectionKey<ProvideNodeInfo>; // 节点key
export const selectedNodeKey = Symbol() as InjectionKey<any>; //  选择节点key
