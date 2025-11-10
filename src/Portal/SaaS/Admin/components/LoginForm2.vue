<template>
  <div id="login_box">
    <h2 class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left" style="color: #0076fe; margin-bottom: 30px; text-align: center">
      <!--      <img :src="logo" @error="defaultIcon" :width="60" />-->
      <div style="margin-top: 20px">
        <template v-if="dataSource.Name">
          <span style="color: green">{{ dataSource.Name }}</span>
        </template>
      </div>
    </h2>
    <Form style="padding: 1rem 1rem 0.5rem 1rem" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
      <FormItem name="account">
        <Input v-model:value="formData.account" autocomplete="username" :placeholder="'账号'" />
      </FormItem>
      <FormItem name="password">
        <InputPassword autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="'密码'" />
      </FormItem>
      <FormItem v-if="formData.showVerifyCode" name="verifyCode" class="enter-x">
        <div class="verify-code">
          <Input v-model:value="formData.verifyCode" :placeholder="'请输入验证码'" />
          <img :src="formData.verifyCodeBase64" class="verify-code-img" :alt="'验证码'" />
        </div>
      </FormItem>
      <FormItem class="enter-x">
        <template v-if="!IsMobile()">
          <Button
            v-if="props.type == 'SAASLogin'"
            type="primary"
            size="large"
            class="botton-radius"
            block
            @click="handleLogin('Standard')"
            :loading="loading"
            :disabled="disabledStatus"
          >
            {{ '登录' }}
          </Button>
        </template>
        <Button v-else type="primary" size="large" block @click="handleLogin('Mobile')" :loading="mobileLoginLoading" :disabled="disabledStatus">
          {{ '移动端登录' }}
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, onMounted } from 'vue';
  import { Form, Input, Button, Divider, message, InputPassword } from 'ant-design-vue';
  import { GithubFilled, WechatFilled, AlipayCircleFilled, GoogleCircleFilled, TwitterCircleFilled } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from '../../../login/useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  //import { onKeyStroke } from '@vueuse/core';
  // import { useGo } from '/@/hooks/web/usePage';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { IsMobile } from '/@/utils/gener/StringUtils';
  import { useRoute, useRouter } from 'vue-router';
  import { getAppEnvConfig } from '/@/utils/env';
  import cclogo from '../../../../assets/images/cclogo.png';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: '',
    },
    saasMode: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: Object,
      default: () => ({}),
    },
    orgNo: {
      type: String,
      default: '',
    },
    orgName: {
      type: String,
      default: '',
    },
    userNo: {
      type: String,
      default: '',
    },
  });
  const router = useRouter();
  const route = useRoute();
  const OrgNo = props.orgNo || route.query.OrgNo;
  const OrgName = props.orgName || route.query.OrgName;
  const UserNo = props.userNo || route.query.UserNo;
  console.log('参数：', route, props.params);
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
  const { VITE_GLOB_API_URL, VITE_GLOB_SaaSModel } = getAppEnvConfig();

  const disabledStatus = computed(() => unref(loading) || unref(mLoading));
  //获取代理路径
  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  //Logo图片存放地址
  const logo: string = basicPath + `/DataUser/OrgData/${OrgNo}Icon.png`;
  //默认图片
  const defaultLogo: string = basicPath + `/DataUser/OrgData/ccsIcon.png`;
  //没有用户头像图片时获取默认图片
  function defaultIcon(e) {
    const img = e.srcElement;
    img.src = cclogo;
    img.onerror = null;
  }
  const formData = reactive({
    account: getAccount(),
    password: '123',
    verifyCode: '',
    verifyCodeBase64: '',
    showVerifyCode: false,
  });
  //SaaSMode账号填充
  function getAccount() {
    if (props.type == 'SAASLogin') {
      if (props.saasMode) {
        if (!!UserNo) return UserNo;
        else return OrgNo;
      } else return OrgNo;
    } else return 'admin';
  }

  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  //定义变量是否是移动端
  //const isMobile = ref<Boolean>(/mobile/i.test(navigator.userAgent));
  async function handleLogin(LoginTo = 'AdminLogin') {
    let data;
    try {
      data = await validForm();
    } catch (e) {
      message.error('请输入账号密码');
      return;
    }
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
      if (LoginTo === 'Middle') mLoading.value = true;
      if (LoginTo === 'BackSAASLogin') {
        //前往普通用户登录页
        router.push({ path: '/SaasLogin' });
        return;
      } else if (LoginTo === 'AdminLogin' || LoginTo === 'Standard') loading.value = true;
      const userInfo = await userStore.saasLogin({
        OrgNo: OrgNo,
        password: data.password,
        username: data.account,
        mode: 'none', //不要默认的错误提示
        type: LoginTo, // 是否跳转到中间件模式
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
      // await getVerifyCode();
    } finally {
      loading.value = false;
      mLoading.value = false;
      mobileLoginLoading.value = false;
    }
  }

  const getVerifyCode = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      const res = await handler.DoMethodReturnString('Login_VerifyState');
      if (res.startsWith('data:image')) {
        formData.verifyCodeBase64 = res;
        formData.showVerifyCode = true;
      } else {
        formData.verifyCodeBase64 = '';
        formData.showVerifyCode = false;
      }
    } catch (e) {
      message.error('请求验证码失败，请检查后台服务是否正常');
    }
  };
</script>
<style lang="less" scoped>
  #login_box {
    width: 124%;
    height: 400px;
    background-color: #00000060;
    margin-right: 50px;
    margin-top: 20%;
    text-align: center;
    border-radius: 10px;
    padding: 50px 50px;
  }
  :deep(.ant-input) {
    min-width: 95% !important;
    border-radius: 0;
    background: transparent;
  }
  :deep(.ant-input-affix-wrapper) {
    border-radius: 0;
    outline: none !important;
    background: transparent;
    border-color: transparent;
    border-bottom: 2px solid #fff;
  }
  h2 {
    color: #ffffff90;
    margin-top: 5%;
  }

  #input-box {
    margin-top: 5%;
  }

  span {
    color: #fff;
  }

  input {
    border: 0;
    width: 60%;
    font-size: 15px;
    color: #fff;
    background: transparent;
    border-bottom: 2px solid #fff;
    padding: 5px 10px;
    outline: none;
    margin-top: 10px;
  }

  button {
    margin-top: 50px;
    width: 60%;
    height: 30px;
    border-radius: 10px;
    border: 0;
    color: #fff;
    text-align: center;
    line-height: 30px;
    font-size: 15px;
    background-image: linear-gradient(to right, #30cfd0, #330867);
  }

  #sign_up {
    margin-top: 45%;
    margin-left: 60%;
  }

  a {
    color: #b94648;
  }
</style>
