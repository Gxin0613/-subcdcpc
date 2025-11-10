<template> </template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import { IsMobile } from '/@/utils/gener/StringUtils';

  const path = ref();

  const userStore = useUserStore();
  const router = useRouter();
  const InitPage = async () => {
    //企业微信回调，不使用history模式，参数会拼接错误，需要额外处理参数
    const getUrl = window.location.href;
    //获取参数字符串
    const getCodeInfo = getUrl.split('?')[1];
    //获取参数
    const getInfo = new URLSearchParams('?' + getCodeInfo);
    //获取code
    const sysCode = getInfo.get('code');
    //获取state参数
    const sysState = getInfo.get('state')?.replace('#/WeChatEnterprise', '');
    if (sysState) {
      //默认路由
      if (IsMobile()) path.value = '/CCMobilePortal/Home';
      else path.value = '/WF/GL/TodoList';

      //到MyFlow页面
      if (sysState.includes('MyFlow')) {
        const stateInfo = sysState.split('_');
        //const pageName = stateInfo[0];
        const flowNo = stateInfo[1];
        const workid = stateInfo[2];
        if (IsMobile()) path.value = '/CCMobile/MyFlow?WorkID=' + workid + '&FlowNo=' + flowNo + '&FK_Flow=' + flowNo;
        else path.value = '/WF/MyFlow?WorkID=' + workid + '&FlowNo=' + flowNo + '&FK_Flow=' + flowNo;
      }

      //到待办页面
      if (sysState.includes('TodoList')) {
        if (IsMobile()) path.value = '/CCMobile/GenerList?EnName=GL_Todolist&Title=我的待办';
        else path.value = '/WF/GL/TodoList';
      }

      //到其他页面（可扩展）
    }

    //alert(path.value.replace('#/WeChatEnterprise', ''));
    userStore.setToken(''); //清空Token，调用Auto_Login接口时不可以传Token
    //执行验证与免登
    const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
    handler.AddPara('dcode', sysCode);
    handler.AddPara('state', sysState);
    const data = await handler.DoMethodReturnString('Auto_Login');
    if (data.includes('err@')) {
      alert(data);
    } else {
      userStore.setToken(data);
      await userStore.getUserInfoAction<Recordable>();
      //根据state参数，跳转页面

      router.push(path.value.replace('#/WeChatEnterprise', ''));
    }
  };
  InitPage();
</script>
