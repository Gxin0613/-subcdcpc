<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <!-- <AppLocalePicker class="absolute text-white top-4 right-4 enter-x xl:text-gray-600" :showText="false" v-if="!sessionTimeout && showLocale" /> -->
    <!-- <AppDarkModeToggle class="absolute top-3 right-7 enter-x" v-if="!sessionTimeout" /> -->

    <span class="-enter-x xl:hidden">
      <AppLogo :alwaysShowTitle="true" />
    </span>

    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full position-center">
        <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12 login-left-log">
          <AppLogo class="-enter-x cc-log" />
          <div class="my-auto cc-content">
            <!-- <img :alt="title" src="../assets/svg/login-box-bg.svg" class="w-1/2 -mt-16 -enter-x" /> -->
            <!-- <div class="mt-10 font-medium text-white -enter-x">
              <span class="inline-block mt-4 text-3xl"> {{ '低代码开发平台/流程中间件 CCFast' }}</span>
            </div>
            <div class="mt-5 font-normal text-white text-md dark:text-gray-500 -enter-x">
              {{ t('sys.login.signInDesc') }}
            </div> -->

            <div class="mt-4 text-3xl" style="font-size: 45px; font-weight: 700">{{'SAAS管理'}}</div>
            <!-- <div class="mt-4 text-3xl" style="font-size: 35px">{{'低代码平台'}}</div> -->
            <div class="mt-4 text-3xl border-transparency"></div>
            <div class="right-move">
              <div class="content-area">
                <div class="mt-4">管理组织：增加、删除、修改组织及信息.</div>
                <div class="mt-4">{{'管理流程：查看组织创建的流程'}}</div>
                <div class="mt-4">{{'管理表单：查看组织创建的表单'}}</div>
              </div>
              <div class="bg-bottom"></div>
            </div>
          </div>
        </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12 login-right-form">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x"
          >
            <LoginForm type="AdminLogin" />
          </div>
        </div>
      </div>
      <div class="flex address">
        <div>地址：济南市高新区.碧桂园凤凰国际A座F19</div>
        <div>{{'电话：0531-82374939,18660153393（微信）'}}</div>
        <div>版权：济南驰骋信息技术有限公司&nbsp;@2003-2022</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { AppLogo } from '/@/components/Application';
  // import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './components/LoginForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });
  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  // const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
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
    //background-image: url(/@/assets/images/ccloginbg.png);
    background-image: url(../../../assets/images/ccloginbg.png);

    background-position: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;

    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin-left: -48%;
      // background-image: url(/@/assets/svg/login-bg.svg);
      // background-position: 100%;
      // background-repeat: no-repeat;
      // background-size: auto 100%;
      content: '';

      @media (max-width: @screen-xl) {
        display: none;
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
                //background-image: url(/@/assets/images/ccloginbottom.png);
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
          border-top-right-radius: 3vh;
          border-bottom-right-radius: 3vh;
          background-color: #fff;
          .xl:ml-16 {
            margin-right: 4rem;
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
</style>
