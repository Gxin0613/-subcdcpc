<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <BasicTable @register="registerTable" :pagination="false" />
      </div>
    </Spin>
  </div>
</template>

<script lang="tsx" setup>
  import { Spin, Button } from 'ant-design-vue';
  import { BasicTable, useTable } from '/@/components/Table';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { useRoute } from 'vue-router';
  const props = defineProps({
    WorkID: {
      //请求参数集合
      type: Number,
      default: () => 0,
    },
    FlowNo: {
      type: String,
      default: '',
    },
    UserNo: {
      type: String,
      default: '',
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const route = useRoute();
  const loading = ref(false);
  const gwls = ref();
  const InitPage = async () => {
    try {
      loading.value = true;
      const ens = new BSEntities('BP.WF.GenerWorkFlows');
      await ens.Retrieve('Starter', props.UserNo, 'WFState', 2, 'FK_Flow', props.FlowNo);
      gwls.value = ens.getData();
      setTableData(gwls.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const [registerTable, { setTableData }] = useTable({
    title: '切换测试实例',
    columns: [
      {
        title: '流程ID',
        dataIndex: 'WorkID',
        key: 'WorkID',
      },
      {
        title: '标题',
        dataIndex: 'Title',
        key: 'Title',
        customRender: ({ text, record }) => {
          return (
            <Button type="link" onClick={GoToInstance.bind(this, record)}>
              {text}
            </Button>
          );
        },
      },
      {
        title: '停留节点',
        dataIndex: 'FK_Node',
        key: 'FK_Node',
        customRender: ({ text, record }) => {
          return text + '-' + record.NodeName;
        },
      },
      {
        title: '当前人员',
        dataIndex: 'TodoEmps',
        key: 'TodoEmps',
      },
      {
        title: '发起日期',
        dataIndex: 'RDT',
        key: 'RDT',
      },
      {
        title: '最后处理日期',
        dataIndex: 'SendDT',
        key: 'SendDT',
      },
    ],
    dataSource: gwls.value,
    showIndexColumn: true,
    showTableSetting: false,
    tableSetting: { fullScreen: false },
    scroll: { y: window.innerHeight - 20 },
  });
  /**
   * 跳转页面
   * @param record
   * @constructor
   */
  const emit = defineEmits(['changeFrameSrc']);
  const GoToInstance = (record) => {
    emit('changeFrameSrc', 'FlowInstance', record.WorkID);
    //window.location.replace('/#/WF/Designer/FlowInstance?FlowNo='+record.FK_Flow+'&WorkID='+record.WorkID);
  };
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
