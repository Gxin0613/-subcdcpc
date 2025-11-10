<template>
  <div class="p-1">
    <base-component ref="baseComponent">
      <Spin :spinning="loading" style="background-color: white">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <Table
          v-if="showType === 'Table'"
          :columns="columns"
          :data-source="subFlowData"
          :row-key="(record) => record.MyPK"
          :expandRowByClick="true"
          :expandedRowKeys="expandedRowKeys"
          :pagination="false"
          @expand="onExpand"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.key === 'Title' && !!record.Title">
              <a @click="OpenFlow(record)">{{ record.Title }}</a>
            </template>
            <template v-if="column.key === 'RDT' && record.IsCanStart && record.Title === undefined">
              <a @click="StartFlow(record)">[{{ record.SFCaption }}]</a>
            </template>
          </template>
        </Table>
      </Spin>
    </base-component>
  </div>
</template>
<script lang="ts" setup>
  import { Spin, Table } from 'ant-design-vue';
  // 父组件传过来的属性
  import { onMounted, reactive, ref, shallowRef } from 'vue';
  import { SubFlowHands } from '/@/WF/Admin/AttrNode/SubFlow/SubFlowHand';
  import { FrmSubFlow } from '../TSClass/FrmSubFlow';
  import WebUser from '/@/bp/web/WebUser';
  import { GenerWorkFlowExt } from '../TSClass/FlowData/GenerWorkFlowExt';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import BSEntities from '/@/utils/gener/BSEntities';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import Events from '/@/utils/Events';
import { FrmSubFlowNode } from '../TSClass/FrmSubFlowNode';
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    nodeInfo: {
      type: Object,
      default: () => {},
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const expandedRowKeys = ref<string[]>([]);
  const columns = [
    {
      title: '发起人',
      dataIndex: 'StarterName',
      key: 'StarterName',
      width: '15%',
      customCell: (record) => {
        if (record['Title'] === undefined) return { colSpan: 2 };
      },
    },
    {
      title: '标题',
      dataIndex: 'Title',
      key: 'Title',
      width: '25%',
      customCell: (record) => {
        if (record['Title'] === undefined) return { colSpan: 0 };
      },
    },
    {
      title: '停留节点',
      dataIndex: 'NodeName',
      key: 'NodeName',
      width: '15%',
    },
    {
      title: '状态',
      dataIndex: 'WFStateText',
      key: 'WFStateText',
      width: '10%',
    },
    {
      title: '处理人',
      dataIndex: 'TodoEmpNames',
      key: 'TodoEmpNames',
      width: '15%',
    },
    {
      title: '处理时间',
      dataIndex: 'RDT',
      key: 'RDT',
      width: '15%',
    },
  ];
  const onExpand = (expanded, record) => {
    if (expanded) {
      // 设置展开窗Key，代表展开操作
      expandedRowKeys.value.push(record.MyPK);
    } else {
      // 代表折叠操作
      if (expandedRowKeys.value.length) {
        expandedRowKeys.value = expandedRowKeys.value.filter((v) => {
          return v !== record.MyPK;
        });
      }
    }
  };
  const loading = ref(false);
  const showType = ref('Table');
  const subFlowData = ref<any[]>([]);
  const gwf = ref<GenerWorkFlowExt>({});
  const InitPage = async () => {
    try {
      //当前节点手动启动的所有子流程.
      const subFlows = new SubFlowHands();
      const nodeID = props.nodeInfo.NodeID;
      await subFlows.Retrieve('FK_Node', nodeID, 'SubFlowType', 0, 'Idx');

      //父子流程组件的通用配置信息
      const frmSubFlow = new FrmSubFlowNode(nodeID);
      await frmSubFlow.Retrieve();

      //获取当前流程实例信息
      const en = new GenerWorkFlowExt(props.params.WorkID);
      await en.Retrieve();
      gwf.value = en;
      //处理累加表单问题，如果当前节点与，绑定子流程的节点不一致，就把他设置为只读.
      if (props.params.FK_Node != nodeID) {
        subFlows.forEach((subFlow) => (subFlow.SubFlowSta = 2));
      }

      //子流程组件配置,控制表单行为的。
      //const fsf = new FrmSubFlowNode(nodeID);
      //await fsf.Retrieve();

      //单条启动模式还是会签启动模式
      const subFlowGuids = subFlows.filter((subFlow) => subFlow.SubFlowStartModel != 0);
      //表格/列表显示方式
      showType.value = subFlowGuids.length > 0 ? 'List' : 'Table';
      if (showType.value === 'Table') await ShowTableSubFlow(subFlows, frmSubFlow, en);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * Table展示父子流程
   * @param subFlows 绑定的子流程
   * @param frmSubFlow 父子流程组件属性
   * @param gwf 当前流程实例的信息
   * @constructor
   */
  const ShowTableSubFlow = async (subFlows, frmSubFlow, gwf) => {
    for (const subFlow of subFlows) {
      if (subFlow.SubFlowSta != 0) {
        let item = Object.fromEntries(subFlow.Row);
        let pworkid = 0;
        const subflowModel = subFlow.SubFlowModel || 0;
        //启用、只读状态
        if (frmSubFlow.SFSta === 1 && subFlow.SubFlowSta === 1 && props.isReadonly === false) {
          //父子流程组件启用且当前子流程启用，并且当前流程实例的状态是审批状态
          if (subflowModel == 0) {
            // 下级子流程
            pworkid = props.params.WorkID;
            item['IsCanStart'] = true;
          }
          if (subflowModel == 1) {
            //平级子流程
            if (gwf.PWorkID == 0) {
              item['IsCanStart'] = false;
            } else {
              pworkid = gwf.PWorkID;
            }
          }
        }
        if (frmSubFlow.SFSta === 2 || subFlow.SubFlowSta === 2 || props.isReadonly === true) {
          item['IsCanStart'] = false;
          if (subflowModel == 1) pworkid = gwf.PWorkID;
        }
        item.SFCaption = item.SFCaption || '启动子流程';
        //获取发起的子流程
        const gwfs = new BSEntities('BP.WF.GenerWorkFlows');
        if (subFlow.SFShowCtrl == 0) await gwfs.Retrieve('PWorkID', pworkid.toString(), 'FK_Flow', subFlow.SubFlowNo);
        else await gwfs.Retrieve('PWorkID', pworkid.toString(), 'FK_Flow', subFlow.SubFlowNo, 'Starter', WebUser.No);
        item['StarterName'] = subFlow.SubFlowName;
        item.children = [];
        item['key'] = subFlow.FK_Flow;
        gwfs.getData().forEach((gwf) => {
          if (gwf.WFState == 0) return;
          if (gwf.FID != 0) return;
          gwf.WFStateText = GetState(gwf.WFState);
          const slWorkID = GetPara(gwf.AtPara, 'SLWorkID') || 0;
          if (slWorkID != 0 && slWorkID != props.params.WorkID)
            //不是当前流程实例启动的平级子流程
            return;
          let str = gwf.TodoEmps || '';
          let result = str.split(';');
          const reg = /[a-zA-Z\,]+/;
          while ((result = str.match(reg))) {
            str = str.replace(result[0], '');
          }

          gwf['TodoEmpNames'] = str;
          item.children.push(gwf);
        });
        subFlowData.value.push(item);
      }
    }
  };

  const GetState = (wfState) => {
    switch (parseInt(wfState)) {
      case 1:
        return '草稿';
      case 2:
        return '新工作';
        break;
      case 3: //已完成.
        return '归档';
        break;
      case 4:
        return '挂起';
      case 5:
        return '退回';
      case 6:
        return '转发';
      case 7:
        return '删除';
      case 8:
        return '加签';
      case 11:
        return '加签回复';
      default:
        return '其它';
    }
  };
  InitPage();
  /**
   * 发起子流程
   * @param row
   * @constructor
   */
  const StartFlow = (row) => {
    const subflowModel = row.SubFlowModel || 0;
    let url = location.pathname + '#/WF/MyFlow?PageFrom=SubFlow';
    if (subflowModel == 0)
      url +=
        'IsStartSameLevelFlow=0&&FK_Flow=' +
        row.SubFlowNo +
        '&PWorkID=' +
        gwf.value.WorkID +
        '&PNodeID=' +
        gwf.value.FK_Node +
        '&PFlowNo=' +
        gwf.value.FK_Flow +
        '&PFID=' +
        gwf.value.FID;
    else
      url +=
        'IsStartSameLevelFlow=1&&FK_Flow=' +
        row.SubFlowNo +
        '&PWorkID=' +
        gwf.value.PWorkID +
        '&PNodeID=' +
        gwf.value.PNodeID +
        '&PFlowNo=' +
        gwf.value.PFlowNo +
        '&PFID=' +
        gwf.value.PFID +
        '&SLWorkID=' +
        gwf.value.WorkID +
        '&SLNodeID=' +
        gwf.value.FK_Node +
        '&SLFlowNo=' +
        gwf.value.FK_Flow;

    baseComponent.value?.openIframe({
      title: '发起' + row.SubFlowName,
      width: '75%',
      src: url,
      openType: 1,
    });
    //window.open(url);
  };

  const iframeMessageHandler = async ({ data }) => {
    switch (data.type) {
      case MessageTypeEnum.ReloadPage:
        baseComponent.value?.resetIframe();
        await InitPage();
        break;
      default:
        break;
    }
  };
  onMounted(() => {
    window.addEventListener('message', iframeMessageHandler, true);
  });

  /**
   * 打开子流程
   * @param row
   * @constructor
   */
  const OpenFlow = (row) => {
    let url =
      location.pathname +
      '#/WF/MyView?PageFrom=SubFlow&WorkID=' +
      row.WorkID +
      '&FK_Flow=' +
      row.FK_Flow +
      '&IsCheckGuide=1&Frms=' +
      row.Paras_Frms +
      '&FK_Node=' +
      row.FK_Node +
      '&PNodeID=' +
      row.PNodeID +
      '&PWorkID=' +
      row.PWorkID;
    baseComponent.value?.openIframe({
      title: '处理' + row.FlowName + '=>' + row.NodeName,
      width: '75%',
      src: url,
      openType: 1,
    });
  };
</script>
<style scoped></style>
