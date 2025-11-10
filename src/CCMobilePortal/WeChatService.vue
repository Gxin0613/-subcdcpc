<template>
  <div>
    <template v-if="showLogin">
      <div class="login-container">
        <H2>{{'登录'}}</H2>
        <Form class="p-4 enter-x" :model="formData" ref="formRef" v-show="showLogin" @keypress.enter="handleLogin">
          <!-- <FormItem name="account" class="enter-x">
        <Input size="large" v-model:value="formData.account" autocomplete="username" :placeholder="'请输入手机号'" class="fix-auto-fill" />
      </FormItem>
      <FormItem name="password" class="enter-x">
        <InputPassword size="large" autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="'请输入密码'" />
      </FormItem> -->
          <FormItem
            name="account"
            class="enter-x"
            :rules="`[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]`"
          >
            <Input size="large" v-model:value="formData.account" autocomplete="username" :placeholder="'请输入手机号'" class="fix-auto-fill" />
          </FormItem>
          <FormItem name="password" class="enter-x" :rules="[{ required: true, message: '请输入密码' }]">
            <InputPassword size="large" autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="'请输入密码'" />
          </FormItem>

          <FormItem class="enter-x">
            <Button type="primary" size="large" block @click="handleLogin()" :loading="loading" :disabled="disabledStatus">{{'登录'}}</Button>
          </FormItem>
        </Form>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';
  import { Form, FormItem, Input, InputPassword, Button, message } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import { useFormValid } from './login/useLogin';
  import { getAppEnvConfig } from '../utils/env';
  import { AesEncryption } from '../utils/cipher';

  const path = ref('');
  const showLogin = ref(false);

  const userStore = useUserStore();
  const router = useRouter();
  const formData = reactive({
    account: '',
    password: '',
    verifyCode: '',
    verifyCodeBase64: '',
    showVerifyCode: false,
  });
  const formRef = ref();
  const loading = ref(false);

  const disabledStatus = computed(() => unref(loading));

  //获取code
  const sysCode = ref('');
  //获取state参数
  const sysState = ref('');

  const InitPage = async () => {
    const getUrl = window.location.href;
    //获取参数字符串
    const getCodeInfo = getUrl.split('?')[1];
    //获取参数
    const getInfo = new URLSearchParams('?' + getCodeInfo);
    //获取code
    sysCode.value = getInfo.get('code') || '';
    //获取state参数
    sysState.value = getInfo.get('state') || ''?.replace('#/WeChatService', '');
    //默认路由
    path.value = '/CCMobilePortal/Home';

    userStore.setToken(''); //清空Token，调用Login_Verify接口时不可以传Token
    //执行验证与免登
    const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
    handler.AddPara('Code', sysCode.value);
    const jsonData: any = await handler.DoMethodReturnString('Login_Verify');
    if (jsonData.code !== 200) {
      //登录页面
      showLogin.value = true;
    } else {
      userStore.setToken(jsonData.data);
      //跳转首页
      router.push(path.value.replace('#/WeChatService', ''));
    }
  };
  const { validForm } = useFormValid(formRef);
  const handleLogin = async () => {
    const formData = await validForm();
    if (!formData) return;
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
      handler.AddPara('TB_No', formData.account);
      //密码敏感信息加密
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      //不加密就注释掉 pwd
      const pwd = encryption.encryptByAES(formData.password);
      handler.AddPara('Pass', pwd);
      handler.AddPara('Code', sysCode.value);
    //  debugger;
      const jsonData: any = await handler.DoMethodReturnString('Login_Authent');
      if (jsonData.code !== 200) {
        message.error(jsonData.msg);
      } else {
        userStore.setToken(jsonData.data);
        //跳转首页
        router.push(path.value.replace('#/WeChatService', ''));
      }
    } catch (e: any) {
      message.error(e);
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>
<style scoped>
  .login-container {
    margin: 40% 5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 12px #c9c9de;
  }
</style>
