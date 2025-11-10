<template>
  <div v-show="getShow" class="enter-x">
    <h2 v-if="props.type == 'OPLogin'" class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left" style="color: #0076fe; margin-bottom: 30px; text-align: center">
      {{ VITE_GLOB_SX_TITLE }}低代码开发平台SAAS</h2
    >
  </div>
  <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
    <FormItem name="account" class="enter-x">
      <Input size="large" v-model:value="formData.account" autocomplete="username" :placeholder="'账号'" class="fix-auto-fill botton-radius" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword size="large" autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="'密码'" class="botton-radius" />
    </FormItem>
    <FormItem v-if="formData.showVerifyCode" name="verifyCode" class="enter-x">
      <div class="verify-code">
        <Input size="large" v-model:value="formData.verifyCode" :placeholder="'请输入验证码'" class="fix-auto-fill" />
        <img :src="formData.verifyCodeBase64" class="verify-code-img" :alt="'验证码'" />
      </div>
    </FormItem>
    <FormItem class="enter-x">
      <template v-if="!IsMobile()">
        <Button size="large" class="mb-4 enter-x botton-radius" block @click="handleLogin('Middle')" :loading="mLoading" :disabled="disabledStatus">
          {{ '登录-流程中间件' }}
        </Button>
        <Button type="primary" size="large" class="botton-radius" block @click="handleLogin('Standard')" :loading="loading" :disabled="disabledStatus">
          {{ '登录-低代码平台' }}
        </Button>
      </template>
    </FormItem>
    <FormItem class="enter-x" v-if="props.type == 'OPLogin'">
      <div class="register_btn">
        <a
          @click="
            () => {
              router.push('/ChooseRegister');
            }
          "
          >注册</a
        >
      </div>
    </FormItem>
    <Divider class="enter-x">{{ '其他登录方式' }}</Divider>
    <div class="flex justify-evenly enter-x content-center" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div>
  </Form>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';
  import { Form, Input, Button, Divider } from 'ant-design-vue';
  import { GithubFilled, WechatFilled, AlipayCircleFilled, GoogleCircleFilled, TwitterCircleFilled } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from '../../../login/useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { IsMobile } from '/@/utils/gener/StringUtils';
  import { useRouter } from 'vue-router';
  import { getAppEnvConfig } from '/@/utils/env';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: '',
    },
  });
  const router = useRouter();
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
  const mobileLoginLoading = ref(false);

  const disabledStatus = computed(() => unref(loading) || unref(mLoading));

  const { VITE_GLOB_API_URL, VITE_GLOB_SX_TITLE } = getAppEnvConfig();

  const formData = reactive({
    account: '', //手机号
    password: '', //密码
    verifyCode: '',
    verifyCodeBase64: '',
    showVerifyCode: false,
  });

  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  //定义变量是否是移动端
  //const isMobile = ref<Boolean>(/mobile/i.test(navigator.userAgent));
  async function handleLogin(LoginToMiddleware = 'Standard') {
    const data = await validForm();
    if (!data) return;
    // 处理验证码，因为验证码非必须验证
    if (formData.showVerifyCode && !formData.verifyCode.trim()) {
      createErrorModal({
        title: '错误提示',
        content: '请输入验证码',
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
      return;
    }
    try {
      if (LoginToMiddleware === 'Middle') mLoading.value = true;
      else if (LoginToMiddleware === 'Mobile') mobileLoginLoading.value = true;
      else loading.value = true;
      const userInfo = await userStore.opLogin({
        password: data.password,
        username: data.account,
        mode: 'none', //不要默认的错误提示
        type: LoginToMiddleware, // 是否跳转到中间件模式
      });
      if (userInfo) {
        notification.success({
          message: '登录成功',
          description: `${'欢迎回来'}: ${userInfo?.Name}`,
          duration: 1,
        });
      }
    } catch (error) {
      if ((error as string).toString().includes('code 500')) {
        error = '后台未启动或数据库连接错误.<br>' + '后台启动地址：' + VITE_GLOB_API_URL;
      }
      createErrorModal({
        title: '错误提示',
        content: (error as string).toString() || '网络异常，请检查您的网络连接是否正常！',
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loading.value = false;
      mLoading.value = false;
      mobileLoginLoading.value = false;
    }
  }
</script>
<style lang="less" scoped>
  .verify-code {
    display: flex;
    align-items: center;
    .verify-code-img {
      width: 100px;
      height: 40px;
      cursor: pointer;
      border: 1px solid #cccccc;
    }
  }
  .register_btn {
    display: flex;
    justify-content: flex-end;
    font-size: 15px;
  }
  .botton-radius {
    border-radius: 2.5vh;
  }
  .content-center {
    margin-left: 55px;
    width: 300px;
  }
</style>
