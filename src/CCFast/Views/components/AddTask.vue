<template>
  <ThemeWrapper>
    <div style="margin-top: 10px" id="addTask">
      <Form name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" autocomplete="off" style="width: 100%">
        <FormItem :label="'任务名称'" name="username" :rules="[{ required: true, message: '请输入任务名称!' }]">
          <Input />
        </FormItem>
        {{ '功能未完成待开发' }}
      </Form>
    </div>
  </ThemeWrapper>
</template>
<script setup lang="ts">
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { Form, FormItem, Input } from 'ant-design-vue';

  const SaveTask = () => {
    const task = new BSEntity('BP.CCOA.Task');
  };
</script>
