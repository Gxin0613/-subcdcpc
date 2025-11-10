<template>
  <div v-show="getShow" class="enter-x">
    <h2
      v-if="props.type == 'AdminLogin'"
      class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left"
      style="color: #0076fe; margin-bottom: 30px; text-align: center"
    >
      {{ VITE_GLOB_SX_TITLE }}BPM多租户&nbsp;-&nbsp; 超级管理员登录</h2
    >
    <h2
      v-if="props.type == 'SAASLogin'"
      class="mb-3 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left"
      style="color: #0076fe; margin-bottom: 30px; text-align: center"
    >
      <template v-if="props.saasMode">
        <img :src="logo" @error="defaultIcon" :width="60" />
        <div style="margin-top: 20px">
          <template v-if="dataSource.Name"
            >{{ '登录：' }}<span style="color: green">{{ dataSource.Name }}</span>
          </template>
        </div>
      </template>
      <template v-else
        >{{ '登录：' }}<span style="color: green">{{ OrgName }}</span
        >{{ ',组织账号：' }}<span style="color: green">{{ OrgNo }}</span>
      </template>
    </h2>
  </div>
  <Form class="p-4 enter-x" style="padding: 1rem 1rem 0.5rem 1rem" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
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
        <!--SAAS 登录中间件 -->
        <template v-if="!props.saasMode">
          <Button
            v-if="props.type == 'SAASLogin'"
            size="large"
            class="mb-4 enter-x botton-radius"
            block
            @click="handleLogin('Middle')"
            :loading="mLoading"
            :disabled="disabledStatus"
          >
            {{ '登录-流程中间件' }}
          </Button>
        </template>
        <!-- SAAS 登录低代码 -->
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
          <template v-if="props.saasMode"> {{ '登录' }} </template>
          <template v-else>
            {{ '登录-低代码平台' }}
          </template>
        </Button>
        <!-- SAAS 超级管理员登录 -->
        <Button
          v-if="props.type == 'AdminLogin'"
          size="large"
          class="mb-4 enter-x botton-radius"
          block
          @click="handleLogin('AdminLogin')"
          :loading="loading"
          :disabled="disabledStatus"
          >{{ '超级管理员登录' }}</Button
        >
        <Button v-if="props.type == 'AdminLogin'" type="primary" size="large" class="botton-radius" block @click="handleLogin('BackSAASLogin')" :disabled="disabledStatus">{{
          '返回普通用户登录'
        }}</Button>
      </template>

      <Button v-else type="primary" size="large" block @click="handleLogin('Mobile')" :loading="mobileLoginLoading" :disabled="disabledStatus">
        {{ '移动端登录' }}
      </Button>
      <!-- <Button size="large" class="mt-4 enter-x" block @click="handleRegister">
        {{ '注册' }}
      </Button> -->
    </FormItem>
    <!-- 只有在不是通用模式并且不启用SaaSMode时生效 -->
    <template v-if="!props.saasMode && VITE_GLOB_SaaSModel !== '0'">
      <FormItem class="enter-x" v-if="props.type == 'SAASLogin'">
        <div style="display: flex; justify-content: space-between">
          <a
            @click="
              () => {
                router.push('/SaasAdminLogin');
              }
            "
            >超管admin登录</a
          >
          <a
            @click="
              () => {
                router.push('/SelectOrg');
              }
            "
            >选择组织</a
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
    </template>
  </Form>
</template>

<script lang="ts" setup>
    import { reactive, ref, unref, computed, onMounted } from 'vue';

  import { Form, Input, Button, Divider, message } from 'ant-design-vue';
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
  const { VITE_GLOB_API_URL, VITE_GLOB_SaaSModel, VITE_GLOB_SX_TITLE } = getAppEnvConfig();

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
    img.src = '/resource/CompanyImgLogo/cclogo.png';
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
    //  debugger;
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
  .botton-radius {
    border-radius: 2.5vh;
  }
  .content-center {
    width: 100%;
  }
</style>
