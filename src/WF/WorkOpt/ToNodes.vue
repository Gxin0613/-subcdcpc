<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content toNodeCont">
        <div v-if="isShowMsg === false">
          <RadioGroup v-model:value="radioSelected" style="display: block">
            <Radio v-for="(node, index) in nodes" :key="node.NodeID" :value="node.NodeID" :name="node.Name" :style="radioStyle">
              <template v-if="node.DeliveryWay === 4 || node.DeliveryWay === 21 || node.DeliveryWay === 43 || node.DeliveryWay === 60">
                <span>{{ node.Name }}</span>
                <Button type="link" @click="SelectEmps(node, index, 0)">{{ '选择接收人' }}</Button>
              </template>
              <template v-else>
                {{ node.Name }}
              </template>
              <template v-for="emp in node.Emps" :key="emp.No">
                <Tag closable @close="RemoveEmp(index, node, emp, 0)">{{ emp.EmpName }}</Tag>
              </template>
              <div></div>
            </Radio>
          </RadioGroup>
          <template v-if="unSameSheets.length !== 0">
            <!-- 添加全选功能 -->
            <div style="margin: 12px 0; padding: 0 8px">
              <Checkbox :indeterminate="indeterminate" v-model:checked="checkAll" @change="onCheckAllChange"> 全选节点 </Checkbox>
            </div>

            <CheckboxGroup v-model:value="checkSelected">
              <Row style="display: block">
                <template v-for="(node, index) in unSameSheets" :key="node.NodeID">
                  <Col :span="24" style="margin-bottom: 8px; padding: 0 8px">
                    <Checkbox :value="node.NodeID" :name="node.Name" style="margin-right: 8px">
                      {{ node.Name }}
                    </Checkbox>
                    <template v-if="node.DeliveryWay === 4 || node.DeliveryWay === 21 || node.DeliveryWay === 43 || node.DeliveryWay === 60">
                      <Button type="link" size="small" @click="SelectEmps(node, index, 1)">{{ '选择接收人' }}</Button>
                    </template>
                    <template v-else>
                      {{ node.Name }}
                    </template>
                    <div style="margin-top: 4px">
                      <template v-for="emp in node.Emps" :key="emp.No">
                        <Tag closable @close="RemoveEmp(index, node, emp, 1)" style="margin-bottom: 4px">{{ emp.EmpName }}</Tag>
                      </template>
                    </div>
                  </Col>
                </template>
              </Row>
            </CheckboxGroup>
          </template>
          <div class="footer toNodeSend">
            <Button type="primary" @click="Send">{{ '发送' }}</Button>
          </div>
        </div>
        <div v-else>
          <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
          <div style="text-align: center">
            <Button type="primary" @click="handleCancel">{{ '关闭' }}</Button>
          </div>
        </div>
      </div>
    </Spin>
    <Modal v-model:open="modalVisible" :title="'选择接收人'" :footer="null" width="800">
      <div class="h-100" style="overflow-y: auto">
        <SelectEmp v-if="modalVisible === true && selectNode.DeliveryWay != 60" :params="query" @AddEmps="AddEmps" />
        <SelectEmpByDomain v-if="modalVisible === true && selectNode.DeliveryWay === 60" :params="query" @AddEmps="AddEmps" />
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'ToNodes',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, RadioGroup, Radio, CheckboxGroup, Checkbox, Tag, Button, Modal, Row, Col } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref, UnwrapRef, watch } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import BSEntities from '/@/utils/gener/BSEntities';
  import SelectEmp from './SelectEmp.vue';
  import SelectEmpByDomain from './SelectEmpByDomain.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import BSEntity from '/@/utils/gener/BSEntity';
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

  interface NodeItem {
    NodeID: number;
    Name: string;
    DeliveryWay: number;
    Emps: [];
  }
  const loading = ref(false);
  //该节点到下一个节点的集合
  const nodes = ref<UnwrapRef<NodeItem[]>>([]);
  const unSameSheets = ref<UnwrapRef<NodeItem[]>>([]);
  //节点 线性节点，同表单节点，异表单节点 单选
  const radioSelected = ref(true);
  //异表单节点，选择可以到达的子线程
  const checkSelected = ref<number[]>([]);
  // 全选状态
  const checkAll = ref(false);
  // 半选状态
  const indeterminate = ref(false);
  const radioStyle = reactive({
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  });
  const modalVisible = ref(false);
  //发送后消息显示定义
  const isShowMsg = ref(false);
  const msg = ref<string[]>([]);
  const query = ref();
  const currIdx = ref(0);
  const currType = ref(0);
  const selectNode = ref();

  // 监听checkSelected变化，更新全选状态
  watch(checkSelected, (newVal) => {
    const allNodeIds = unSameSheets.value.map((node) => node.NodeID);
    indeterminate.value = newVal.length > 0 && newVal.length < allNodeIds.length;
    checkAll.value = newVal.length === allNodeIds.length;
  });

  // 全选/取消全选处理函数
  const onCheckAllChange = (e: any) => {
    if (e.target.checked) {
      // 全选
      checkSelected.value = unSameSheets.value.map((node) => node.NodeID);
    } else {
      // 取消全选
      checkSelected.value = [];
    }
    indeterminate.value = false;
  };

  const InitPage = async () => {
    try {
      loading.value = true;
      query.value = props.params;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('ToNodes_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      if (result.Nodes.length == 0) {
        message.error('不可能出现的错误');
        return;
      }
      //初始化选择的节点
      const selectNodeID = result.SelectNode[0].NodeID;

      let i = -1;
      for (let idx = 0; idx < result.Nodes.length; idx++) {
        const node = result.Nodes[idx];
        if (node.NodeID === 0) {
          nodes.value.push({
            NodeID: 0,
            Name: '可以分发启动的异表单',
            DeliveryWay: 0,
            Emps: [],
          });
          i = idx;
          continue;
        }
        const emps = new BSEntities('BP.WF.Template.SelectAccpers');
        await emps.Retrieve('FK_Node', node.NodeID, 'WorkID', props.params.WorkID);
        node.Emps = emps.getData() || [];
        if (i == -1 || idx < i) {
          nodes.value.push(node);
          if (selectNodeID == node.NodeID) radioSelected.value = node.NodeID;
        } else {
          unSameSheets.value.push(node);
          if (selectNodeID == node.NodeID) {
            radioSelected.value = 0;
            checkSelected.value.push(node.NodeID);
          }
        }
      }

      result.Nodes.forEach((node, idx) => {
        if (node.NodeID == 0) {
          i = idx;
        } else {
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
  //选择接收人
  const SelectEmps = (node, idx, type) => {
    selectNode.value = node;
    currIdx.value = idx;
    currType.value = type;
    query.value.ToNode = node.NodeID;
    modalVisible.value = true;
  };
  /**
   * 增加接收人
   * @param selectEmps
   * @constructor
   */
  const AddEmps = async (selectEmps: string[]) => {
    modalVisible.value = false;
    if (selectEmps.length > 0) {
      if (typeof selectEmps !== 'string') {
        selectEmps.join(',');
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params); //参数ToNode, WorkID,FK_Node,FK_Flow
      handler.AddPara('ToNode', selectNode.value.NodeID);
      handler.AddPara('AddEmps', selectEmps); //要增加的人员，多个可以用逗号分开.
      const data = await handler.DoMethodReturnString('AccepterOfGener_AddEmps');

      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      if (data.indexOf('info@') == 0) {
        message.info(data.replace('info@', ''));
        return;
      }
      if (currType.value == 0) nodes!.value![currIdx.value]!.Emps = data;
      else unSameSheets!.value![currIdx.value]!.Emps = data;
    }
  };
  /**
   * 移除选择的人员
   * @param emp
   * @constructor
   */
  const RemoveEmp = async (index, node, emp, type) => {
    const selectAccper = new BSEntity('BP.WF.Template.SelectAccper');
    selectAccper.setPK(node.NodeID + '_' + props.params.WorkID + '_' + emp.FK_Emp);
    await selectAccper.Delete();
    if (type == 0) {
      const emps = nodes.value[index].Emps.filter((item) => item.FK_Emp != emp.FK_Emp);
      nodes.value[index].Emps = emps;
    } else {
      const emps = unSameSheets.value[index].Emps.filter((item) => item.FK_Emp != emp.FK_Emp);
      unSameSheets.value[index].Emps = emps;
    }
  };
  /**
   * 发送流程
   * @constructor
   */
  const Send = async () => {
    if (radioSelected.value == 0 && checkSelected.value.length == 0) {
      message.error('请选择到达的节点');
      return;
    }
    //判断选择的节点，人员是否已经选择
    if (radioSelected.value != 0) {
      const nds = nodes.value.filter((node) => node.NodeID === radioSelected.value);
      if ((nds[0].DeliveryWay === 4 || nds[0].DeliveryWay === 21 || nds[0].DeliveryWay == 43) && nds[0].Emps.length == 0) {
        message.error(nds[0].Name + '请选择接受人');
        return;
      }
    }
    if (checkSelected.value.length != 0) {
      const nds = unSameSheets.value.filter((node) => checkSelected.value.includes(node.NodeID));
      let msg = '';
      nds.forEach((nd) => {
        if ((nd.DeliveryWay === 4 || nd.DeliveryWay === 21 || nd.DeliveryWay == 43) && nd.Emps.length == 0) msg += nd.Name + '请选择接受人;';
      });
      if (msg != '') {
        message.error(msg);
        return;
      }
    }

    let toNode = radioSelected.value;
    if (toNode == 0) toNode = checkSelected.value.join(',');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddJson(props.params);
    handler.AddPara('ToNodes', toNode);
    const data = await handler.DoMethodReturnString('ToNodes_Send');
    if ('string' === typeof data && data.includes('err@') == true) {
      message.error(data.replace('err@', ''));
      return;
    }
    if ('string' === typeof data && data.includes('PageName') == true) {
      //父页面跳转 ToDo
      return;
    }
    //显示信息关闭页面
    isShowMsg.value = true;
    msg.value = splitAtString(data);
  };
  /**
   * 关闭页面
   */
  const emit = defineEmits(['handleCancel']);
  const handleCancel = () => {
    emit('handleCancel');
    // window.location.replace('/#/Middle/GenerList?EnName=GL_Todolist');
  };
</script>
<style scoped lang="less">
  .p-1 {
    :deep(.ant-spin-container) {
      padding: 15px;
    }
    .toNodeCont {
      padding: 25px;
      background: rgb(255, 255, 255);
      box-shadow: 0 0 5px 5px #dadada;
    }
    .toNodeSend {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
