<template>
  <div :class="prefixCls" class="relative w-full h-full px-4" :style="{ backgroundImage: 'url(' + logo + ')' }">
    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full position-center" :style="{ justifyContent: loginFormStyleLayout }">
        <!-- <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12"> </div> -->
        <!-- <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12 login-right-form"> -->
        <div v-if="ready && (!SaaSMode || (loginFormStyle == 0 && SaaSMode))" class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12 login-right-form">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x"
          >
            <template v-if="ready">
              <LoginForm type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
            </template>
          </div>
        </div>
        <div v-if="SaaSMode">
          <template v-if="loginFormStyle == 1">
            <LoginForm2 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 2">
            <LoginForm3 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 3">
            <LoginForm4 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 4">
            <LoginForm5 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 5">
            <LoginForm6 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 6">
            <LoginForm7 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 7">
            <LoginForm8 type="SAASLogin" :lout="loginlayout" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 8">
            <LoginForm9 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
          <template v-if="loginFormStyle == 9">
            <LoginForm10 type="SAASLogin" :orgName="OrgName" :orgNo="OrgNo" :saasMode="SaaSMode" :dataSource="dataSource" :userNo="UserNo" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { Modal } from 'ant-design-vue';
  import LoginForm from '/@/Portal/SaaS/Admin/components/LoginForm.vue';
  import LoginForm2 from '/@/Portal/SaaS/Admin/components/LoginForm2.vue';
  import LoginForm3 from '/@/Portal/SaaS/Admin/components/LoginForm3.vue';
  import LoginForm4 from '/@/Portal/SaaS/Admin/components/LoginForm4.vue';
  import LoginForm5 from '/@/Portal/SaaS/Admin/components/LoginForm5.vue';
  import LoginForm6 from '/@/Portal/SaaS/Admin/components/LoginForm6.vue';
  import LoginForm7 from '/@/Portal/SaaS/Admin/components/LoginForm7.vue';
  import LoginForm8 from '/@/Portal/SaaS/Admin/components/LoginForm8.vue';
  import LoginForm9 from '/@/Portal/SaaS/Admin/components/LoginForm9.vue';
  import LoginForm10 from '/@/Portal/SaaS/Admin/components/LoginForm10.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useRoute, useRouter } from 'vue-router';
  import { OrgUser } from '/@/WF/Admin/SaaS/OrgUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import { message } from 'ant-design-vue';
  import { OrgAdmin } from '/@/WF/Admin/SaaS/OrgAdmin';
  import { APP_PRESET_COLOR_LIST } from '/@/settings/designSetting';
  import { baseHandler } from '/@/layouts/default/setting/handler';
  import { menuTypeList } from '/@/layouts/default/setting/enum';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    sessionTimeout: {
      type: Boolean,
    },
  });

  const route = useRoute();
  const router = useRouter();
  const OrgNo = props.params.OrgNo || route.query.OrgNo;
  const OrgName = props.params.OrgName || route.query.OrgName;
  const UserNo = route.query?.UserNo;
  const { VITE_GLOB_API_URL, VITE_GLOB_OSModel } = getAppEnvConfig();
  //获取代理路径
  const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  //Logo图片存放地址
  const logo: string = basicPath + `/DataUser/OrgData/${OrgNo}.png`;
  const contact: string = basicPath + `/DataUser/Contact/${OrgNo}.png`;
  const ready = ref(false);
  const dataSource = reactive({
    No: '', //编号
    Name: '', //组织名称
    Addr: '', //公司地址
    Tel: '', //联系电话
    CopyRight: '', //版权信息
  });

  // const loginFormStyle = computed(() => {
  //   const style = props.params.style || route.query?.style;
  //   return style == '0' ? 'flex-start' : style == '1' ? 'center' : 'flex-end';
  // });
  const loginFormStyle = ref('0');
  const loginlayout = ref('0');
  const loginFormStyleLayout = ref('flex-end');
  const SaaSMode = ref(false);
  const InitPage = async () => {
    try {
      ready.value = false;
      if (VITE_GLOB_OSModel === '2') {
        //样式控制
        // const orgAdmin = new OrgAdmin(OrgNo);
        // await orgAdmin.Retrieve();

        //通过主键获取该组织信息
        SaaSMode.value = true;
        const orgUser = new OrgUser(OrgNo);
        await orgUser.Retrieve();
        dataSource.No = orgUser.GetValByKey('No');
        dataSource.Name = orgUser.GetValByKey('Name');
        dataSource.Addr = orgUser.GetValByKey('Addr');
        dataSource.Tel = orgUser.GetValByKey('Tel');
        dataSource.CopyRight = orgUser.GetValByKey('CopyRight');
        const LoginStyle = orgUser.GetValByKey('LoginStyle');
        const LoginStyleLayout = orgUser.GetValByKey('LoginLayout');
        loginFormStyle.value = LoginStyle;
        loginlayout.value = LoginStyleLayout;
        initStyle(LoginStyle);
        if (LoginStyleLayout == '0') {
          //居左
          loginFormStyleLayout.value = 'flex-start';
        } else if (LoginStyleLayout == '1') {
          //居中
          loginFormStyleLayout.value = 'center';
        } else if (LoginStyleLayout == '2') {
          //居右
          loginFormStyleLayout.value = 'flex-end';
        }
        return;
      }
      if (!OrgNo) router.replace({ path: '/SelectOrg' });
    } catch (e: any) {
      message.error(e);
    } finally {
      ready.value = true;
    }
  };
  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  // const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
  //弹窗显示
  const modal = reactive({
    visible: false,
  });
  const modalShow = () => {
    modal.visible = true;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const initStyle = async (type) => {
    // const rand = parseInt(Math.floor(Math.random() * APP_PRESET_COLOR_LIST.length));
    // const color = APP_PRESET_COLOR_LIST[rand] || '#459dff';
    let layout;
    let color;
    if (type == '0') {
      color = APP_PRESET_COLOR_LIST[0];
      layout = menuTypeList[0];
    } else if (type == '1') {
      color = APP_PRESET_COLOR_LIST[1];
      layout = menuTypeList[1];
    } else if (type == '2') {
      color = APP_PRESET_COLOR_LIST[2];
      layout = menuTypeList[2];
    } else if (type == '3') {
      color = APP_PRESET_COLOR_LIST[3];
      layout = menuTypeList[0];
    } else if (type == '4') {
      color = APP_PRESET_COLOR_LIST[4];
      layout = menuTypeList[1];
    } else if (type == '5') {
      color = APP_PRESET_COLOR_LIST[5];
      layout = menuTypeList[2];
    } else if (type == '6') {
      color = APP_PRESET_COLOR_LIST[6];
      layout = menuTypeList[0];
    } else if (type == '7') {
      color = APP_PRESET_COLOR_LIST[7];
      layout = menuTypeList[1];
    } else if (type == '8') {
      color = APP_PRESET_COLOR_LIST[8];
      layout = menuTypeList[2];
    } else if (type == '9') {
      color = APP_PRESET_COLOR_LIST[9];
      layout = menuTypeList[0];
    }
    // const rand = parseInt(Math.floor(Math.random() * menuTypeList.length));
    // const layout = menuTypeList[rand || 0];
    baseHandler(1, color);
    baseHandler(0, layout);
  };
  InitPage();
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        // background-image: url(/@/assets/svg/login-bg-dark.svg);
      }

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;
    //背景
    // background-image: url(../../assets/images/ccloginbg.png);
    background-position: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;

    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }
    .@{logo-prefix-cls} {
      position: absolute;
      top: 12px;
      height: 30px;

      &__title {
        font-size: 16px;
        color: #fff;
      }

      img {
        width: 32px;
      }
    }

    .container {
      //居中登录样式
      display: flex;
      flex-direction: column;
      margin-top: 60px;
      border-radius: 3vh;

      .position-center {
        border-radius: 3vh;
        width: 100%;
        height: 80%;
        .vben-app-logo {
          top: 15%;
          margin-left: 13%;
          img {
            width: 140px;
          }
        }
        .login-left-log {
          margin-right: 0;
          border-top-left-radius: 3vh;
          border-bottom-left-radius: 3vh;
          background: linear-gradient(to bottom right, #7ec6ef, rgba(255, 255, 255, 0));

          .cc-log {
            position: relative;
            top: 0px;
            left: 50px;
            margin-top: 30px;
            margin-bottom: 25px;
          }

          .cc-content {
            margin-top: 0;
            color: #fff;
            margin-left: 50px;

            //透明线条
            .border-transparency {
              width: 370px;
              height: 10px;
              border-top: 2px solid rgba(255, 255, 255, 0.4);
            }

            .right-move {
              // margin-left: 25px;
              position: relative;
              top: 0;
              left: 0;
              z-index: 10;
              .content-area {
                position: absolute;
                left: 0;
                top: -0;
                z-index: 10;
              }
              .bg-bottom {
                background-image: url(../../../assets/images/ccloginbottom.png);
                // background-position: 100%;
                background-repeat: no-repeat;
                background-size: 100% 100%;
                width: 240px;
                height: 240px;
                position: absolute;
                left: -70px;
                top: 95px;
                z-index: 1;
              }
            }
          }
        }

        .login-right-form {
          margin-top: 5%;
          margin-left: 5%;
          border-radius: 3vh;
          width: 40%;
          background-color: #fff;
          background: linear-gradient(to bottom right, #7ec6ef, #fff);
          height: 75%;
          .xl:ml-16 {
            margin-right: 4rem;
          }
        }
        @media (max-width: 900px) {
          .login-right-form {
            width: 90%;
            height: 75%;
          }
        }
      }

      .address {
        justify-content: space-evenly;
        height: 40px;
        line-height: 40px;
        color: #fff;
      }

      //
      .@{logo-prefix-cls} {
        display: flex;
        width: 60%;
        height: 80px;

        &__title {
          font-size: 24px;
          color: #fff;
        }

        img {
          width: 48px;
        }
      }
    }

    &-sign-in-way {
      .anticon {
        font-size: 22px;
        color: #888;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    input:not([type='checkbox']) {
      min-width: 360px;

      @media (max-width: @screen-xl) {
        min-width: 320px;
      }

      @media (max-width: @screen-lg) {
        min-width: 260px;
      }

      @media (max-width: @screen-md) {
        min-width: 240px;
      }

      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }

    .ant-divider-inner-text {
      font-size: 12px;
      color: @text-color-secondary;
    }
  }

  .modalCont {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .phoneCont {
    margin-top: 30px;
  }
  .lxfs {
    margin: 0 1rem;
    width: 100px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #bcbcbc;
    border-radius: 15px;
    text-align: center;
    color: #525151;
  }
</style>
