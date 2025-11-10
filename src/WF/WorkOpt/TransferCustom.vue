<template>
  <!-- 流转自定义 -->
  <div class="content">
    <Table :columns="columnsHead" :data-source="dataHead" bordered :pagination="false" size="middle" :row-class-name="(_record, index) => (index === 0 ? 'firstLine' : '')">
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'Action'">
          <span>{{ '无' }}</span>
        </template>
      </template>
    </Table>
    <Table
      :columns="columnsBody"
      :data-source="dataBody"
      bordered
      :show-header="false"
      :pagination="false"
      size="middle"
      :row-class-name="(_record, index) => (index === 0 ? 'firstLine' : '')"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'Action'">
          <!-- 判断是否可编辑 -->
          <div v-if="isEdit" class="tableFlex">
            <a @click="DoUp(record.MyPK)"><i class="icon-arrow-up-circle"></i></a>
            <a @click="DoDown(record.MyPK)"><i class="icon-arrow-down-circle"></i></a>
            <a @click="DoRemove(record.MyPK)"><i class="icon-close"></i></a>
          </div>
          <div v-else class="tableFlex">
            <i class="icon-arrow-up-circle"></i>
            <i class="icon-arrow-down-circle"></i>
            <i class="icon-close"></i>
          </div>
        </template>
        <template v-if="column.dataIndex === 'EmpName'">
          <div class="tableFlex">
            <div class="showTag">
              <InputGroup v-if="isEdit" compact :disabled="true" style="position: relative" @click="PopModalShow(record.MyPK)">
                <div class="pop_intput_div" style="padding-left: 5px">
                  <template v-for="(ele, idx) in record.WorkerName.split(',').filter((item) => item != '')" :key="ele">
                    <Tag :closable="true" @close="DeleteDB(record, ele, idx)" color="#0960bd"> {{ ele }} </Tag>
                  </template>
                </div>
              </InputGroup>
              <InputGroup v-else compact :disabled="true" style="position: relative">
                <div class="pop_intput_div" style="padding-left: 5px">
                  <template v-for="(ele, idx) in record.WorkerName.split(',').filter((item) => item != '')" :key="ele">
                    <Tag color="#aeaeae">
                      {{ ele }}
                    </Tag>
                  </template>
                </div>
              </InputGroup>
            </div>
          </div>
        </template>
      </template>
    </Table>
    <Table
      :columns="columnsFoot"
      :data-source="dataFoot"
      bordered
      :show-header="false"
      :pagination="false"
      size="middle"
      :row-class-name="(_record, index) => (index === 0 ? 'firstLine' : '')"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'Action'">
          <div v-if="isEdit" class="tableFlex">
            <a @click="DoAdd(record.MyPK)">{{ '增加' }}</a>
          </div>
          <div v-else class="tableFlex">{{ '增加' }}</div>
        </template>
        <template v-if="column.dataIndex === 'EmpName'">
          <div class="tableFlex">
            <div style="width: 100%; height: 100%">
              <template v-for="(ele, idx) in record.WorkerName.split(',').filter((item) => item != '')" :key="ele">
                <Tag v-if="isEdit" color="#0960bd">
                  {{ ele }}
                </Tag>
                <Tag v-else color="#aeaeae">
                  {{ ele }}
                </Tag>
              </template>
            </div>
          </div>
        </template>
      </template>
    </Table>
    <Modal v-model:open="popModal.visible" :title="'流转自定义'" @ok="handleEnsure" width="980px">
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
  import { Table, Modal, InputGroup, Tag, message } from 'ant-design-vue';
  import type { TableColumnType } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref, shallowRef } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import BSEntities from '/@/utils/gener/BSEntities';
  // import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import PopTreeEns from '/@/WF/Comm/subComponents/PopTreeEns.vue';
  import { GloWF } from '../Admin/GloWF';
  import { AtPara } from '/@/bp/da/AtPara';
  import { BtnLab } from '../Admin/AttrNode/BtnLab';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const workID = props.params.WorkID;
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
      title: '步骤',
      dataIndex: 'FK_Node',
      customCell: (_, index: any) => ({
        colSpan: index > 0 ? 1 : 4,
      }),
      width: 100,
    },
    {
      title: '节点',
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
      title: '操作',
      dataIndex: 'Action',
      customCell: sharedOnCell,
      width: 250,
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
    {
      dataIndex: 'Action',
      customCell: sharedOnCell,
      width: 250,
    },
  ];
  const columnsFoot: TableColumnType[] = [
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
    {
      dataIndex: 'Action',
      customCell: sharedOnCell,
      width: 250,
    },
  ];
  //已运行节点
  const dataHead: any = ref([
    {
      FK_Node: '已运行的节点',
      NodeName: '',
      EmpName: '',
    },
  ]);
  //要排列的节点
  const dataBody: any = ref([
    {
      FK_Node: '可以动态组合的节点',
      NodeName: '',
      EmpName: '',
      MyPK: '',
      WorkerName: '',
      Worker: '',
    },
  ]);
  //删除人员列表
  const dataFoot: any = ref([
    {
      FK_Node: '可选节点',
      NodeName: '',
      EmpName: '',
      MyPK: '',
      WorkerName: '',
      Worker: '',
    },
  ]);

  const tcs: any = ref([]); //选择的接受人.
  const gwls: any = ref([]); //选择的接受人.
  const isEdit = ref(true); //是否可编辑.
  const InitPage = async () => {
    console.log(props.params);
    try {
      const btnLab = new BtnLab(props.params.NodeID);
      await btnLab.RetrieveFromDBSources();
      if (btnLab.TCEnable === 1) {
        isEdit.value = false;
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      await handler.AddUrlData();
      let data = await handler.DoMethodReturnJson('TransferCustom_Init');
      tcs.value = data['WF_TransferCustoms'];
      gwls.value = data['WF_GenerWorkerlist'];
      console.log(data);

      //已运行节点
      dataHead.value = [
        {
          FK_Node: '已运行的节点',
          NodeName: '',
          EmpName: '',
        },
      ];
      for (let i = 0; i < gwls.value.length; i++) {
        const gwl = gwls.value[i];
        dataHead.value.push({
          FK_Node: gwl.FK_Node,
          NodeName: gwl.NodeName,
          EmpName: gwl.EmpName,
        });
      }
      dataBody.value = [
        {
          FK_Node: '可以动态组合的节点',
          NodeName: '',
          EmpName: '',
          MyPK: '',
          WorkerName: '',
          Worker: '',
        },
      ];
      dataFoot.value = [
        {
          FK_Node: '可选节点',
          NodeName: '',
          EmpName: '',
          MyPK: '',
          WorkerName: '',
          Worker: '',
        },
      ];
      for (let j = 0; j < tcs.value.length; j++) {
        const tc = tcs.value[j];
        if (tc.IsEnable !== 0) {
          dataBody.value.push({
            FK_Node: tc.FK_Node,
            NodeName: tc.NodeName,
            MyPK: tc.MyPK,
            EmpName: '',
            WorkerName: tc.WorkerName,
            Worker: tc.Worker,
          });
        } else if (tc.IsEnable !== 1) {
          dataFoot.value.push({
            FK_Node: tc.FK_Node,
            NodeName: tc.NodeName,
            MyPK: tc.MyPK,
            EmpName: '',
            WorkerName: tc.WorkerName,
            Worker: tc.Worker,
          });
        } else {
          return false;
        }
      }
    } catch (e: any) {
      message.error(e);
    }
  };
  InitPage();
  const DoUp = async (MyPk) => {
    console.log(MyPk);
    const en = new BSEntity('BP.WF.TransferCustom', MyPk);
    await en.Init();
    await en.DoMethodReturnString('DoUp');
    await InitPage();
  };
  const DoDown = async (MyPk) => {
    console.log(MyPk);
    const en = new BSEntity('BP.WF.TransferCustom', MyPk);
    await en.Init();
    await en.DoMethodReturnString('DoDown');
    await InitPage();
  };
  const DoRemove = async (MyPk) => {
    console.log(MyPk);
    const ens = new BSEntities('BP.WF.TransferCustoms');
    await ens.Init();
    await ens.Retrieve('WorkID', workID, 'IsEnable', 1);
    const data = ens.getData();
    if (data.length == 1) {
      alert('流转自定义必须选择一个游离态节点，当前只有一个游离态节点不能移除');
      return;
    }
    const en = new BSEntity('BP.WF.TransferCustom', MyPk);
    await en.Init();
    en.IsEnable = 0;
    await en.Update();
    await InitPage();
  };
  const DoAdd = async (MyPk) => {
    const en = new BSEntity('BP.WF.TransferCustom', MyPk);
    await en.Init();
    en.IsEnable = 1;
    await en.Update();
    await InitPage();
  };
  //弹窗显示
  const popModal = reactive({
    visible: false,
  });
  const rowData = ref();
  const PopModalShow = (MyPk) => {
    popModal.visible = true;
    rowData.value = MyPk;
    console.log(rowData.value.Worker);
  };
  // 弹窗ok事件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  const handleEnsure = async (e: MouseEvent) => {
    popModal.visible = false;
    checkedList.value = treeEns.value?.allCheckList || [];
    checkedNames.value = treeEns.value?.checkedNames || [];
    const en = new BSEntity('BP.WF.TransferCustom', rowData.value);
    await en.Init();
    en.setVal('Worker', checkedList.value.join(','));
    en.setVal('WorkerName', checkedNames.value.join(','));
    await en.Update();
    await InitPage();
  };
  const DeleteDB = async (data, ele, idx) => {
    console.log(data, ele, idx);
    const en = new BSEntity('BP.WF.TransferCustom', data.MyPK);
    await en.Init();
    const oldWorker = en.getVal('Worker') + ',';
    const selectedWorker = oldWorker.split(',')[idx];
    const oldWorkerName = en.getVal('WorkerName') + ',';
    const selectedWorkerName = oldWorkerName.split(',')[idx];
    en.setVal('Worker', oldWorker.replace(selectedWorker + ',', ''));
    en.setVal('WorkerName', oldWorkerName.replace(selectedWorkerName + ',', ''));
    await en.Update();
    await InitPage();
  };
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
</style>
