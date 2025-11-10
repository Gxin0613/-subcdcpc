<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <span class="-enter-x xl:hidden">
      <AppLogo :alwaysShowTitle="true" />
    </span>
    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full position-center">
        <div class="hidden min-h-full pl-4 mr-4 lg:flex lg:flex-col lg:w-13/24">
          <AppLogo class="-enter-x cc-log" />
          <div class="my-auto cc-content">
            <!-- 左侧中部电脑图标 -->
            <img :alt="title" src="/@/assets/svg/login-box-bg.svg" class="w-1/2 -mt-16 -enter-x" />
<!--            <div class="mt-4 text-3xl ccflow_platform">{{ '驰骋低代码BPM - Vue3版本' }}</div>-->
            <div class="mt-4 text-3xl border-transparency"></div>
            <div class="cc-content_product">
              <div class="content-area">
                <div class="platform_services">
                  <div class="mt-4 ccflow_product">纯国产.流程引擎中间件.表单引擎中间件.低代码</div>
                  <div class="mt-4 ccflow_product">大屏.报表.快速开发.OA组件.业务组件</div>
                </div>
                <div class="platform_content">
                  <div class="mt-4 distance">前端支持: Vue3 / Vue2 / React / 原生 / TS</div>
                  <div class="mt-4 distance">后端支持: SpringBoot / SpringMvc / Asp.Net / .NetCore</div>
                  <!-- <div class="mt-4 distance">其他: 微服务 + Redis</div> -->
                  <div class="mt-4 distance">数据库支持: Mysql / SqlServer / Oracle / PG / DM / Kingbase / UX...</div>
                </div>
<!--                <div class="platform_content">-->
<!--                  <div class="mt-4 distance" style="color: #fab99f">{{ '商务:18660153393(同微信)' }}</div>-->
<!--                </div>-->
              </div>
              <div class="bg-bottom"></div>
            </div>
          </div>
        </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12 right_from_login">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x from_login"
          >
            <LoginForm loginType="Single" />
            <!-- <img class="flower" src="../assets/svg/1.png" /> -->
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="saas-install" @click="qywxInstall">
      <img src="/resource/banner/qywx_outline.png" />
      <span>{{'安装到企业微信'}}</span>
    </div> -->
    <!-- 右下角登录白马图标 -->
    <img class="bg" style="" src="/@/assets/images/login.png" />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { AppLogo } from '/@/components/Application';
  import LoginForm from '/@/Portal/login/LoginForm.vue';
    import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  // const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;
  .saas-install {
    position: absolute;
    top: 12px;
    right: 36px;
    z-index: 600;
    display: flex;
    align-items: center;
    color: #1890ff;
    height: 30px;
    border: 2px solid #1890ff;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;

    span {
      line-height: 30px;
    }

    img {
      width: 20px;
      height: 16px;
      margin-right: 8px;
    }
  }
  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        background-image: url(/@/assets/svg/login-bg-dark.svg);
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
      //左侧背景图
      background-image: url(/@/assets/svg/login-bg.svg);
      background-position: 100%;
      background-repeat: no-repeat;
      background-size: auto 100%;
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
      padding-left: 0;
      padding-right: 0;
      .cc-log {
        margin-top: 60px;
      }
      .position-center {
        justify-content: center;
        .right_from_login {
          // margin-left: 20px;
          width: 40%;
          min-width: 350px;

          .from_login {
            // top: -20px;
            margin: auto;
            height: 500;
            background-color: rgba(255, 255, 255, 0.2);
            // box-shadow: 0 0 8px #ddd;
            min-width: 350px;
          }
        }
      }
      .cc-content {
        margin-top: 225px;
        color: #fff;
        // .border-transparency {
        //   margin-top: 25px;
        //   width: 295px;
        //   height: 10px;
        //   border-top: 2px solid rgba(255, 255, 255, 0.4);
        // }
        .ccflow_platform {
          margin-top: 20px;
          font-size: 28px;
          color: #ebebeb;
        }
        .cc-content_product {
          .content-area {
            .platform_services {
              color: #fff;
              .ccflow_product {
                margin-top: 10px;
              }
            }
            .platform_content {
              margin-top: 25px;
              color: #fff;
              .distance {
                margin-top: 5px;
                font-size: 16px;
              }
            }
          }
        }
      }
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

  .bg {
    position: fixed;
    top: 0px;
    right: 0px;
    height: 100%;
    width: auto;
    z-index: -1;
  }
</style>
