<template>
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <div v-if="isShowMsg === false">
          <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="isMultiSelect == false">{{'全选'}}</Checkbox>
          <Divider />
          <div style="max-height: 400px; overflow-y: auto">
            <template v-if="isMultiSelect">
              <CheckboxGroup v-model:value="selected">
                <Checkbox v-for="emp in emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                  {{ emp.Name }}
                </Checkbox>
              </CheckboxGroup>
            </template>
            <template v-else>
              <RadioGroup v-model:value="selected">
                <Radio v-for="emp in emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                  {{ emp.Name }}
                </Radio>
              </RadioGroup>
            </template>
          </div>
          <div style="text-align: right; margin-top: 10px">
            <Button type="primary" @click="onSubmit">{{'发送'}}</Button>
          </div>
        </div>
        <div v-else class="messageStyle">
          <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
          <div style="text-align: center">
            <Button v-if="isHaveUnSend" type="primary" @click="UnSend" style="margin-right: 8px">{{'撤销本次发送'}}</Button>
            <Button type="primary" @click="handleCancel">{{'关闭'}}</Button>
          </div>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'AccepterByTeam',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Divider, Checkbox, CheckboxGroup, RadioGroup, Radio, Button } from 'ant-design-vue';
  // 父组件传过来的属性
  import { PropType, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Node } from '/@/WF/TSClass/Node';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  import { TeamEmps } from '/@/bp/port/TeamEmp';
  import { Emps } from '/@/bp/port/Emp';
  import { SelecterFree } from '/@/WF/Admin/AttrNode/AccepterRole/SelecterFree';
  interface Emp {
    No: string;
    Name: string;
  }
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    mainData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const emps = ref<Array<Emp>>([]);
  const selected = ref<string[]>([]);
  const isMultiSelect = ref(true); //true 多选
  const checkAll = ref(false);
  const indeterminate = ref(true);

  const query = ref<Record<string, any>>();

  //发送完显示的消息
  const isShowMsg = ref(false);
  const msg = ref<string[]>([]);
  const isHaveUnSend = ref(false);

  const isLoadEn = ref(false);
  const { afterSend } = userMyFlowSelfLoader(props.params);
  const nodeExt = new Node(props.params.FK_Node);
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      query.value = props.params;
      //获取项目组编号 PrjNo
      const prjNo = query.value.PrjNo;
      const teamEmps = new TeamEmps();
      await teamEmps.Retrieve('TeamNo', prjNo);
      let empNos = '';
      teamEmps.forEach((teamEmp) => {
        empNos += teamEmp.EmpNo + ',';
      });
      if (!!empNos) {
        empNos = empNos.substring(0, empNos.length - 1);
        empNos = "('" + empNos.replaceAll(',', "','") + "')";
        const empEns = new Emps();
        await empEns.RetrieveIn('No', empNos);
        emps.value = [];
        empEns.forEach((item) => {
          emps.value.push({
            No: item.No,
            Name: item.Name,
          });
        });
      }
      await nodeExt.RetrieveFromDBSources();
      const selecterFree = new SelecterFree();
      selecterFree.NodeID = nodeExt.NodeID;
      await selecterFree.RetrieveFromDBSources();
      isMultiSelect.value = parseInt(selecterFree.IsSimpleSelector || 0) === 0;
      isLoadEn.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  const onCheckAllChange = (e: any) => {
    emps.value.forEach((emp) => {
      selected.value.push(emp.No);
    });
    indeterminate.value = false;
  };
  //执行发送
  const onSubmit = async () => {
    try {
      loading.value = true;
      if (selected.value.length == 0) {
        message.error('请选择下一个节点的接收人');
        return;
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');

      handler.AddPara('SelectEmps', encodeURI(selected.value.join(',')));
      handler.AddJson(props.params);

      let data = await handler.DoMethodReturnString('Accepter_Send');
      if ('string' === typeof data && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return;
      }
      if ('string' === typeof data && data.includes('PageName') == true) {
        //父页面跳转 ToDo
        return;
      }
      if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).SendSuccess();
      await afterSend(props.mainData, nodeExt.NodeFrmID, props.params.FK_Flow, props.params.FK_Node, props.params.WorkID);

      //显示信息关闭页面
      isShowMsg.value = true;
      if (data.includes('@IsCanUnSend=1') == true) {
        isHaveUnSend.value = true;
        data = data.replace('@IsCanUnSend=1', '');
      }
      if (data.includes('@IsCanTask=1') == true) {
        data = data.replace('@IsCanTask=1', '');
      }
      msg.value = splitAtString(data);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  //撤销本次发送
  const UnSend = async () => {
    emit('UnSend');
  };
  const emit = defineEmits(['handleCancel', 'UnSend']);
  const handleCancel = () => {
    emit('handleCancel');
  };
</script>
<style lang="less" scoped>
  .ant-divider-horizontal {
    margin: 12px !important;
  }

  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
</style>
