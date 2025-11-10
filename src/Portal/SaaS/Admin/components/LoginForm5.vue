<template>
  <div class="loginBox">
    <h2>{{ dataSource.Name }}</h2>
    <form action="" ref="formRef" :model="formData">
      <div class="item">
        <input type="text" v-model="formData.account" />
        <label for="">{{ '用户名' }}</label>
      </div>
      <div class="item">
        <input type="password" v-model="formData.password" />
        <label for="">{{ '密码' }}</label>
      </div>
      <button class="btn" @click="handleLogin('Standard')"
        >{{ '登录' }}<span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </form>
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
  * {
    margin: 0;
    padding: 0;
  }

  a {
    text-decoration: none;
  }

  input,
  button {
    background: transparent;
    border: 0;
    outline: none;
  }

  body {
    height: 100vh;
    background: linear-gradient(#141e30, #243b55);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: #03e9f4;
  }

  .loginBox {
    width: 400px;
    height: 364px;
    background-color: #0c1622;
    margin: 100px auto;
    border-radius: 10px;
    box-shadow: 0 15px 25px 0 rgba(0, 0, 0, 0.6);
    padding: 40px;
    box-sizing: border-box;
  }

  h2 {
    text-align: center;
    color: aliceblue;
    margin-bottom: 30px;
    font-family: 'Courier New', Courier, monospace;
  }

  .item {
    height: 45px;
    border-bottom: 1px solid #fff;
    margin-bottom: 40px;
    position: relative;
  }

  .item input {
    width: 100%;
    height: 100%;
    color: #fff;
    padding-top: 20px;
    box-sizing: border-box;
  }

  .item input:focus + label,
  .item input:valid + label {
    top: 0px;
    font-size: 2px;
  }

  .item label {
    position: absolute;
    left: 0;
    top: 12px;
    transition: all 0.5s linear;
  }

  .btn {
    padding: 10px 20px;
    margin-top: 30px;
    color: #03e9f4;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 2px;
    left: 35%;
  }

  .btn:hover {
    border-radius: 5px;
    color: #fff;
    background: #03e9f4;
    box-shadow: 0 0 5px 0 #03e9f4, 0 0 25px 0 #03e9f4, 0 0 50px 0 #03e9f4, 0 0 100px 0 #03e9f4;
    transition: all 1s linear;
  }

  .btn > span {
    position: absolute;
  }

  .btn > span:nth-child(1) {
    width: 100%;
    height: 2px;
    background: -webkit-linear-gradient(left, transparent, #03e9f4);
    left: -100%;
    top: 0px;
    animation: line1 1s linear infinite;
  }

  @keyframes line1 {
    50%,
    100% {
      left: 100%;
    }
  }

  .btn > span:nth-child(2) {
    width: 2px;
    height: 100%;
    background: -webkit-linear-gradient(top, transparent, #03e9f4);
    right: 0px;
    top: -100%;
    animation: line2 1s 0.25s linear infinite;
  }

  @keyframes line2 {
    50%,
    100% {
      top: 100%;
    }
  }

  .btn > span:nth-child(3) {
    width: 100%;
    height: 2px;
    background: -webkit-linear-gradient(left, #03e9f4, transparent);
    left: 100%;
    bottom: 0px;
    animation: line3 1s 0.75s linear infinite;
  }

  @keyframes line3 {
    50%,
    100% {
      left: -100%;
    }
  }

  .btn > span:nth-child(4) {
    width: 2px;
    height: 100%;
    background: -webkit-linear-gradient(top, transparent, #03e9f4);
    left: 0px;
    top: 100%;
    animation: line4 1s 1s linear infinite;
  }

  @keyframes line4 {
    50%,
    100% {
      top: -100%;
    }
  }
</style>
