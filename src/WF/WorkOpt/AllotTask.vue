<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <div>
          <Form layout="vertical" style="width: 70%; margin: 0 auto">
            <FormItem :label="'选择分配人员:'">
              <CheckboxGroup class="frmStyleType" v-model:value="checkVal">
                <checkbox v-for="item in list" :key="item.FK_Emp" :value="item.FK_Emp" :name="item.EmpName" :style="'display:flex'">
                  {{ item.EmpName }}
                </checkbox>
              </CheckboxGroup>
            </FormItem>
          </Form>
          <div class="btn-groups" style="margin-left: 16%">
            <div style="margin: 5px 85px 5px 5px" class="refund">
              <Button type="primary" @click="AllToTask" style="margin-right: 1em">{{ '执行分配' }}</Button>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { message, Spin, Form, FormItem, Button, CheckboxGroup, Checkbox } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import { GenerWorkFlowView } from '/@/WF/TSClass/FlowData/GenerWorkFlowView';
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
  const loading = ref(false);
  const checkVal = ref([]); // 选择的人员
  const list = ref<Record<string, any>[]>([]); //人员列表

  const InitPage = async () => {
    try {
      loading.value = true;
      const gwf = new GenerWorkFlowView();
      gwf.setPKVal(props.params.WorkID);
      await gwf.RetrieveFromDBSources();
      const ens = new BSEntities('BP.WF.GenerWorkerLists');
      await ens.Retrieve('WorkID', props.params.WorkID, 'FK_Node', gwf.FK_Node);
      if (ens.data.length == 0) {
        await ens.Retrieve('FID', props.params.WorkID, 'FK_Node', gwf.FK_Node);
      }
      list.value = ens.data;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const AllToTask = async () => {
    if (checkVal.value.length == 0) {
      message.error('请选择重新分配的人员');
      return;
    }
    let todoEmps = '';
    for (let gwl of list.value) {
      if (checkVal.value.includes(gwl.FK_Emp) == false) {
        const curGwl = new BSEntity('BP.WF.GenerWorkerList');
        curGwl.data = gwl;
        curGwl.IsEnable = '0';
        await curGwl.Update();
        todoEmps += gwl.FK_Emp + ',' + gwl.EmpName + ';';
      }
    }
    const gwf = new BSEntity('BP.WF.GenerWorkFlow');
    gwf.setPK(props.params.WorkID);
    await gwf.Init();
    gwf.TodoEmps = todoEmps;
    gwf.TodoEmpsNum = checkVal.value.length;
    await gwf.Update();
    message.success('任务分配成功');
    Close();
  };
  InitPage();

  const emit = defineEmits(['handleCancel']);
  const Close = () => {
    emit('handleCancel', false);
  };
</script>
<style scoped lang="less">
  .content {
    padding: 20px 0;
    .refund {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
