<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Card style="width: 100%" :tab-list="tabListNoTitle" :active-tab-key="noTitleKey" @tabChange="(key) => onTabChange(key)">
          <div v-if="noTitleKey === 'gwf'">
            <Row>
              <Col :span="4" class="colTitle">流程ID(WorkID)</Col><Col :span="4" class="colContent">{{ gwf.WorkID }}</Col> <Col :span="4" class="colTitle">干流程ID(FID)</Col
              ><Col :span="4" class="colContent">{{ gwf.FID }}</Col> <Col :span="4" class="colTitle">流程类别(FK_FlowSort)</Col
              ><Col :span="4" class="colContent">{{ gwf.FK_FlowSort }}</Col> <Col :span="4" class="colTitle">流程ID(WorkID)</Col
              ><Col :span="4" class="colContent">{{ gwf.WorkID }}</Col> <Col :span="4" class="colTitle">流程编号(FK_Flow)</Col
              ><Col :span="4" class="colContent">{{ gwf.FK_Flow }}</Col> <Col :span="4" class="colTitle">流程名称(FlowName)</Col
              ><Col :span="4" class="colContent">{{ gwf.FlowName }}</Col> <Col :span="4" class="colTitle">节点编号(FK_Node)</Col
              ><Col :span="4" class="colContent">{{ gwf.FK_Node }}</Col> <Col :span="4" class="colTitle">节点名称(NodeName)</Col
              ><Col :span="4" class="colContent">{{ gwf.NodeName }}</Col> <Col :span="4" class="colTitle">发送人所在的部门编号(FK_Dept)</Col
              ><Col :span="4" class="colContent">{{ gwf.FK_Dept }}</Col> <Col :span="4" class="colTitle">所在的部门名称(DeptName)</Col
              ><Col :span="4" class="colContent">{{ gwf.DeptName }}</Col> <Col :span="4" class="colTitle">标题(Title)</Col><Col :span="12" class="colContent">{{ gwf.Title }}</Col>
              <Col :span="4" class="colTitle">状态(WFSta)</Col><Col :span="4" class="colContent">{{ gwf.WFSta }}</Col> <Col :span="4" class="colTitle">状态(WFState)</Col
              ><Col :span="4" class="colContent">{{ gwf.WFState }}</Col> <Col :span="4" class="colTitle">发起人(Starter)</Col
              ><Col :span="4" class="colContent">{{ gwf.Starter }}</Col> <Col :span="4" class="colTitle">发起人名称(StarterName)</Col
              ><Col :span="4" class="colContent">{{ gwf.StarterName }}</Col> <Col :span="4" class="colTitle">当前发送人名称(Sender)</Col
              ><Col :span="4" class="colContent">{{ gwf.Sender }}</Col> <Col :span="4" class="colTitle">到达时间(RDT)</Col><Col :span="4" class="colContent">{{ gwf.RDT }}</Col>
              <Col :span="4" class="colTitle">挂起时间(HungupTime)</Col><Col :span="4" class="colContent">{{ gwf.HungupTime }}</Col>
              <Col :span="4" class="colTitle">发送时间(SendDT)</Col><Col :span="4" class="colContent">{{ gwf.SendDT }}</Col>

              <Col :span="4" class="colTitle">优先级(PRI)</Col><Col :span="4" class="colContent">{{ gwf.PRI }}</Col> <Col :span="4" class="colTitle">节点应完成时间(SDTOfNode)</Col
              ><Col :span="4" class="colContent">{{ gwf.SDTOfNode }}</Col> <Col :span="4" class="colTitle">流程应完成时间(SDTOfFlow)</Col
              ><Col :span="4" class="colContent">{{ gwf.SDTOfFlow }}</Col> <Col :span="4" class="colTitle">流程名称(SDTOfFlowWarning)</Col
              ><Col :span="4" class="colContent">{{ gwf.SDTOfFlowWarning }}</Col> <Col :span="4" class="colTitle">父流程编号(PFlowNo)</Col
              ><Col :span="4" class="colContent">{{ gwf.PFlowNo }}</Col> <Col :span="4" class="colTitle">父流程WorkID(PWorkID)</Col
              ><Col :span="4" class="colContent">{{ gwf.PWorkID }}</Col> <Col :span="4" class="colTitle">父流程节点ID(PNodeID)</Col
              ><Col :span="4" class="colContent">{{ gwf.PNodeID }}</Col> <Col :span="4" class="colTitle">父流程干流程ID(PFID)</Col
              ><Col :span="4" class="colContent">{{ gwf.PFID }}</Col> <Col :span="4" class="colTitle">父流程处理人(PEmp)</Col
              ><Col :span="4" class="colContent">{{ gwf.PEmp }}</Col> <Col :span="4" class="colTitle">外部处理人(GuestNo)</Col
              ><Col :span="4" class="colContent">{{ gwf.GuestNo }}</Col> <Col :span="4" class="colTitle">外部处理人名称(GuestName)</Col
              ><Col :span="4" class="colContent">{{ gwf.GuestName }}</Col> <Col :span="4" class="colTitle">单据号(BillNo)</Col
              ><Col :span="4" class="colContent">{{ gwf.BillNo }}</Col>

              <Col :span="4" class="colTitle">处理人(TodoEmps)</Col><Col :span="4" class="colContent">{{ gwf.TodoEmps }}</Col> <Col :span="4" class="colTitle">组织编号(OrgNo)</Col
              ><Col :span="4" class="colContent">{{ gwf.OrgNo }}</Col> <Col :span="4" class="colTitle">备注(FlowNote)</Col
              ><Col :span="4" class="colContent">{{ gwf.FlowNote }}</Col>
              <Col :span="8" class="colContent" />
              <Col :span="4" class="colTitle">参数(AtPara)</Col><Col :span="20" class="colContent">{{ gwf.AtPara }}</Col>
            </Row>
          </div>
          <div v-else-if="noTitleKey === 'gwl'">
            <Table :columns="gwlColumns" :data-source="gwl" bordered size="small" :scroll="{ x: 2300 }" :rowKey="(record, index) => index" :pagination="false" />
          </div>
          <div v-else-if="noTitleKey === 'track'">
            <Table :columns="trackColumns" :data-source="track" bordered size="small" :scroll="{ x: 2100 }" :rowKey="(record, index) => index" :pagination="false" />
          </div>
          <div v-else> </div>
        </Card>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Spin, message, Card, Row, Col, Table } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  const props = defineProps({
    FlowNo: {
      //请求参数集合
      type: String,
      default: () => '',
    },
    WorkID: {
      type: Number,
      default: () => 0,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const tabListNoTitle = [
    {
      key: 'gwf',
      tab: '流程引擎控制表',
    },
    {
      key: 'gwl',
      tab: '工作人员列表',
    },
    {
      key: 'track',
      tab: '流程轨迹表',
    },
    {
      key: 'rpt',
      tab: '流程数据表',
    },
  ];
  const noTitleKey = ref('gwf');
  const gwf = ref<Record<string, any>>({});
  const gwl = ref<Record<string, any>[]>([]);
  const track = ref<Record<string, any>[]>([]);
  const rpt = ref<Record<string, any>>({});

  //const gwlTable = shallowRef<InstanceType<typeof BasicTable>>();
  //const trackTable = shallowRef<InstanceType<typeof BasicTable>>();
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
      handler.AddPara('WorkID', props.WorkID);
      handler.AddPara('FK_Flow', props.FlowNo);
      const data = await handler.DoMethodReturnString('DBInfo_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      //流程引擎控制表.
      gwf.value = result.WF_GenerWorkFlow[0];
      //工作人员列表.
      gwl.value = result.WF_GenerWorkerList;
      //日志表..
      track.value = result.Track;
      //trackTable?.value.setTableData(track.value);
      //流程数据表..
      rpt.value = result.NDRpt[0];
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const onTabChange = (value) => {
    noTitleKey.value = value;
  };

  const gwlColumns = [
    {
      title: '流程ID',
      dataIndex: 'WorkID',
      key: 'WorkID',
    },
    {
      title: '干流程ID',
      dataIndex: 'FID',
      key: 'FID',
    },
    {
      title: '处理人',
      dataIndex: 'FK_Emp',
      key: 'FK_Emp',
    },
    {
      title: '处理人名称',
      dataIndex: 'EmpName',
      key: 'EmpName',
    },
    {
      title: '部门',
      dataIndex: 'FK_Dept',
      key: 'FK_Dept',
    },
    {
      title: '部门名称',
      dataIndex: 'FK_DeptText',
      key: 'FK_DeptText',
    },
    {
      title: '流程名称',
      dataIndex: 'FK_Flow',
      key: 'FK_Flow',
    },
    {
      title: '当前节点编号',
      dataIndex: 'FK_Node',
      key: 'FK_Node',
    },
    {
      title: '当前节点名称',
      dataIndex: 'NodeName',
      key: 'NodeName',
    },
    {
      title: '应完成时间',
      dataIndex: 'SDT',
      key: 'SDT',
    },
    {
      title: '预警时间',
      dataIndex: 'DTOfWarning',
      key: 'DTOfWarning',
    },
    {
      title: '到达时间',
      dataIndex: 'RDT',
      key: 'RDT',
    },
    {
      title: '处理时间',
      dataIndex: 'CDT',
      key: 'CDT',
    },
    {
      title: '是否可处理',
      dataIndex: 'IsEnable',
      key: 'IsEnable',
    },
    {
      title: '是否已读',
      dataIndex: 'IsRead',
      key: 'IsRead',
    },
    {
      title: '是否通过',
      dataIndex: 'IsPass',
      key: 'IsPass',
    },
    {
      title: '执行方式',
      dataIndex: 'WhoExeIt',
      key: 'WhoExeIt',
    },
    {
      title: '发送到该节点的人',
      dataIndex: 'Sender',
      key: 'Sender',
    },
    {
      title: '优先级',
      dataIndex: 'PRI',
      key: 'PRI',
    },
    {
      title: '挂起时间',
      dataIndex: 'DTOfHungup',
      key: 'DTOfHungup',
    },
    {
      title: '挂起结束时间',
      dataIndex: 'DTOfUnHungup',
      key: 'DTOfUnHungup',
    },
    {
      title: '挂起时长',
      dataIndex: 'HungupTimes',
      key: 'HungupTimes',
    },
    {
      title: '顺序',
      dataIndex: 'Idx',
      key: 'Idx',
    },
    {
      title: '参数',
      dataIndex: 'AtPara',
      key: 'AtPara',
    },
  ];

  const trackColumns = [
    {
      title: 'MyPK',
      dataIndex: 'MyPK',
      key: 'MyPK',
    },
    {
      title: '类型',
      dataIndex: 'ActionType',
      key: 'ActionType',
    },
    {
      title: '类型文本',
      dataIndex: 'ActionTypeText',
      key: 'ActionTypeText',
    },
    {
      title: '干流程ID',
      dataIndex: 'FID',
      key: 'FID',
    },
    {
      title: '流程ID',
      dataIndex: 'WorkID',
      key: 'WorkID',
    },
    {
      title: '开始节点编号',
      dataIndex: 'NDFrom',
      key: 'NDFrom',
    },
    {
      title: '开始节点名称',
      dataIndex: 'NDFromT',
      key: 'NDFromT',
    },
    {
      title: '结束节点编号',
      dataIndex: 'NDTo',
      key: 'NDTo',
    },
    {
      title: '结束节点名称',
      dataIndex: 'NDToT',
      key: 'NDToT',
    },
    {
      title: '发起人编号',
      dataIndex: 'EmpFrom',
      key: 'EmpFrom',
    },
    {
      title: '发起人名称',
      dataIndex: 'EmpFromT',
      key: 'EmpFromT',
    },
    {
      title: '接收人编号',
      dataIndex: 'EmpTo',
      key: 'EmpTo',
    },
    {
      title: '接收人名称',
      dataIndex: 'EmpToT',
      key: 'EmpToT',
    },
    {
      title: '处理时间',
      dataIndex: 'RDT',
      key: 'RDT',
    },
    {
      title: 'WorkTimeSpan',
      dataIndex: 'WorkTimeSpan',
      key: 'WorkTimeSpan',
    },
    {
      title: '处理信息',
      dataIndex: 'Msg',
      key: 'Msg',
    },
    {
      title: 'NodeData',
      dataIndex: 'NodeData',
      key: 'NodeData',
    },
    {
      title: 'Tag',
      dataIndex: 'Tag',
      key: 'Tag',
    },
    {
      title: 'Exer',
      dataIndex: 'Exer',
      key: 'Exer',
    },
  ];
</script>
<style lang="less" scoped>
  .title {
    padding: 8px 22px;
    box-sizing: border-box;
    font-weight: 600;
    font-size: 14px;
    min-height: 40px;
    color: green;
  }
  .colTitle {
    background: #fafafa;
    border: 1px solid #f0f0f0;
    padding: 12px 8px;
  }
  .colContent {
    border: 1px solid #f0f0f0;
    padding: 12px 8px;
  }
</style>
