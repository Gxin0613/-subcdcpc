<template>
  <!-- 调整未来处理人 -->
  <div class="content">
    <ThemeWrapper>
      <Table :columns="columnsHead" :data-source="dataHead" bordered :pagination="false" size="middle" :row-class-name="(_record, index) => (index === 0 ? 'firstLine' : '')" />
      <Table
        :columns="columnsBody"
        :data-source="dataBody"
        bordered
        :show-header="false"
        :pagination="false"
        size="middle"
        :row-class-name="(_record, index) => (index === 0 ? 'firstLine' : '')"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'EmpName'">
            <div class="tableFlex">
              <div class="showTag">
                <InputGroup compact :disabled="true" style="position: relative">
                  <div class="pop_intput_div" style="padding-left: 5px">
                    <template v-for="(ele, idx) in record?.EmpsName?.split(',').filter((item) => item != '')" :key="ele">
                      <!-- closable="true" @close="DeleteDB(record, ele, idx)" -->
                      <Tag v-if="currentNodeRole === 0" color="#aeaeae">
                        {{ ele }}
                      </Tag>
                      <Tag v-else-if="currentNodeRole === 1" :closable="true" @close="DeleteDB(record, ele, idx)" color="#0960bd">
                        {{ ele }}
                      </Tag>
                      <Tag v-else-if="currentNodeRole === 2" color="#0960bd">
                        {{ ele }}
                      </Tag>
                    </template>
                  </div>
                  <Button v-if="currentNodeRole === 1" @click="PopModalShow(record, currentNodeRole)">
                    <SettingOutlined />
                  </Button>
                </InputGroup>
              </div>
            </div>
          </template>
        </template>
      </Table>
      <div class="resetControls">
        <Button type="primary" @click="reset" class="btnStyle"> <RedoOutlined />{{ '重置' }}</Button>
      </div>
    </ThemeWrapper>

    <Modal v-model:open="popModal.visible" :title="'调整未来处理人'" @ok="handleEnsure" width="980px">
      <PopTreeEns
        ref="treeEns"
        :listSql="popMapExt.Tag3"
        :treeSql="popMapExt.Tag1"
        :parentNo="popMapExt.Tag5"
        :search-sql="popMapExt.Tag4 || ''"
        :is-have-upper-level="popMapExt.Tag6 === '0' ? false : true"
        :is-multi-select="true"
        :is-show-search="'1'"
        :selected-items="rowData.Worker"
        :selected-item-names="rowData.WorkerName"
      />
    </Modal>
  </div>
</template>
<script lang="ts" setup>
  import { Table, Modal, InputGroup, Tag, message, Button } from 'ant-design-vue';
  import { ExclamationCircleOutlined, RedoOutlined, SettingOutlined } from '@ant-design/icons-vue';
  import type { TableColumnType } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { createVNode, reactive, ref, shallowRef } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import PopTreeEns from '/@/WF/Comm/subComponents/PopTreeEns.vue';
  import { GloWF } from '../Admin/GloWF';
  import { AtPara } from '/@/bp/da/AtPara';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import { BtnLab } from '../Admin/AttrNode/BtnLab';
  import { NodeExt } from '../Admin/AttrNode/NodeExt';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  console.log(props.params);
  const workID = ref(props.params.WorkID);
  const nodeID = ref(props.params.NodeID);
  const flowNo = props.params.FlowNo || props.params.FK_Flow;
  //当前节点的接收人规则
  const currentNodeRole = ref();
  //设置弹窗参数
  const popMapExt = reactive({
    ExtModel: 'Pop',
    ExtType: 'PopTreeEns',
    AtPara: new AtPara(),
    Tag1: GloWF.srcDeptLazily,
    Tag3: GloWF.srcEmpLazily,
    Tag4: GloWF.srcEmpSearchKey,
    Tag5: '0',
    Tag6: '1',
  });
  //设置参数.
  popMapExt.AtPara.SetVal('Label', '请选择');
  popMapExt.AtPara.SetVal('Icon', 'icon-options');
  popMapExt.AtPara.SetVal('IsShowSearch', '0');
  //第一行数据只显示FK_Node
  const sharedOnCell: any = (_, index) => {
    if (index === 0) {
      return { colSpan: 0 };
    }
  };
  const columnsHead: TableColumnType[] = [
    {
      title: '节点编号',
      dataIndex: 'FK_Node',
      customCell: (_, index: any) => ({
        colSpan: index > 0 ? 1 : 4,
      }),
      width: 100,
    },
    {
      title: '节点名称',
      dataIndex: 'NodeName',
      customCell: sharedOnCell,
      width: 150,
    },
    {
      title: '处理人',
      dataIndex: 'EmpName',
      customCell: sharedOnCell,
    },
    {
      title: '日期',
      dataIndex: 'RDT',
      customCell: sharedOnCell,
      width: 200,
    },
  ];
  const columnsBody: TableColumnType[] = [
    {
      dataIndex: 'FK_Node',
      customCell: (_, index: any) => ({
        colSpan: index > 0 ? 1 : 4,
      }),
      width: 100,
    },
    {
      dataIndex: 'NodeName',
      customCell: sharedOnCell,
      width: 150,
    },
    {
      dataIndex: 'EmpName',
      customCell: sharedOnCell,
    },
  ];

  //已运行节点
  const dataHead: any = ref([
    {
      FK_Node: '已运行的节点',
      NodeName: '',
      EmpName: '',
      RDT: '',
    },
  ]);
  //要排列的节点
  const dataBody: any = ref([
    {
      FK_Node: '可以调整未来处理人的节点',
      NodeName: '',
      EmpName: '',
      MyPK: '',
      TZWorkerRole: 0,
      IsFullSA: '',
    },
  ]);

  const tcs: any = ref([]); //计算的未来处理人.
  const nds: any = ref([]); //节点按钮集合.
  const gwls: any = ref([]); //已经走过的节点.
  const InitPage = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddJson(props.params);
    const data = await handler.DoMethodReturnJson('TZWorkerRole_Init');
    nds.value = data['WF_Node'];
    tcs.value = data['WF_SelectAccpers'];
    gwls.value = data['WF_GenerWorkerlist'];
    console.log(data);
    const btnLab = new BtnLab(nodeID.value);
    await btnLab.RetrieveFromDBSources();
    //当前节点的未来接收人规则
    currentNodeRole.value = btnLab.TZWorkerRole;
    //已运行节点
    dataHead.value = [
      {
        FK_Node: '已运行的节点',
        NodeName: '',
        EmpName: '',
        RDT: '',
      },
    ];
    let mergedData = {};

    for (let gwl of gwls.value) {
      if (mergedData[gwl.FK_Node]) {
        mergedData[gwl.FK_Node].EmpName.push(gwl.EmpName);
      } else {
        mergedData[gwl.FK_Node] = { FK_Node: gwl.FK_Node, EmpName: [gwl.EmpName], NodeName: gwl.NodeName, RDT: gwl.RDT };
      }
    }
    let resultGwl: any = [];
    for (let key in mergedData) {
      resultGwl.push(mergedData[key]);
    }
    for (let i = 0; i < resultGwl.length; i++) {
      const res = resultGwl[i];
      dataHead.value.push({
        FK_Node: res.FK_Node,
        NodeName: res.NodeName,
        EmpName: res.EmpName.join(','),
        RDT: res.RDT,
      });
    }

    dataBody.value = [
      {
        FK_Node: '可以调整未来处理人的节点',
        NodeName: '',
        EmpName: '',
        MyPK: '',
        TZWorkerRole: 0,
        IsFullSA: '',
        // RDT: '',
      },
    ];
    const tmp: any = [];
    tcs.value.forEach((item) => {
      if (GetPara(item.AtPara, 'IsFullSA') === '0') {
        tmp.push({ EmpName: item.EmpName, FK_Node: item.FK_Node, WorkID: item.WorkID, EmpsName: '' });
      }
    });
    console.log(tmp);

    //判断是否有接收人
    //如果节点有接收人直接push当前节点数据.
    //如果当前节点不存在接收人判断当前节点nodeExt.IsOpenSelecter是否等于1 如果等于1直接push当前节点数据.
    //如果都不存在就直接跳过该节点不进行处理.
    //start
    let nodeList: any = [];
    for (let i = 0; i < nds.value.length; i++) {
      const nd = nds.value[i];
      const nodeExt = new NodeExt(nd?.NodeID);
      await nodeExt.RetrieveFromDBSources();
      console.log('nodeExt' + [i], nodeExt);
      //当前节点判断
      const empNodes = tcs.value.filter((tc) => tc.FK_Node === nd.NodeID);
      // 检查是否有接收人
      if (empNodes.length > 0) {
        nodeList.push(nd);
      } else if (nodeExt.IsOpenSelecter == 1) {
        nodeList.push(nd);
      }
    }
    //end

    const result = nodeList
      .map((obj1) => {
        const empNodes = tcs.value.filter((obj2) => obj2.FK_Node === obj1.NodeID);
        const empsName = empNodes.map((obj) => obj.EmpName).join(',');
        const empsNo = empNodes.map((obj) => obj.FK_Emp).join(',');
        const empName = empNodes[0]?.AtPara.includes('@IsFullSA=1') ? empsName : empNodes[0]?.EmpName;
        return {
          NodeName: obj1.Name,
          NodeID: obj1.NodeID,
          WorkID: empNodes.length > 0 ? empNodes[0].WorkID : '',
          EmpsName: empsName,
          EmpsNo: empsNo,
          EmpName: empName,
          TZWorkerRole: obj1.TZWorkerRole,
          IsFullSA: empNodes[0]?.AtPara.includes('@IsFullSA=1') ? 1 : 0,
        };
      })
      .filter((obj) => obj !== null); // 过滤掉为 null 的对象
    //移除与已运行节点相同的节点
    for (let j = 0; j < result.length; j++) {
      const tc = result[j];
      for (let obj of resultGwl) {
        if (tc.NodeID === obj.FK_Node) {
          result.splice(j, 1);
          break;
        }
      }
    }
    console.log(result);
    for (let obj of result) {
      dataBody.value.push({
        FK_Node: obj.NodeID,
        NodeName: obj.NodeName,
        EmpName: obj.EmpName,
        EmpsName: obj.EmpsName,
        EmpsNo: obj.EmpsNo,
        TZWorkerRole: obj.TZWorkerRole,
        IsFullSA: obj.IsFullSA,
      });
    }
  };

  //弹窗显示事件
  //start
  const popModal = reactive({
    visible: false,
  });
  const rowData = ref();
  const PopModalShow = (rowdata, role) => {
    if (role == 0 || role == 2) {
      popModal.visible = false;
      message.error('当前节点的调整规则为不允许调整或者为不可移除.');
    } else {
      popModal.visible = true;
      rowData.value = rowdata;
      rowData.value.Worker = rowdata.EmpsNo;
      rowData.value.WorkerName = rowdata.EmpsName;
      console.log(rowdata);
    }
  };
  //end

  // 弹窗确认事件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  //popTreeEns弹出确认
  //start
  const handleEnsure = async (e: MouseEvent) => {
    popModal.visible = false;
    checkedList.value = treeEns.value?.allCheckList || [];
    checkedNames.value = treeEns.value?.checkedNames || [];
    console.log('checkedList', checkedList.value.filter((item) => item != '').join(','));
    console.log('checkedNames', checkedNames.value);
    for (let i = 0; i < checkedList.value.length; i++) {
      let item = checkedList.value[i];
      const en = new BSEntity('BP.WF.Template.SelectAccper');
      en.MyPK = rowData.value.FK_Node + '_' + workID.value + '_' + item;
      if ((await en.RetrieveFromDBSources()) != 0) {
        message.error(item + '已存在请重新选择.');
        return;
      }
      en.FK_Node = rowData.value.FK_Node;
      en.WorkID = workID.value;
      en.FK_Emp = item;
      en.EmpName = checkedNames.value[i];
      en.setPara('IsFullSA', 1);
      await en.Insert();
    }
    await InitPage();
  };
  //end

  //人员删除
  //start
  const DeleteDB = async (data, ele, idx) => {
    console.log(data, ele, idx);
    const mypk = data.FK_Node + '_' + workID.value + '_' + data.EmpsNo.split(',')[idx];
    const en = new BSEntity('BP.WF.Template.SelectAccper', mypk);
    await en.Init();
    await en.Delete();
    await InitPage();
  };
  //end
  const reset = async () => {
    const contents1 = '1.系统将会按照表单的信息重新计算接收人、抄送人、流程运转路径。';
    const contents2 = '2.在运行调整接收人的环节，调整的信息将会被删除。';
    const contents3 = '（注：只能重置未来的节点，当前节点无法重置）';
    Modal.confirm({
      title: '您确定要重置吗?',
      icon: createVNode(ExclamationCircleOutlined),
      content: createVNode('div', { style: 'color:red;font-size:13px;' }, [contents1, createVNode('br'), contents2, createVNode('br'), contents3]),
      async onOk() {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('WorkID', workID.value);
        handler.AddPara('NodeID', nodeID.value);
        handler.AddPara('FK_Flow', flowNo);
        const data = await handler.DoMethodReturnJson('TZWorkerRole_Reset');
        await InitPage();
        // message.success('重置成功');
        console.log(data);
      },
      onCancel() {},
      class: 'test',
    });
  };

  InitPage();
</script>
<style scoped lang="less">
  .tableFlex {
    display: flex;
    justify-content: space-around;
    .showTag {
      width: 100%;
      height: 100%;
      padding: 5px;
      border: 1px solid #cbcbcb;
    }
  }
  a {
    display: flex;
    align-items: center;
    i {
      font-size: 18px;
    }
  }
  :deep(.firstLine) {
    background-color: #fafafa;
    font-weight: 600;
  }
  .ant-tag {
    margin: 5px;
  }
  :deep(.ant-table-thead > tr .ant-table-cell) {
    font-weight: 600;
  }
  .resetControls {
    display: flex;
    justify-content: flex-end;
    & .btnStyle {
      margin: 10px 20px 0 0;
    }
  }
  .pop_intput_div {
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
  }
</style>
