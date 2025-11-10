<template>
  <div class="p-1"> </div>
</template>

<script lang="ts">
  export default {
    name: 'ChangeDept',
  };
</script>
<script lang="ts" setup>
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Send } from '/@/WF/WorkOpt/SendAndCC/Send';
  import { SendAndCC } from '/@/WF/WorkOpt/SendAndCC/SendAndCC';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { message } from 'ant-design-vue';
  dayjs.extend(duration);
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

        isMultiSelect.value = parseInt(result.Selector[0]?.IsSimpleSelector || 0) === 0 ? true : false;
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
        const nodeExt = new Node(props.params.FK_Node);
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
        //修改耗时时间
        const gwf = new GenerWorkFlowExt();
        gwf.WorkID = props.params.WorkID;
        await gwf.RetrieveFromDBSources();
        const useTimeFlow = dayjs(new Date()).diff(gwf.RDT, 'second') || 0;
        const useTimeNode = dayjs(new Date()).diff(gwf.SendDT, 'second') || 0;
        en.value.UseTimeFlow = (useTimeFlow > 0 ? '' : '-') + dayjs.duration(useTimeFlow).format('DD天 HH时mm分ss秒');
        en.value.UseTimeNode = (useTimeNode > 0 ? '' : '-') + dayjs.duration(useTimeNode).format('DD天 HH时mm分ss秒');
        en.value.Title = gwf.Title;
        en.value.StarterName = gwf.StarterName;
        en.value.StartRDT = gwf.StartRDT;
        en.value.NodeName = gwf.NodeName;
        en.value.StartRDT = gwf.StartRDT;
        await en.value.Update();
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
      if (isMultiSelect.value === true) handler.AddPara('SelectEmps', encodeURI(selected.value.join(',')));
      else handler.AddPara('SelectEmps', encodeURI(selected.value));
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
      //显示信息关闭页面
      isShowMsg.value = true;
      if (data.includes('撤销本次发送') == true) {
        isHaveUnSend.value = true;
        //移除该操作
        const str = data.split('撤销本次发送');
        data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
      }
      if (data.includes('指定特定的处理人处理') == true) {
        //移除该操作
        const str = data.split('指定特定的处理人处理');
        data = str[0].substring(0, str[0].lastIndexOf('@')) + str[1].substring(str[1].indexOf('@'));
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
    box-shadow: 0px 0px 4px 2px #cccccc57;
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
</style>
