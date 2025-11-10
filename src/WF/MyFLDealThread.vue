<template>
  <BaseComponent ref="baseComponent">
    <div style="background-color: rgb(240, 242, 245); height: 100%">
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          <FlowError :doc="errorObj.tips" />
        </div>
        <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
          <template v-if="ready">
            <component v-if="ready" :is="loadComponent(compSrcUrl)" :params="getAllRequestParams(compSrcUrl)" />
          </template>
          <template v-else>
            <!--工具栏-->
            <div class="header toolBar" :style="toolbarStyle">
              <ToolBar ref="tooBarRef" pageType="MyFlow" @ChangeLoading="ChangeLoading" :params="query" />
            </div>
            <!--表单内容-->
            <div class="content wrapper" :style="contentStyle">
              <Card :title="'退回当前节点的子线程'">
                <Table :columns="columns1" :data-source="tableData1" :pagination="false">
                  <template #bodyCell="{ column, _index, record }">
                    <template v-if="column.key === 'Oper'">
                      <Button type="link" @click="SendThread(record)"><i class="icon-paper-plane custom-icon-style"></i>{{ '发送' }}</Button>
                      <Button type="link" @click="DoDelThread(record)"><i class="icon-minus custom-icon-style"></i>{{ '终止' }}</Button>
                    </template>
                    <template v-else>{{ record[column.key] }}</template>
                  </template>
                </Table>
              </Card>
              <Card :title="'可以发起子线程的节点'" v-if="isSameThread == false && parseInt(node.ThreadIsCanAdd) === 1">
                <Table :columns="columns2" :data-source="tableData2" :pagination="false">
                  <template #bodyCell="{ column, _index, record }">
                    <template v-if="column.key === 'Oper'">
                      <Button type="link" @click="AddThread(record)"><PlusSquareOutlined />{{ '增加子线程' }}</Button>
                    </template>
                    <template v-else>{{ record[column.key] }}</template>
                  </template>
                </Table>
              </Card>
              <Card :title="'运行中的子线程'">
                <div v-for="(gwf, index) in tableData3">
                  <div style="display: inline; width: 50%; margin-right: 100px"
                    ><span style="color: green">#{{ index + 1 }}标题{{ gwf.Title }} </span></div
                  >
                  <div style="display: inline; width: 20%; margin-right: 100px">{{ gwf.TodoEmps }}</div>
                  <div style="display: inline; width: 20%">{{ gwf.RDT }}</div>
                  <template v-if="parseInt(node.ThreadIsCanDel) === 1">
                    <div
                      ><Button type="link" @click="DoDelThread(gwf)"><i class="icon-minus custom-icon-style"></i>{{ '终止' }}</Button></div
                    >
                  </template>
                  <div>
                    <Table :columns="columns3" :data-source="gwf.Children" :pagination="false">
                      <template #bodyCell="{ column, _index, record }">
                        <template v-if="column.key === 'IsPass'">
                          <template v-if="record[column.key] === 1">{{ '已完成' }}</template>
                          <template v-else>
                            <template v-if="record['IsRead'] === 0">{{ '未读' }}</template>
                            <template v-else>{{ '已读,未处理' }}</template>
                          </template>
                        </template>
                        <template v-if="column.key === 'RDT'">
                          <template v-if="record['IsPass'] === 1">{{ record[column.key] }}</template>
                          <template v-else>{{ '无' }}</template>
                        </template>
                        <template v-if="column.key === 'Oper'">
                          <Button type="link" @click="OpenFrm(record.WorkID, record.FID, record.FK_Flow, record.FK_Node)"><ProfileOutlined />{{ '表单' }}</Button>
                        </template>
                        <template v-else>{{ record[column.key] }}</template>
                      </template>
                    </Table>
                  </div>
                </div>
              </Card>
            </div>
          </template>
        </div>
      </Spin>
    </div>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { computed, inject, provide, reactive, ref, Ref, shallowRef } from 'vue';
  import { message, Spin, Table, Card, Modal, Button } from 'ant-design-vue';
  import { ProfileOutlined, PlusSquareOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import ToolBar from '/@/WF/ToolBar.vue';
  import FlowError from '/@/WF/FlowError.vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';

  const props = defineProps({
    params: {
      type: Object,
      default: () => null,
    },
  });
  //获取传的参数
  const route = useRoute();
  const flowInfo = inject('flowInfo') as Ref<Recordable>;
  const paramsOfpage = flowInfo?.value || props.params || route.query;
  //paramsOfpage.WorkID = paramsOfpage.FID;
  paramsOfpage.NodeID = paramsOfpage.FK_Node;
  const query = paramsOfpage;
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const ready = ref(false);
  const compSrcUrl = ref('');
  const { loadComponent } = useComponentLoader();
  // 为所有子组件提供流程信息
  //const flowInfo = ref({});
  provide('flowInfo', flowInfo);

  const toolbarStyle = computed(() => {
    return { height: '55px', position: 'fixed', zIndex: 100 };
  });
  const contentStyle = reactive({
    width: 'calc(100vw - 230px)',
  });
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  //退回当前节点的子线程
  const columns1 = [
    {
      title: '',
      key: 'SN',
      width: 50,
      align: 'center',
      customRender: ({ index }) => {
        return `${index + 1}`;
      },
    },
    {
      title: '退回节点',
      key: 'NDFromT',
      align: 'center',
    },
    {
      title: '退回人',
      key: 'EmpFromT',
      align: 'center',
    },
    {
      title: '日期',
      key: 'RDT',
      align: 'center',
    },
    {
      title: '退回原因',
      key: 'Msg',
      align: 'center',
    },
    {
      title: '操作',
      key: 'Oper',
      align: 'center',
    },
  ];
  const tableData1 = ref<Record<string, any>[]>([]);
  //可以发起子线程的节点
  const columns2 = [
    {
      title: '',
      key: 'SN',
      width: 50,
      align: 'center',
      customRender: ({ index }) => {
        return `${index + 1}`;
      },
    },
    {
      title: '节点编号',
      key: 'NodeID',
      align: 'center',
    },
    {
      title: '节点名称',
      key: 'Name',
      align: 'center',
    },
    {
      title: '操作',
      key: 'Oper',
      align: 'center',
    },
  ];
  const tableData2 = ref<Record<string, any>[]>([]);
  //运行中的子线程
  const columns3 = [
    {
      title: '节点',
      key: 'NodeName',
      align: 'center',
    },
    {
      title: '处理人',
      key: 'EmpName',
      align: 'center',
    },
    {
      title: '状态',
      key: 'IsPass',
      align: 'center',
    },
    {
      title: '应完成日期',
      key: 'SDT',
      align: 'center',
    },
    {
      title: '实际完成日期',
      key: 'RDT',
      align: 'center',
    },
    {
      title: '操作',
      key: 'Oper',
      align: 'center',
    },
  ];
  const tableData3 = ref<Record<string, any>[]>([]);
  /**
   * 子组件修改父组件的值
   * @param state
   * @param data
   * @constructor
   */
  function ChangeLoading(state, data) {
    if (data != null) {
      message.error(data.tips);
      loading.value = false;
    }
    if (state != null) loading.value = state;
  }

  /**
   * 发起子线程
   * @param record
   * @constructor
   */
  const SendThread = async (record) => {
    //发送之前保存小纸条的功能
    const gwf = new GenerWorkFlowExt();
    gwf.setPKVal(record.WorkID);
    const count = await gwf.RetrieveFromDBSources();
    if (count == 0) {
      message.error('该退回的子线程已经取消,不能再发送');
      return;
    }

    const ScripNodeID = gwf.GetParaString('ScripNodeID', '');
    let msg = gwf.GetParaString('ScripMsg', '');
    if (ScripNodeID != record.ReturnToNode) msg = '';
    msg = !msg ? '' : msg;
    const val = prompt('请输入要传达的信息,可以为空.', msg);
    if (val == '') return;
    if (val != null && val != '') {
      gwf.SetPara('ScripNodeID', record.NDTo);
      gwf.SetPara('ScripMsg', val);
      await gwf.Update();
    }
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddPara('WorkID', record.WorkID);
      handler.AddPara('FK_Node', record.NDTo);
      handler.AddPara('ToNodeID', record.NDFrom);
      const data = await handler.DoMethodReturnString('ThreadDtl_SendSubThread');
      if (typeof data === 'object') {
        handleCancel();
        return;
      }
      await InitPage();
    } catch (e) {
      message.error(e as string);
    }
  };
  /**
   * 终止子线程
   * @param record
   * @constructor
   */
  const DoDelThread = (record) => {
    Modal.confirm({
      title: '您确定要终止该子线程吗?',
      async onOk() {
        try {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
          handler.AddPara('WorkID', record.WorkID);
          handler.AddPara('FK_Node', query.FK_Node);
          const data = await handler.DoMethodReturnString('ThreadDtl_DelSubThread');
          if (typeof data === 'object' && data.hasOwnProperty('PageName')) {
            window.location.replace('/#/WF/MyView?WorkID=' + query.FID + '&FK_Node=' + query.FK_Node + '&FK_Flow=' + query.FK_Flow + '&FID=0');
            return;
          }
          await InitPage();
        } catch (e) {
          message.error(e as string);
        }
      },
      onCancel() {},
    });
  };
  /**
   * 增加子线程
   * @param record
   * @constructor
   */
  const AddThread = (record) => {};
  const tooBarRef = shallowRef<InstanceType<typeof ToolBar>>();
  /**
   * 关闭页面
   */
  const emit = defineEmits(['handleCancel']);
  const handleCancel = () => {
    tooBarRef.value.handleCancel();
  };
  const OpenFrm = (workID, fid, flowNo, nodeID) => {
    const url = '/src/WF/MyView.vue?FK_Flow=' + flowNo + '&WorkID=' + workID + '&FK_Node=' + nodeID + '&FID=' + fid;
    baseComponent.value?.openDrawerByUrl('打开表单', url);
  };
  const node = ref<Record<string, any>>({});
  const isSameThread = ref(true);
  const InitPage = async () => {
    try {
      loading.value = true;
      tableData1.value = [];
      tableData2.value = [];
      tableData3.value = [];
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('ThreadDtl_Init');
      if (typeof data === 'object' && data.hasOwnProperty('PageName')) {
        const pageName = data['PageName'] || '';
        delete data['DoMethod'];
        delete data['DoType'];
        delete data['HttpHandlerName'];
        delete data['PageName'];
        compSrcUrl.value = `/src/WF/${pageName || 'MyFlowGener'}.vue?${GetParamsUrl(data)}`;
        flowInfo.value = getAllRequestParams(compSrcUrl.value);
        ready.value = true;
        return;
      }
      //当前节点的信息
      node.value = data['WF_Node'][0];
      tableData2.value = data['WF_ThreadNode'];
      if (tableData2.value.length > 1) isSameThread.value = false;
      tableData1.value = data['WF_ReturnWork'];

      //子线程的流程实例信息
      const gwfs = data['WF_GenerWorkFlow'];
      //工作人员列表信息
      const gwls = data['WF_GenerWorkerlist'];
      gwfs.forEach((gwf) => {
        if (gwf.WFState != 5) {
          gwf.Children = [];
          gwf.Children = gwls.filter((gwl) => gwl.WorkID === gwf.WorkID && gwl.IsPass != -2);
          gwf.type = 0;
          tableData3.value.push(gwf);
        }
      });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    // position: fixed;
    width: 100%;
    //height: 50px;
    // z-index: 1000;
  }

  .wrapper {
    margin: 0 auto;
    padding: 65px 24px 100px;
    height: 100%;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    width: 1030px !important;
    border-radius: 5px;
  }
</style>
