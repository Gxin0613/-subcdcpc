<template>
  <Card :bordered="false" class="loginCard">
    <p class="loginTitle"> 账号登录 </p>
    <div class="line"
      ><div style="width: 50px"><Divider style="height: 4px; width: 10px; background-color: #000000" /></div
    ></div>
    <Form class="p-4 enter-x login_personnel" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
      <FormItem name="account" class="enter-x">
        <Input size="large" v-model:value="formData.account" autocomplete="username" :placeholder="t('sys.login.userName')" class="input">
          <template #prefix>
            <user-outlined type="user" />
          </template>
        </Input>
      </FormItem>
      <FormItem name="password" class="enter-x">
        <InputPassword size="large" autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="t('sys.login.password')" class="input">
          <template #prefix>
            <LockOutlined />
          </template>
        </InputPassword>
      </FormItem>

      <FormItem class="enter-x from_login_">
        <Button type="primary" size="large" class="btnLogin" block @click="handleLogin('Standard')" :loading="loading" :disabled="disabledStatus"> 登录 </Button>
      </FormItem>
    </Form>
  </Card>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';

  import { Form, Input, Button, Divider, message, Card } from 'ant-design-vue';
  import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from '/@/Portal/login/useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getAppEnvConfig } from '/@/utils/env';
  const props = defineProps({
    loginType: {
      //单组织版和集团版公用一个登录表单：Single单组织，Group集团版登录
      type: String,
      default: '',
    },
  });
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();

  const { getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);
  const mLoading = ref(false);
  const pLoading = ref(false);
  const mobileLoginLoading = ref(false);

  const { VITE_GLOB_API_URL } = getAppEnvConfig();

  const disabledStatus = computed(() => unref(loading) || unref(mLoading) || unref(mLoading));

  const formData = reactive({
    account: 'admin',
    password: '123',
    verifyCode: '',
    verifyCodeBase64: '',
    showVerifyCode: false,
  });

  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  //定义变量是否是移动端
  //const isMobile = ref<Boolean>(/mobile/i.test(navigator.userAgent));
  async function handleLogin(LoginToMiddleware = 'Standard') {
    const data = await validForm();
    if (!data) return;
    // 处理验证码，因为验证码非必须验证
    if (formData.showVerifyCode && !formData.verifyCode.trim()) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: '请输入验证码',
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
      return;
    }

    try {
      if (LoginToMiddleware === 'Middle') mLoading.value = true;
      else if (LoginToMiddleware === 'Mobile') mobileLoginLoading.value = true;
      else if (LoginToMiddleware === 'Portal') pLoading.value = true;
      else loading.value = true;
      const userInfo = await userStore.login({
        password: data.password,
        username: data.account,
        mode: 'none', //不要默认的错误提示
        type: LoginToMiddleware, // 是否跳转到中间件模式
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo?.Name}`,
          duration: 1,
        });
      }
    } catch (error) {
      //当前是vue3.ccbpm.cn演示环境登录出错则跳转到其它演示选择界面
      const currentPath = window.location.href;
      // console.info(currentPath);
      if (currentPath.indexOf('vue3.ccbpm.cn') >= 0) {
        window.open('http://ccflow.org/Demo.html?ServName=ccflowvue3&Err=' + error);
      } else {
        if ((error as string).toString().includes('code 500')) {
          error = '后台未启动或数据库连接错误.<br>' + '后台启动地址：' + VITE_GLOB_API_URL;
        }
        createErrorModal({
          title: t('sys.api.errorTip'),
          content: (error as string).toString() || t('sys.api.networkExceptionMsg'),
          getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
        });
      }
      // await getVerifyCode();
    } finally {
      loading.value = false;
      mLoading.value = false;
      mobileLoginLoading.value = false;
      pLoading.value = false;
    }
  }
</script>
<style lang="less" scoped>
  .from_login_ {
    width: 100%;
  }

  .loginCard {
    width: 520px;
    height: 520px;
    border-radius: 10px;
  }
  .loginTitle {
    font-size: 28px;
    text-align: center;
    font-weight: bolder;
    padding-top: 30px;
  }
  .line {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    height: 10px;
    margin-top: -20px;
  }
  .input {
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-radius: 0%;
    border-bottom: 1px solid '#dbdbdb';
    margin-top: 30px;
    color: '#dbdbdb';
    -webkit-text-fill-color: '#dbdbdb';
  }
  .btnLogin {
    height: 55px;
    margin-top: 50px;
    font-weight: bold;
  }
  .ant-btn-primary {
    color: #fff;
    background-color: #0f78ee;
  }

  @media screen and (max-width: 1600px) {
    .loginCard {
      width: 450px;
      height: 450px;
      border-radius: 10px;
    }

    .loginTitle {
      font-size: 23px;
      text-align: center;
      font-weight: bolder;
      padding-top: 25px;
    }

    .line {
      display: flex;
      justify-content: center; /* 水平居中 */
      align-items: center; /* 垂直居中 */
      height: 10px;
      margin-top: -15px;
    }
    .input {
      border-top: 0px;
      border-left: 0px;
      border-right: 0px;
      border-radius: 0%;
      border-bottom: 1px solid '#dbdbdb';
      margin-top: 25px;
      color: '#dbdbdb';
      -webkit-text-fill-color: '#dbdbdb';
    }
    .btnLogin {
      height: 50px;
      margin-top: 40px;
      font-weight: bold;
    }
    .ant-btn-primary {
      color: #fff;
      background-color: #0f78ee;
    }
  }

  @media screen and (max-width: 1024px) {
    .loginCard {
      width: 450px;
      height: 450px;
      border-radius: 10px;
      margin-top: 30px;
    }
  }
</style>
