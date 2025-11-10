<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }">
          <FormItem :label="'删除原因'">
            <Textarea
              v-model:value="deleteFlow.doc"
              :placeholder="'删除原因'"
              style="width: 100%; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 2px; height: 200px"
            />
          </FormItem>
          <FormItem :label="'删除方式'">
            <RadioGroup v-model:value="deleteFlow.deleteWay">
              <Radio :value="1">{{ '逻辑删除' }}</Radio>
              <Radio :value="2">{{ '记录日志方式删除' }}</Radio>
              <Radio :value="3">{{ '彻底删除' }}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem :label="'是否删除子流程'">
            <Switch v-model:checked="deleteFlow.isDeleteSubFlow" />
          </FormItem>
        </Form>
        <div class="btn-groups" style="margin-left: 60%">
          <div style="margin: 5px">
            <Button type="primary" @click="DeleteFlow" style="margin-right: 1em">{{ '删除流程' }}</Button>
            <Button type="primary" @click="Close()">{{ '取消' }}</Button>
          </div>
        </div>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'DeleteFlowInstance',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Form, FormItem, Button, RadioGroup, Radio, Switch, Textarea } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';

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
  const deleteFlow = ref({
    doc: '',
    deleteWay: 1,
    isDeleteSubFlow: false,
  });
  const emit = defineEmits(['handleCancel']);
  const DeleteFlow = async () => {
    if (deleteFlow.value.doc == '') {
      message.error('请填写删除原因');
      return;
    }
    loading.value = true;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddJson(props.params);
    handler.AddPara('RB_DeleteWay', deleteFlow.value.deleteWay);
    handler.AddPara('TB_Doc', deleteFlow.value.doc);
    handler.AddPara('CB_IsDeleteSubFlow', deleteFlow.value.isDeleteSubFlow);
    const data = await handler.DoMethodReturnString('DeleteFlowInstance_DoDelete');
    if (typeof data === 'string' && data.includes('err@')) {
      loading.value = false;
      message.error(data.replace('err@', ''));
      return;
    }
    if (typeof data === 'string') {
      loading.value = false;
      message.success(data);
      emit('handleCancel', false);
      return;
    }
  };

  const Close = () => {
    emit('handleCancel', true);
  };
</script>
<style scoped lang="less">
  .content {
    margin: 20px 20px 0;
    padding: 20px 0;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px 5px #eee;
  }
</style>
