<template>
  <ThemeWrapper>
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }} </div>
      <div v-else>
        <BasicTable @register="registerTable">
          <template #toolbar>
            <div class="toolbar">
              <div class="rigntBtns">
                <Button type="primary" @click="getAll">{{ '全部' }}</Button>
                <Button type="primary" @click="getMyManager">{{ '我负责的' }}</Button>
                <Button type="primary" @click="getMyJoin">{{ '我参与的' }}</Button>
              </div>
              <Button type="primary" @click="openModal">{{ '新建任务' }}</Button>
            </div>
          </template>
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex == 'TaskPRIText'">
              <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">
                <div :style="getTaskPRITextStyle(record.TaskPRIText)">
                  <div style="color: white">
                    {{ record.TaskPRIText }}
                  </div>
                </div>
              </div>
            </template>
          </template>
        </BasicTable>
      </div>
      <Modal
        :open="modalObj.visiable"
        :title="'新建任务'"
        width="800px"
        :bodyStyle="modalObj.bodyStyle"
        @ok="handleOk"
        @cancel="
          () => {
            modalObj.visiable = false;
          }
        "
      >
        <AddTask ref="AddTaskRef" />
      </Modal>
    </Spin>
  </ThemeWrapper>
</template>
<script lang="ts" setup>
  import { Spin, message, Button, Modal } from 'ant-design-vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { ref } from 'vue';
  import { BasicColumn, BasicTable, useTable } from '/@/components/Table';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { reactive } from 'vue';
  import WebUser from '/@/bp/web/WebUser';
  import AddTask from './components/AddTask.vue';
  import { shallowRef } from 'vue';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const column = [
    {
      title: '-',
      dataIndex: 'TaskPRIText',
      key: 'TaskPRIText',
      width: '40%',
    },
    {
      title: '任务名称',
      dataIndex: 'Title',
      key: 'Title',
      width: '40%',
    },
    {
      title: '开始时间',
      dataIndex: 'DTFrom',
      key: 'DTFrom',
      width: '40%',
    },
    {
      title: '结束时间',
      dataIndex: 'DTTo',
      key: 'DTTo',
      width: '40%',
    },
    {
      title: '负责人',
      dataIndex: 'ManagerEmpName',
      key: 'ManagerEmpName',
      width: '40%',
    },
    {
      title: '参与人',
      dataIndex: 'RefEmpsName',
      key: 'RefEmpsName',
      width: '40%',
    },
  ];
  const modalObj = reactive({
    visiable: false,
    bodyStyle: {
      width: '800px',
      height: '600px',
    },
  });
  const AddTaskRef = shallowRef<InstanceType<typeof AddTask>>();
  const data = ref<any>([]);
  const tasks = ref<any>([]);
  const loading = ref(false);
  const InitPage = async () => {
    try {
      loading.value = true;
      console.log(props.params);
      //WebUser.No;
      const ens = new BSEntities('BP.CCOA.Tasks');
      data.value = await ens.DoMethodReturnJSON('Task_AllTasks');
      tasks.value = data.value;
      console.log('本模块：', data);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      message.error('获取数据失败');
      console.error(e);
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
  };
  //全部
  const getAll = () => {
    tasks.value = data.value;
  };
  //我负责的 ManagerEmpNo === WebUser.No 的任务
  const getMyManager = () => {
    tasks.value = data.value.filter((item) => item.ManagerEmpNo === WebUser.No);
  };
  //我参与的 RefEmpsNo 包含WebUser.No 的任务
  const getMyJoin = () => {
    tasks.value = data.value.filter((item) => item.RefEmpsNo.indexOf(WebUser.No) > -1);
  };
  //渲染表单
  const [registerTable] = useTable({
    rowKey: (row) => row.MyPK,
    title: '',
    columns: column as BasicColumn[],
    dataSource: tasks,
    showIndexColumn: true,
    bordered: true,
    pagination: false,
    canResize: false,
    showHeader: true,
    scroll: { y: 450 },
    rowSelection: {
      type: 'checkbox',
    },
  });
  //打开新建任务弹窗
  const openModal = () => {
    modalObj.visiable = true;
  };
  //弹窗确认
  const handleOk = () => {
    modalObj.visiable = false;
  };
  //优先级样式
  const getTaskPRITextStyle = (text) => {
    if (text == '高') {
      return reactive({
        height: '30px',
        width: '30px',
        background: '#1E9FFF',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
      });
    } else if (text == '中') {
      return reactive({
        height: '30px',
        width: '30px',
        background: '#ff6a00',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
      });
    } else if (text == '低') {
      return reactive({
        height: '30px',
        width: '30px',
        background: '#009688',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
      });
    }
  };
  InitPage();
</script>
<style lang="less" scoped>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    Button {
      height: 30px;
    }
    .rigntBtns {
      Button {
        margin-right: 10px !important;
        height: 30px;
      }
    }
  }
</style>
