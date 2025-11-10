<template>
  <div :class="prefixCls" class="relative w-full h-full px-4 loginBg">
    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full position-center">
        <div class="hidden min-h-full pl-4 mr-4 lg:flex lg:flex-col lg:w-13/24"> </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12 right_from_login">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x from_login"
          >
            <LoginForm loginType="Single" />
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="saas-install" @click="qywxInstall">
      <img src="/resource/banner/qywx_outline.png" />
      <span>安装到企业微信</span>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import LoginForm from './login/LoginForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRouter } from 'vue-router';

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });
  const router = useRouter();
  const InitPage = async () => {
    //判断是否安装配置的数据库
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const data = await handler.DoMethodReturnJson('Login_Init');
    console.log('数据库安装', data);
    if (data.PageName == 'DBInstall') {
      router.replace({ path: '/DBInstall' });
    } else {
      //根据配置信息去往不同的页面
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      const sysInfo = await handler.DoMethodReturnJson('Login_InitInfo');
      console.log('配置信息', sysInfo);
      if (sysInfo.SaaSModel == '1') {
        router.replace({ path: '/OpLogin' });
        return;
      } else if (sysInfo.OSModel == 2) {
        router.replace({ path: '/SelectOrg' });
        return;
      } else if (sysInfo.OSModel == 1) {
        router.replace({ path: '/GroupLogin' });
        return;
      }
    }
  };
  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const title = computed(() => globSetting?.title ?? '');
  InitPage();
</script>
<style lang="less" scoped>
  .loginBg {
    background-color: #163e84;
    background-image: url('./images/loginBgLogo.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 1920px 1080px;
  }

  @media screen and (max-width: 1600px) {
    .loginBg {
      background-color: #163e84;
      background-image: url('./images/loginBgLogo.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 1500px 843px;
    }
  }
  @media screen and (max-width: 1024px) {
    .loginBg {
      background-color: #163e84;
      background-image: url('./images/loginBgMobile.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 754px 1079px;
    }
  }
</style>
