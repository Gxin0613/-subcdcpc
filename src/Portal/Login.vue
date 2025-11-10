<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>
<script lang="ts" setup>
  import { ref, defineAsyncComponent, type Component } from 'vue';
  // import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import HttpHandler from '../utils/gener/HttpHandler';
  import { setCustomerNoCache,setSysNoCache, getComponent } from '/@/utils/Sys';
  import { useRouter } from 'vue-router';
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });
  const router = useRouter();
  const currentComponent = ref<Component | null>(null);

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
      //记录系统及用户编号
      setCustomerNoCache(sysInfo?.CustomerNo || 'CCFlow');
      setSysNoCache(sysInfo?.SysNo || 'CCFlow')
      const Component = getComponent();
       currentComponent.value = Component;
   
    }
  };
  InitPage();
</script>
