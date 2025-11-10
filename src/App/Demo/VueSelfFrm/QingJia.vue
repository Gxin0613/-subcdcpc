<template>
  <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 200px">
    <Input v-model:value="formState.username" style="width: 200px">
      <template #prefix>
        <UserOutlined class="site-form-item-icon" />
      </template>
    </Input>
    <InputPassword v-model:value="formState.password" style="width: 200px">
      <template #prefix>
        <LockOutlined class="site-form-item-icon" />
      </template>
    </InputPassword>
    <Checkbox v-model:checked="formState.remember">Remember me</Checkbox>
  </div>
</template>
<script lang="ts" setup>
  import { Input, InputPassword, Checkbox, message } from 'ant-design-vue';
  import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
  import { reactive } from 'vue';

  interface FormState {
    username: string;
    password: string;
    remember: boolean;
  }
  const formState = reactive<FormState>({
    username: '',
    password: '',
    remember: true,
  });
  const Save = () => {
    console.log('保存');
    message.success('保存成功' + location.href);
    return true;
  };
  //抛出方法
  (window as any).Save = Save;
</script>
