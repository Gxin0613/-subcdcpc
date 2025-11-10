<template>
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <template v-if="pageName !== ''">
          <EnOnly
            v-if="isLoadEn === true"
            :params="query"
            :isMultiSelect="isMultiSelect"
            :isSend="isSend"
            @handleCancel="handleCancel"
            @UnSend="UnSend"
            :WGFlow="WGFlow"
            :mainData="mainData"
          />
          <!--          <AccepterOfGener v-if="pageName==='AccepterOfDeptStationEmp'"></AccepterOfGener>-->
        </template>
        <template v-else>
          <div v-if="isShowMsg === false">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="isMultiSelect == false">{{ '全选' }}</Checkbox>
            <Divider />
            <div style="max-height: 400px; overflow-y: auto">
              <div v-for="dept in depts" :key="dept.No">
                <Collapse v-model:activeKey="activeKey" ghost>
                  <CollapsePanel :key="dept.No" :header="dept.Name">
                    <p>
                      <template v-if="isMultiSelect">
                        <CheckboxGroup v-model:value="dept.Selected">
                          <Checkbox v-for="emp in dept.Emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                            {{ emp.Name }}
                          </Checkbox>
                        </CheckboxGroup>
                      </template>
                      <template v-else>
                        <RadioGroup v-model:value="selected">
                          <Radio v-for="emp in dept.Emps" :key="emp.No" :value="emp.No" :name="emp.Name">
                            {{ emp.Name }}
                          </Radio>
                        </RadioGroup>
                      </template>
                    </p>
                  </CollapsePanel>
                </Collapse>
              </div>
            </div>
            <div style="text-align: right; margin-top: 10px">
              <Button type="primary" @click="onSubmit">{{ '发送' }}</Button>
            </div>
          </div>
          <div v-else class="messageStyle">
            <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
            <div style="text-align: center">
              <Button v-if="isHaveUnSend" type="primary" @click="UnSend" style="margin-right: 8px">{{ '撤销本次发送' }}</Button>
              <Button type="primary" @click="handleCancel">{{ '关闭' }}</Button>
            </div>
          </div>
        </template>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'Accepter',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Divider, Checkbox, CheckboxGroup, RadioGroup, Radio, Button, Collapse, CollapsePanel } from 'ant-design-vue';
  // 父组件传过来的属性
  import { PropType, reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import EnOnly from '/@/CCMobile/Comm/EnOnly.vue';
  import { Node } from '/@/WF/TSClass/Node';
  import WebUser from '/@/bp/web/WebUser';
  import { Send } from '/@/WF/WorkOpt/SendAndCC/Send';
  import { SendAndCC } from '/@/WF/WorkOpt/SendAndCC/SendAndCC';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';
  interface Emp {
    No: string;
    Name: string;
    FK_Dept: string;
  }
  interface Dept {
    No: string;
    Name: string;
    Selected: Array<string>;
    Emps: Array<Emp>;
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
  const pageName = ref('');
  const depts = ref<Array<Dept>>([]);
  const emps = ref<Array<Emp>>([]);
  const selected = ref<string[]>([]);
  const isMultiSelect = ref(true); //true 多选
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const isSend = ref(false);
  const enName = ref('');
  const activeKey = ref<any>([]);

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
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('Accepter_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      pageName.value = result.PageName || '';
      isSend.value = !!result.IsSend;
      //返回JSON数据时直接解析内容
      if (pageName.value == '') {
        emps.value = result.Emps || [];
        if (emps.value.length == 0) {
          loading.value = false;
          message.error('当前节点设置的接收人范围为空,请联系管理员配置接收人范围');
          return;
        }
        depts.value = result.Depts;
        isMultiSelect.value = result.Selector[0]?.IsSimpleSelector || 0 ? true : false;
        const data = result.Selected || [];
        data.forEach((item) => {
          selected.value.push(item.No);
        });
        depts.value.forEach((dept) => {
          dept.Emps = result.Emps.filter((emp) => emp.FK_Dept == dept.No);
          activeKey.value.push(dept.No);
          if (data.length == 0) dept.Selected = [];
          else dept.Emps.filter((emp) => data.find((t) => t.No == emp.No)).forEach((item) => dept.Selected.push(item.No));
        });
      }
      if (pageName.value == 'AccepterOfGener') {
        //如果是通用选择器，判断使用的类
        await nodeExt.RetrieveFromDBSources();
        query.value.PKVal = WebUser.No + '_' + props.params.FK_Node + '_' + props.params.WorkID;
        const en = ref();
        //审核状态是启用.

        if (nodeExt.CCRole == 1 || nodeExt.CCRole == 3) {
          enName.value = 'TS.WorkOpt.SendAndCC';
          en.value = new SendAndCC(props.params.PKVal);
        } else {
          enName.value = 'TS.WorkOpt.Send';
          en.value = new Send(props.params.PKVal);
        }

        query.value.EnName = enName.value;
        if ((await en.value.RetrieveFromDBSources()) == 0) {
          en.value.WorkID = props.params.WorkID;
          en.value.NodeID = props.params.FK_Node;
          en.value.ToNodeID = props.params.ToNode || 0;
          en.value.EmpNo = WebUser.No;
          en.value.EmpName = WebUser.Name;
          await en.value.Insert();

          //处理发送,自动装载人员.
          if (nodeExt.IsAutoLoadEmps === 1) {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
            handler.AddPara('WorkID', en.value.WorkID);
            handler.AddPara('NodeID', en.value.NodeID);
            handler.AddPara('ToNodeID', en.value.ToNodeID);
            handler.AddPara('MyPK', en.value.MyPK);
            const data = await handler.DoMethodReturnString('SendWorkOpt_Init');
            if (typeof data === 'string' && data.includes('err@')) {
              message.error(data.replace('@', ''));
            }
          }
        }
        isLoadEn.value = true;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  const onCheckAllChange = (e: any) => {
    depts.value.forEach((dept) => {
      dept.Selected = [];
      if (e.target.checked == true) {
        dept.Emps.forEach((emp) => {
          dept.Selected.push(emp.No);
        });
      }
    });
    indeterminate.value = false;
  };
  //执行发送
  const onSubmit = async () => {
    try {
      loading.value = true;
      if (isMultiSelect.value == true) {
        selected.value = [];
        depts.value.forEach((dept) => {
          if (dept.Selected) selected.value = [...selected.value, ...dept.Selected];
        });
      }
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
        //移除该操作
        //const str = data.split('撤销本次发送');
        //data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
      }
      if (data.includes('@IsCanTask=1') == true) {
        data = data.replace('@IsCanTask=1', '');
        //移除该操作
        //const str = data.split('指定特定的处理人处理');
        //data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
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
