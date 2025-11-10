<template>
  <div class="login-container">
    <div class="left-container">
      <form ref="formRef" :model="formData">
        <div class="title"
          ><span>{{ dataSource.Name }}</span></div
        >
        <div class="input-container">
          <input type="text" name="username" :placeholder="'用户名'" v-model="formData.account" />
          <input type="password" name="password" :placeholder="'密码'" v-model="formData.password" />
        </div>
        <div class="message-container">
          <span>{{ '忘记密码' }}</span>
        </div>
      </form>
    </div>
    <div class="right-container">
      <div class="regist-container">
        <span class="regist">{{ '注册' }}</span>
      </div>
      <div class="action-container">
        <span @click="handleLogin('Standard')">{{ '提交' }}</span>
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
  * {
    padding: 0;
    margin: 0;
  }

  html {
    height: 100%;
  }

  body {
    background-image: linear-gradient(to bottom right, rgb(114, 135, 254), rgb(130, 88, 186));
  }

  .login-container {
    width: 600px;
    height: 315px;
    margin: 0 auto;
    margin-top: 10%;
    border-radius: 15px;
    box-shadow: 0 10px 50px 0px rbg(59, 45, 159);
    background-color: rgb(95, 76, 194);
  }

  .left-container {
    display: inline-block;
    width: 330px;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    padding: 60px;
    background-image: linear-gradient(to bottom right, rgb(118, 76, 163), rgb(92, 103, 211));
  }

  .title {
    color: #fff;
    font-size: 18px;
    font-weight: 200;
  }

  .title span {
    border-bottom: 3px solid rgb(237, 221, 22);
  }

  .input-container {
    padding: 20px 0;
  }

  input {
    border: 0;
    background: none;
    outline: none;
    color: #fff;
    margin: 20px 0;
    display: block;
    width: 100%;
    padding: 5px 0;
    transition: 0.2s;
    border-bottom: 1px solid rgb(199, 191, 219);
  }

  input:hover {
    border-bottom-color: #fff;
  }

  ::-webkit-input-placeholder {
    color: rgb(199, 191, 219);
  }

  .message-container {
    font-size: 14px;
    transition: 0.2s;
    color: rgb(199, 191, 219);
    cursor: pointer;
  }

  .message-container:hover {
    color: #fff;
  }

  .right-container {
    width: 145px;
    display: inline-block;
    height: calc(100% - 120px);
    vertical-align: top;
    padding: 60px 0;
  }

  .regist-container {
    text-align: center;
    color: #fff;
    font-size: 18px;
    font-weight: 200;
  }

  .regist-container span {
    border-bottom: 3px solid rgb(237, 221, 22);
  }

  .action-container {
    font-size: 10px;
    color: #fff;
    text-align: center;
    position: relative;
    top: 200px;
  }

  .action-container span {
    border: 1px solid rgb(237, 221, 22);
    padding: 10px;
    display: inline;
    line-height: 20px;
    border-radius: 20px;
    position: absolute;
    bottom: 10px;
    left: calc(72px - 20px);
    transition: 0.2s;
    cursor: pointer;
  }

  .action-container span:hover {
    background-color: rgb(237, 221, 22);
    color: rgb(95, 76, 194);
  }
</style>
