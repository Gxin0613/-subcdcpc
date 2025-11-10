<template>
  <div class="container">
    <div class="login-wrapper">
      <div class="header">
        <template v-if="dataSource.Name">
          <span style="color: green">{{ dataSource.Name }}</span>
        </template>
      </div>
      <div class="form-wrapper">
        <form ref="formRef" :model="formData">
          <input type="text" :name="'用户名'" :placeholder="'用户名'" class="input-item" v-model="formData.account" />
          <input type="password" :name="'密码'" :placeholder="'密码'" class="input-item" v-model="formData.password" />
          <div class="btn" @click="handleLogin('Standard')">{{ '登录' }}</div>
        </form>
      </div>
    </div>
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
    let data = formData;
    if (formData.account == '' || formData.password == '') {
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
  .container {
    height: 100%;
    //background-image: linear-gradient(to right, #fbc2eb, #a6c1ee);
  }
  .vben-login input:not([type='checkbox']) {
    min-width: 267px;
  }
  .login-wrapper {
    background-color: #fff;
    width: 358px;
    height: 588px;
    border-radius: 15px;
    padding: 0 50px;
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .vben-login .container {
    display: flex;
    flex-direction: column;
    margin-top: 0px;
    border-radius: 3vh;
  }
  .header {
    font-size: 38px;
    font-weight: bold;
    text-align: center;
    padding-top: 40px;
    padding-bottom: 125px;
  }

  .input-item {
    display: block;
    width: 80%;
    margin-bottom: 20px;
    border: 0;
    padding: 10px;
    border-bottom: 1px solid rgb(128, 125, 125);
    font-size: 15px;
    outline: none;
  }

  .input-item:placeholder {
    text-transform: uppercase;
  }

  .btn {
    text-align: center;
    padding: 10px;
    width: 100%;
    margin-top: 40px;
    background-image: linear-gradient(to right, #a6c1ee, #fbc2eb);
    color: #fff;
  }

  .msg {
    text-align: center;
    line-height: 88px;
  }

  a {
    text-decoration-line: none;
    color: #abc1ee;
  }
</style>
