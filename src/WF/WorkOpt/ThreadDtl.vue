<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" :style="contentStyle">
        <!-- 需要在 <script setup> 中添加： import { FolderOpenOutlined } from '@ant-design/icons-vue' -->
        <template v-if="Array.isArray(threads) && threads.length == 0">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: #6b7280">
            <div
              style="
                width: 120px;
                height: 120px;
                border-radius: 16px;
                background: linear-gradient(135deg, #f3f4f6, #ffffff);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
                margin-bottom: 16px;
              "
            >
              <FolderOpenOutlined style="font-size: 56px; color: #9ca3af" />
            </div>

            <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 6px">当前暂时没有子线程</div>

            <div style="display: flex; gap: 12px">
              <Button type="default" disabled> 暂无可用操作 </Button>
            </div>
          </div>
        </template>
        <tempalte v-else>
          <Button v-if="props.params.FID == 0 && nodeExt?.GetParaBoolean('ThreadIsCanAddOfHL')" type="primary" @click="AddThread">{{ '增加子线程' }}</Button>
          <template v-for="thread in threads" :key="thread.WorkID">
            <Card :title="thread.Title">
              <template #extra style="width: 50%">
                <div style="float: left">{{ thread.TodoEmps }}</div>
                <div style="float: right">{{ thread.RDT }}</div>
              </template>
              <Table :columns="columns" :data-source="thread.Data" bordered size="small" :rowKey="(record, index) => index" :pagination="false" />
            </Card>
          </template>
        </tempalte>
      </div>
    </Spin>
  </div>
  <!--居中弹窗-->
  <Modal
    v-model:open="modal.modalVisible"
    centered
    :closable="modal.closable"
    :title="modal.modalTitle"
    :width="modal.modalWidth"
    :body-style="modal.modalHeight"
    :footer="null"
    destroy-on-close
    @cancel="modalClose"
  >
    <BaseModal :modalType="modal.modalType" :params="modal.params" @handleCancel="handleCancel" :key="new Date().getTime()" class="sendBack" />
  </Modal>
</template>

<script lang="tsx">
  export default {
    name: 'ThreadDtl',
  };
</script>
<script lang="tsx" setup>
  import { Spin, message, Card, Table, Button, Modal, Space } from 'ant-design-vue';
  import { FolderOpenOutlined } from '@ant-design/icons-vue';
  import BaseModal from '/@/WF/WorkOpt/BaseModal.vue';
  // 父组件传过来的属性
  import { h, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { Node } from '/@/WF/TSClass/Node';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { windowOpen } from '/@/utils/windowOpen';
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
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
    params: {},
  });

  interface ThreadItem {
    WorkID: number;
    Title: string;
    TodoEmps: string;
    RDT: string;
    Data: Record<string, any>[];
  }
  const loading = ref(false);
  const columns = [
    {
      title: '节点',
      dataIndex: 'NodeName',
      key: 'NodeName',
    },
    {
      title: '处理人',
      dataIndex: 'FK_Emp',
      key: 'FK_Emp',
      width: 200,
      customRender: ({ record }) => {
        return record.FK_Emp + ' ' + record.EmpName;
      },
    },
    {
      title: '状态',
      dataIndex: 'Sate',
      key: 'Sate',
      customRender: ({ record }) => {
        if (record.IsPass === 1) return '已完成';
        if (record.IsRead === 0) return '未读';
        if (record.IsRead === 1) return '已读,未处理';
      },
    },
    {
      title: '应完成日期',
      dataIndex: 'SDT',
      key: 'SDT',
    },
    {
      title: '实际完成日期',
      dataIndex: 'RDT',
      key: 'RDT',
      customRender: ({ record }) => {
        if (record.IsPass === 0) return '无';
        return record.RDT;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      customRender: ({ record, index }) => {
        const methodArr: any[] = [];
        methodArr.push(
          h(
            Button,
            {
              type: 'link',
              onClick: () => OpenFrm(record),
            },
            '查看表单',
          ),
        );
        if (record.IsPass === 1)
          methodArr.push(
            h(
              Button,
              {
                type: 'link',
                onClick: () => ReturnThread(record),
              },
              '退回',
            ),
          );
        if (nodeExt.value.ThreadKillRole == 1)
          methodArr.push(
            h(
              Button,
              {
                type: 'link',
                onClick: () => DeleteThread(record, index),
              },
              '终止',
            ),
          );
        return h(Space, methodArr);
      },
    },
  ];
  const threads = ref<ThreadItem[]>([]);
  const height = window.innerHeight * 0.6 - 68;
  const contentStyle = reactive({
    overflowY: 'auto',
    height: height + 'px',
  });
  const nodeExt = ref<Node>();
  const InitPage = async () => {
    try {
      loading.value = true;
      nodeExt.value = new Node(props.params.FK_Node);
      await nodeExt.value.RetrieveFromDBSources();
      //获取发起的子线程数据
      const ens = new BSEntities('BP.WF.GenerWorkFlows');
      await ens.Retrieve('FID', props.params.WorkID);
      const gwfs = ens.getData();
      //获取系子线程上的处理人
      const bsens = new BSEntities('BP.WF.GenerWorkerLists');
      await bsens.Retrieve('FID', props.params.WorkID);
      const gwls = bsens.getData();
      threads.value = [];
      gwfs.forEach((gwf) => {
        threads.value.push({
          WorkID: gwf.WorKID,
          Title: gwf.Title,
          TodoEmps: gwf.TodoEmps,
          RDT: gwf.RDT,
          Data: GetGwlsData(gwls, gwf.WorkID),
        });
      });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  /**
   * 获取指定子线程的处理人
   * @param gwls
   * @param workID
   * @constructor
   */
  const GetGwlsData = (gwls, workID) => {
    const data = ref<Record<string, any>[]>([]);
    gwls
      .filter((gwl) => gwl.WorkID == workID && gwl.IsPass != -2)
      .forEach((gwl) => {
        data.value.push(gwl);
      });
    return data.value;
  };
  /**
   * 打开子线程的表单
   * @param record
   * @constructor
   */
  const OpenFrm = (record) => {
    const url = '/#/WF/MyView?FK_Flow=' + record.FK_Flow + '&WorkID=' + record.WorkID + '&FK_Node=' + record.FK_Node + '&FID=' + record.FID;
    windowOpen(url, '');
    return;
  };
  /**
   * 退回子线程
   * @param record
   * @constructor
   */
  const ReturnThread = (record) => {
    modalShow('ReturnWork', '退回', window.innerWidth * 0.5, 400);
    modal.params = {
      WorkID: record.WorkID,
      FID: record.FID,
      FlowNo: record.FK_Flow,
      NodeID: record.FK_Node,
      NodeName: record.NodeName,
      Rec: record.FK_Emp,
      RecName: record.EmpName,
      RDT: record.RDT,
      FromPage: 'ThreadDtl',
    };
  };
  /**
   * 删除指定的子流程
   * @param record
   * @param idx
   * @constructor
   */
  const DeleteThread = async (record, idx) => {
    if (confirm('您确定要终止该子线程吗？') == false) return;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('FK_Flow', props.params.FK_Flow);
    handler.AddPara('WorkID', record.WorkID);
    handler.AddPara('FNodeID', props.params.FK_Node);

    const data = await handler.DoMethodReturnString('ThreadDtl_DelSubThread');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    //移除数据
    threads.value.splice(idx, 1);
  };
  const AddThread = async () => {
    if (nodeExt.value.RunModel == 2 || nodeExt.value.RunModel == 1) {
      let msg = '说明：';
      msg += '\t\n 1. 新增加的人员，从分流节点的下一个节点开始执行.';
      msg += '\t\n 2. 输入人员账号，点击确定后，系统就会自动为该人员分配一个任务.';
      let empNo = window.prompt(msg + ' 请输入要增加的人员账号，多个人员用逗号分开(比如:zhangsan,lisi):');
      if (empNo == null || empNo == '') return;
      const en = new BSEntity('BP.WF.GenerWorkFlow', props.params.WorkID);
      await en.Init();
      const data = await en.DoMethodReturnString('DoSubFlowAddEmps', empNo, '0');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      if (typeof data !== 'undefined') {
        message.success('添加成功');
        await InitPage();
      }
      return;
    }
  };
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };
  const modalClose = async () => {
    modal.modalVisible = false;
    await InitPage();
  };
  const handleCancel = async (isOnlyClose) => {
    modal.modalVisible = false;
    if (isOnlyClose === true) return;
    await InitPage();
  };
</script>
<style lang="less" scoped>
  .content {
    :deep(.ant-card-extra) {
      width: 50%;
    }
  }
</style>
