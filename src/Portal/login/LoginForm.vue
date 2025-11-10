<template>
  <LoginFormTitle v-show="getShow" class="enter-x" :loginType="props.loginType" />
  <!-- 多语言选择 -->
  <div class="Multilingual">
    <Select v-model:value="SelectedLanguage" style="width: 100px" @change="handleMenuClick" :placeholder="'请选择语言'">
      <SelectOption v-for="item in Multilingual" :key="item.value" :label="item.label" :value="item.value">{{ item.label }}</SelectOption>
    </Select>
  </div>
  <Form class="p-4 enter-x login_personnel" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
    <FormItem name="account" class="enter-x">
      <Input size="large" v-model:value="formData.account" autocomplete="username" :placeholder="'账号'" class="fix-auto-fill botton-radius" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword size="large" autocomplete="current-password" visibilityToggle v-model:value="formData.password" :placeholder="'密码'" class="botton-radius" />
    </FormItem>

    <FormItem v-if="formData.showVerifyCode" name="verifyCode" class="enter-x">
      <div class="verify-code">
        <Input size="large" v-model:value="formData.verifyCode" :placeholder="'请输入验证码'" class="fix-auto-fill" />
        <img :src="formData.verifyCodeBase64" class="verify-code-img" :alt="'验证码'" @click="refreshVerifyCode" />
      </div>
    </FormItem>

    <FormItem class="enter-x from_login_">
      <template v-if="!IsMobile()">
        <Button size="large" class="mb-4 enter-x botton-radius" block @click="handleLogin('Middle')" :loading="mLoading" :disabled="disabledStatus">
          {{ '登录-流程中间件' }}
        </Button>
        <Button type="primary" size="large" class="mb-4 enter-x botton-radius" block @click="handleLogin('Standard')" :loading="loading" :disabled="disabledStatus">
          {{ '登录-低代码平台' }}
        </Button>
        <!-- <Popover v-model:open="isScanCode" trigger="click" placement="leftBottom" class="bubblePopover">
          <template #title> <i class="icon-bubble"></i><span>{{'请扫码关注公众号,移动端可在公众号内演示'}}</span> </template>
          <template #content>
            <div style="display: flex; justify-content: center"><img src="/resource/WF/Admin/Img/GongZhongHao.png" width="250" alt="" /></div>
          </template>
          <Button type="primary" @click="inquire"><i class="icon-bubble"></i>{{'扫码提问'}}</Button>
          <Button size="middle" type="primary" class="botton-radius GZH_btn" block @click="MobileGZH" :disabled="disabledStatus">{{'移动端'}}</Button>
        </Popover> -->
        <!-- <Button size="large" class="botton-radius" block @click="handleLogin('Portal')" :loading="pLoading" :disabled="disabledStatus">
          {{ '登录-门户平台(开发中)' }}
        </Button> -->
        <a href="https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=13831019&doc_id=31094" target="_blank">{{ '低代码与中间件区别?' }}</a>
      </template>
      <Button v-else type="primary" size="large" block @click="handleLogin('Mobile')" :loading="mobileLoginLoading" :disabled="disabledStatus">
        {{ '移动端登录' }}
      </Button>
    </FormItem>

<!--    <Divider class="enter-x">{{ '其他登录方式' }}</Divider>-->

<!--    <div class="flex justify-evenly enter-x content-center" :class="`${prefixCls}-sign-in-way`">-->
<!--      <div class="item_link">-->
<!--        <Popover v-model:open="isScanCode" trigger="click" placement="leftBottom" class="bubblePopover">-->
<!--          <template #title>-->
<!--            <i class="icon-bubble"></i><span>{{ '请扫码关注公众号，移动端可在公众号内演示' }}</span>-->
<!--          </template>-->
<!--          <template #content>-->
<!--            <div style="display: flex; justify-content: center; padding: 10px 20px 20px 20px"><img src="/resource/WF/Admin/Img/GongZhongHao.png" width="250" alt="" /></div>-->
<!--          </template>-->
<!--          <a @click="MobileGZH" :title="'移动端'" class="activeText">-->
<!--            <img class="item" src="../../assets/images/mobile.png" />-->
<!--            <div class="textCont">{{ '移动端' }}</div>-->
<!--          </a>-->
<!--        </Popover>-->
<!--      </div>-->
<!--      <div class="item_link">-->
<!--        <a href="http://doc.ccbpm.cn" data-toggle="tooltip" target="_blank" :title="'在线文档'" class="activeText">-->
<!--          <img class="item" src="../../assets/images//wendang1.png" />-->
<!--          <div class="textCont">{{ '在线文档' }}</div>-->
<!--        </a>-->
<!--      </div>-->
<!--      <div class="item_link">-->
<!--        <a href="http://ccflow.org" data-toggle="tooltip" target="_blank" :title="'官方网站'" class="activeText">-->
<!--          <img class="item" src="../../assets/images/guanwang1.png" />-->
<!--          <div class="textCont">{{ '官方网站' }}</div>-->
<!--        </a>-->
<!--      </div>-->
<!--      <div class="item_link">-->
<!--        <a href="http://ccflow.org/Ke.html" data-toggle="tooltip" target="_blank" :title="'视频教程'" class="activeText">-->
<!--          <img class="item" src="../../assets/images/shipin.png" />-->
<!--          <div class="textCont">{{ '视频教程' }}</div>-->
<!--        </a>-->
<!--      </div>-->
<!--      &lt;!&ndash;      <div class="item_link">&ndash;&gt;-->
<!--      &lt;!&ndash;        <a href="http://ccflow.org/Ke.html" data-toggle="tooltip" target="_blank" :title="'企业微信集成'">&ndash;&gt;-->
<!--      &lt;!&ndash;          <img class="item" src="/resource/banner/qywx.svg" style="margin-top: 3px" />&ndash;&gt;-->
<!--      &lt;!&ndash;        </a>&ndash;&gt;-->
<!--      &lt;!&ndash;      </div>&ndash;&gt;-->
<!--    </div>-->
<!--    <Drawer :visible="starVisible" :title="'感谢您体验驰骋低代码BPM，请您为我们Gitee开源项目点个star，谢谢！'" width="50%" @close="starVisible = false">-->
<!--      <template v-if="starVisible">-->
<!--        <Table :dataSource="dataSource" :columns="columns" />-->
<!--        <div style="padding-left: 20px">-->
<!--          <div style="font-size: 16px">1.点star后，请点击重新检测</div>-->
<!--          <div style="color: red; font-size: 16px">2.商务演示，请直接联系我们：18660153393（同wx）</div>-->
<!--          <Button style="margin-top: 10px" type="primary" @click="reCheck">{{ '重新检测' }}</Button>-->
<!--        </div>-->
<!--      </template>-->
<!--    </Drawer>-->
  </Form>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, computed, h } from 'vue';

  import { Form, Input, Button, Divider, Popover, Select, SelectOption, Drawer, Table, message } from 'ant-design-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  //import { onKeyStroke } from '@vueuse/core';
  // import { useGo } from '/@/hooks/web/usePage';
  import { IsMobile } from '/@/utils/gener/StringUtils';
  import { getCookie, setCookie } from '/@/utils/storage';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useLocale } from '/@/locales/useLocale';
  import { LocaleType } from '/#/config';
  import HttpHandler from '/@/utils/gener/HttpHandler';

  const props = defineProps({
    loginType: {
      //单组织版和集团版公用一个登录表单：Single单组织，Group集团版登录
      type: String,
      default: '',
    },
  });

  const dataSource = ref([
    { No: 0, MC: 'CCFast', Url: 'https://gitee.com/opencc/CCFast' },
    { No: 1, MC: 'JFlow', Url: 'https://gitee.com/opencc/JFlow' },
  ]);

  const columns = ref([
    { title: '项目名称', dataIndex: 'MC', key: 'MC' },
    {
      title: 'Gitee项目地址',
      dataIndex: 'Url',
      key: 'Url',
      customRender: ({ text }: Recordable) => {
        return h(
          'a',
          {
            href: text,
            target: '_blank',
          },
          text,
        );
      },
    },
  ]);

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
  const starVisible = ref(false);
  const loginType = ref();

  //扫码关注公众号
  const isScanCode = ref(false);
  //下拉框选择多语言
  const lang = useLocale().getLocale.value;
  const SelectedLanguage = ref(lang);
  const Multilingual = ref([
    {
      value: 'zh_CN',
      label: '中文',
    },
    {
      value: 'en',
      label: 'English',
    },
  ]);

  const disabledStatus = computed(() => unref(loading) || unref(mLoading) || unref(mLoading));
  const formData = reactive({
    account: !!getCookie('logoutPersonNo') ? getCookie('logoutPersonNo') : 'admin',
    password: '123',
    verifyCode: '',
    verifyCodeBase64: '',
    verifyCodeKey: '',
    showVerifyCode: false,
  });

  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  const { VITE_GLOB_API_URL } = getAppEnvConfig();

  //定义变量是否是移动端
  const isMobile = ref(false);
  const checkDeviceType = () => {
    // 结合 userAgent 和屏幕尺寸检测
    const isMobileDevice = /mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    isMobile.value = isMobileDevice;
  };

  async function handleLogin(type) {
    loginType.value = type;
    checkDeviceType();
    if (isMobile.value) {
      login(type);
      return;
    }

    if (getCookie('giteeStar') == '1') {
      login(type);
      return;
    }

    const url = window.location.href.toLowerCase();
    if (url.includes('vue3.ccbpm.cn') == false) {
      login(type);
      return;
    }

    starVisible.value = true;
  }

  async function login(LoginToMiddleware) {
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
      else if (LoginToMiddleware === 'Portal') pLoading.value = true;
      else loading.value = true;
      const userInfo = await userStore.login({
        password: data.password,
        username: data.account,
        verifyCodeKey: formData.verifyCodeKey,
        verifyCode: formData.verifyCode.trim(),
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
          title: '错误提示',
          content: (error as string).toString() || '网络异常，请检查您的网络连接是否正常！',
          getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
        });
      }
      await getVerifyCode();
    } finally {
      loading.value = false;
      mLoading.value = false;
      mobileLoginLoading.value = false;
      pLoading.value = false;
    }
  }

  const refreshVerifyCode = async () => {
    await getVerifyCode();
  };

  function reCheck() {
    setCookie('giteeStar', '1', 365);
    starVisible.value = false;
    login(loginType.value);
  }

  /**
   * 公众号扫码
   */
  const MobileGZH = () => {
    isScanCode.value = true;
  };
  /**
   * 多语言下拉框选择
   */
  const handleMenuClick = async (e) => {
    const { changeLocale } = useLocale();
    await changeLocale(e as LocaleType);
    location.reload();
  };

  //获取验证码
  const getVerifyCode = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      const res = await handler.DoMethodReturnString('get_Login_VerifyCode');
      const codeindex = res.indexOf('data:image');
      if (codeindex > 0) {
        formData.verifyCodeKey = res.substring(0, codeindex);
        formData.verifyCodeBase64 = res.substring(codeindex);
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
  .ant-form-item {
    margin-bottom: 8px;
  }

  .verify-code {
    display: flex;
    align-items: center;
    .verify-code-img {
      width: 90px;
      height: 40px;
      cursor: pointer;
      border: 1px solid #cccccc;
    }
  }
  .from_login_ {
    width: 100%;
  }
  :deep(.ant-form-item-control-input) {
    justify-content: center;
    margin: 10px auto 0;
  }
  :deep(.ant-form-item-control-input-content) {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .botton-radius {
    border-radius: 2.5vh;
    width: 300px;
    :deep(.ant-input-lg) {
      min-width: 250px;
    }
  }
  .GZH_btn {
    margin-left: auto;
    width: 100px;
  }
  :deep(.ant-input) {
    min-width: 180px !important;
  }
  .content-center {
    margin: auto;
    padding-bottom: 15px;
    width: 300px;
  }
  .activeText {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .textCont {
    font-size: 12px;
  }
  .Multilingual {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding-right: 25px;
  }
  :deep(.ant-btn-default:disabled) {
    color: #0960bd;
    background-color: #fff;
    border-color: #0960bd;
  }
  :deep(.ant-btn-primary:disabled) {
    color: #fff;
    background-color: #0a6cd5;
  }
</style>
