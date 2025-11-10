<template>
  <!-- 表格元素 相关属性可参考： https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form -->
  <from class="box" :style="{ right: layout1 }" action="login.html" method="post" ref="formRef" :model="formData">
    <h1>{{ dataSource.Name }}</h1>
    <input type="text" name="" :placeholder="'用户名'" v-model="formData.account" />
    <input type="password" name="" :placeholder="'密码'" v-model="formData.password" />
    <input type="submit" :value="'登录'" @click="handleLogin('Standard')" />
  </from>
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
    lout: {
      type: String,
      default: '',
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
  const layout1 = ref('20%');
  if (props.lout == 0) {
    layout1.value = '55%';
  } else if (props.lout == 2) {
    layout1.value = '-200px';
  }

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
  body {
    /* 设置边距，可以设置四个方向，分别是 上 右 下 左 */
    margin: 0;
    /* 填充 也是可以设置四个方向，同上 */
    padding: 0;
    /* 设置字体风格 */
    font-family: sans-serif;
    /* 设置背景颜色 */
    background: lightsteelblue;
  }

  .box {
    width: 434px;
    padding: 40px;
    /* 绝对定位，通过这个可以使元素放在页面的任何一个位置上 */
    position: absolute;
    /* 以下三行代码实现了块元素在百分比下居中 可以参考： https://www.cnblogs.com/knuzy/p/9993181.html */
    top: 40%;
    //left: 50%;
    //margin-right: 500px;

    transform: translate(-50%, -50%);
    /* 设置登录界面的背景颜色 */
    background-color: cornflowerblue;
    /* 规定标签中元素属性为 text 的居中 */
    text-align: center;
  }

  .box h1 {
    color: #349;
    /* 控制文本大小写 */
    text-transform: uppercase;
    font-size: 500;
  }

  /* 选中输入账号密码的框框 */
  .box input[type='text'],
  .box input[type='password'] {
    border: 0;
    background: none;
    display: block;
    /* 第一个参数定上下 20px 第二个auto自动适配 */
    margin: 20px auto;
    /* 文本居中 */
    text-align: center;
    /* 设置边框大小和颜色 */
    border: 2px solid #3498db;
    /* 两个参数分别对应 高 和 宽 */
    padding: 14px 10px;
    /* 设置边框为宽 */
    width: 200px;
    /* 边框对应的属性分别有三个 https://www.w3school.com.cn/cssref/pr_outline.asp */
    outline: none;
    color: white;
    /* 边框的半径 更圆润*/
    border-radius: 24px;
    /* 设置动画的过渡时间 */
    transition: 0.25s;
  }

  /* 设置变化后的界面 */
  .box input[type='text']:focus,
  .box input[type='password']:focus {
    width: 280px;
    border-color: #2ecc71;
  }

  .box input[type='submit'] {
    border: 0;
    background: none;
    display: block;
    margin: 20px auto;
    text-align: center;
    border: 2px solid #2ecc71;
    padding: 14px 40px;
    outline: none;
    color: black;
    border-radius: 24px;
    transition: 0.25s;
  }

  .box input[type='submit']:hover {
    background: #2ecc71;
  }
</style>
