<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Card :title="'节点时限'">
          <template v-if="isReadonly === false" #extra
            ><Button type="primary" @click="Save">{{ '保存' }}</Button></template
          >
          <Table bordered size="small" :data-source="tableData" :columns="columns" :pagination="false" :scroll="{ x: 2000, y: 500 }">
            <template #bodyCell="{ column, text, record, index }">
              <template v-if="column.dataIndex === 'idx'">{{ index + 1 }}</template>
              <template v-else-if="record.IsEdit === 1 && record.NodeID != startNode">
                <template v-if="column.dataIndex === 'StartDT' || column.dataIndex === 'EndDT'">
                  <DatePicker
                    v-model:value="record[column.dataIndex]"
                    :show-time="true"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                    style="width: 100%"
                    class="frmStyleType"
                  />
                </template>
                <template v-else-if="column.dataIndex === 'GT' || column.dataIndex === 'Scale' || column.dataIndex === 'TotalScale'">
                  <InputNumber
                    v-model:value="record[column.dataIndex]"
                    :id="column.dataIndex"
                    :controls="false"
                    style="width: 100%"
                    :precision="0"
                    stringMode
                    class="frmStyleType"
                  />
                </template>
                <template v-else>{{ text }}</template>
              </template>
              <template v-else> {{ text }}</template>
            </template>
          </Table>
        </Card>
        <Card :title="'流程时限'">
          <Table bordered size="small" :data-source="flowTableData" :columns="flowColumns" :pagination="false" :scroll="{ x: 2000, y: 500 }">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'IsChangeDT' && record.IsHidden === 0">
                <DatePicker
                  v-model:value="record[column.dataIndex]"
                  :show-time="true"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  style="width: 100%"
                  class="frmStyleType"
                />
              </template>
              <template v-else> {{ text }}</template>
            </template>
          </Table>
        </Card>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { Spin, message, Card, Button, Table, DatePicker, InputNumber } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const columns = [
    {
      title: '序号',
      dataIndex: 'idx',
      width: 50,
      align: 'center',
    },
    {
      title: '节点',
      dataIndex: 'NodeName',
      width: 150,
      align: 'center',
    },
    {
      title: '处理人',
      dataIndex: 'EmpName',
      width: 150,
      align: 'center',
    },
    {
      title: '计划开始时间',
      dataIndex: 'StartDT',
      width: 180,
      align: 'center',
    },
    {
      title: '计划完成时间',
      dataIndex: 'EndDT',
      width: 180,
      align: 'center',
    },
    {
      title: '工天(天)',
      dataIndex: 'GT',
      width: 100,
      align: 'center',
    },
    {
      title: '阶段占比(%)',
      dataIndex: 'Scale',
      width: 120,
      align: 'center',
    },
    {
      title: '总体进度(%)',
      dataIndex: 'TotalScale',
      width: 120,
      align: 'center',
    },
    {
      title: '任务到达时间',
      dataIndex: 'ADT',
      width: 140,
      align: 'center',
    },
    {
      title: '实际完成时间',
      dataIndex: 'ComplateDT',
      width: 140,
      align: 'center',
    },
    {
      title: '耗时',
      dataIndex: 'HS',
      width: 100,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'WFState',
      width: 100,
      align: 'center',
    },
  ];
  const flowColumns = [
    {
      title: '开始日期',
      dataIndex: 'StartDT',
      width: 160,
      align: 'center',
    },
    {
      title: '应完成日期',
      dataIndex: 'SDTOfFlow',
      width: 160,
      align: 'center',
    },
    {
      title: '剩余时间',
      dataIndex: 'SYSJ',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'State',
      width: 80,
      align: 'center',
    },
    {
      title: '调整时间',
      dataIndex: 'IsChangeDT',
      width: 180,
      align: 'center',
    },
  ];
  const tableData = ref<Record<string, any>[]>([]);
  const flowTableData = ref<Record<string, any>[]>([]);
  const isReadonly = ref(false);
  const startNode = ref(0);
  const isShowFlow = ref(false);
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('CH_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      startNode.value = parseInt(parseInt(props.params.FK_Flow) + '01');
      const result = JSON.parse(JSON.stringify(data));
      const chNodes = result['WF_CHNode'];
      const gwls = result['WF_GenerWorkerlist'];
      const node = result.WF_CurrNode[0];

      if (props.params.IsReadonly === '1') isReadonly.value = true;
      else {
        if (node.CHRole === 2) isReadonly.value = true;
      }
      isShowFlow.value = node.CHRole === 3 ? true : false;
      //流程时限属性
      const gwf = result.WF_GenerWorkFlow[0];
      ParseNodeData(chNodes, node.CHRole);
      ParseFlowData(gwf, node.CHRole, result.SpanTime[0]);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  const ParseNodeData = (chNodes, chRole) => {
    tableData.value = [];
    chNodes.forEach((chNode) => {
      const item: Record<string, any> = {};
      //已经运行过的节点或者运行到的节点
      if (!!chNode.AtPara) {
        item.NodeName = chNode.NodeName;
        item.NodeID = chNode.FK_Node;
        item.EmpName = chNode.FK_EmpT;
        item.StartDT = chNode.StartDT;
        item.EndDT = chNode.EndDT;
        item.GT = chNode.GT;
        item.Scale = chNode.Scale;
        item.TotalScale = chNode.TotalScale;
        const isPass = parseInt(GetPara(chNode.AtPara, 'IsPass') || '0');
        if (isPass != 1) {
          item.IsEdit = 1;
        } else {
          item.IsEdit = 0;
        }
        if (chNode.FK_Node == parseInt(props.params.FK_Flow) + '01') {
          // 开始节点
          item.HS = '无';
          item.WFState = '正常';
        } else {
          //耗时
          let rdt = GetPara(chNode.AtPara, 'RDT');
          let cdt = GetPara(chNode.AtPara, 'CDT');
          const useTime = dayjs(cdt).diff(rdt, 'second') || 0;
          item.HS = dayjs.duration(useTime).format('DD天 HH时mm分ss秒');
          //状态
          if (cdt <= chNode.EndDT) item.WFState = '正常';
          else item.WFState = '逾期';
        }
      } else {
        //未运行到的节点
        if (chNode.FK_Node == parseInt(props.params.FK_Flow) + '01') {
          // 开始节点
          item.NodeName = chNode.NodeName;
          item.NodeID = chNode.FK_Node;
          item.EmpName = WebUser.Name;
          item.StartDT = dayjs().format('YYYY-MM-DD HH:mm');
          item.EndDT = '无';
          item.GT = chNode.GT;
          item.Scale = chNode.Scale;
          item.TotalScale = chNode.TotalScale;
          item.ADT = dayjs().format('YYYY-MM-DD HH:mm');
          item.ComplateDT = '无';
          item.HS = '无';
          item.WFState = '正常';
          item.IsEdit = 1;
        } else {
          item.NodeName = chNode.NodeName;
          item.NodeID = chNode.FK_Node;
          item.EmpName = '';
          if (isReadonly.value === true) {
            item.StartDT = chNode.StartDT;
            item.EndDT = chNode.EndDT;
            item.GT = chNode.GT;
            item.Scale = chNode.Scale;
            item.TotalScale = chNode.TotalScale;
            item.IsEdit = 0;
          } else {
            if (chRole == 1 || chRole == 3 || isReadonly.value === false) {
              item.StartDT = chNode.StartDT;
              item.EndDT = chNode.EndDT;
              item.GT = chNode.GT;
              item.Scale = chNode.Scale;
              item.TotalScale = chNode.TotalScale;
              item.IsEdit = 1;
            } else {
              item.StartDT = chNode.StartDT;
              item.EndDT = chNode.EndDT;
              item.GT = chNode.GT;
              item.Scale = chNode.Scale;
              item.TotalScale = chNode.TotalScale;
              item.IsEdit = 0;
            }
          }
          item.ADT = '-';
          item.ComplateDT = '-';
          item.HS = '-';
          item.WFState = '-';
        }
        tableData.value.push(item);
      }
    });
  };
  const ParseFlowData = (gwf, chRole, spanTime) => {
    flowTableData.value = [];
    const item: Record<string, any> = {};
    item.StartDT = gwf.RDT;
    if (!gwf.SDTOfFlow) {
      item.SDTOfFlow = '无';
      item.SYSJ = '0秒';
      item.State = '无';
    } else {
      item.SDTOfFlow = gwf.SDTOfFlow;
      if (gwf.SDTOfFlow <= dayjs().format('YYYY-MM-DD HH:mm')) {
        item.SYSJ = dayjs.duration(dayjs(new Date()).diff(gwf.SDTOfFlow, 'second') || 0).format('DD天 HH时mm分ss秒');
        item.State = '逾期';
      } else {
        item.SYSJ = spanTime.SpanTime;
        item.State = '正常';
      }
    }
    if (chRole == 3 && isReadonly.value == false) item.IsHidden = 0;
    else item.IsHidden = 1;
    flowTableData.value.push(item);
  };
  InitPage();

  const Save = async () => {
    loading.value = true;
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      tableData.value.forEach((item) => {
        if (item.IsEdit === 1 && item.NodeID != startNode.value) {
          handler.AddPara('StartDT_' + item.NodeID, item.StartDT);
          handler.AddPara('EndDT_' + item.NodeID, item.EndDT);
          handler.AddPara('GT_' + item.NodeID, item.GT);
          handler.AddPara('Scale_' + item.NodeID, item.Scale);
          handler.AddPara('TotalScale_' + item.NodeID, item.TotalScale);
        }
      });
      flowTableData.value.forEach((item) => {
        if (item.IsHidden === 0) handler.AddPara('GWF', item.IsChangeDT);
      });
      await handler.DoMethodReturnString('CH_Save');
      await InitPage();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
</script>
<style scoped></style>
