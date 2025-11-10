<template>
  <div class="example">
    <Spin :spinning="loading" size="large">
      <div v-if="errMsg" class="ant-tag-red">{{ errMsg }} </div>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { message, Spin } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import HttpHandler from '../utils/gener/HttpHandler';
  import { getAllRequestParams } from '/@/utils/request/decode';
  //获取url地址？后的值并以对象的形式返回
  const urlParams = getAllRequestParams(window.location.href);
  const router = useRouter();
  const ticket = ref('');
  const loading = ref(true);
  //获取cookie中的CASTGC
  if (urlParams.ticket != '' && urlParams.ticket != 'undefined' && urlParams.ticket != null) {
    //处理ticket值
    const endIndex = urlParams.ticket.indexOf('#');
    ticket.value = urlParams.ticket.substring(0, endIndex);
  }
  const errMsg = ref('');
  const userStore = useUserStore();
  const Init = async (ticket: string) => {
    /** 1. 判断是否是回调？ */
    const isCallBack = ticket;
    if (isCallBack != '' && isCallBack != 'undefined' && isCallBack != null) {
      //执行回调方法.
      //首先判断有没有用户登录信息.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_SSO');
      handler.AddPara('Ticket', isCallBack);
      let data: any = await handler.DoMethodReturnString('SSO_Callback');
      console.log(data);
      if (data.code == 200) {
        userStore.setToken(data.Token);
        message.success('登录成功');
        loading.value = true;
        //去除路径中存在的ticket参数
        const { origin, pathname } = window.location;
        const redirectPath = origin + pathname;
        //SSORedirectPath  1=中间件 0=低代码
        if (data.SSORedirectPath == 1) {
          window.location.replace(redirectPath + 'Middle');
        } else {
          window.location.replace(redirectPath);
        }
      } else {
        const msg = `登录失败或ST无效，${data.msg}`;
        message.error(msg);
        errMsg.value = msg;
      }
      loading.value = false;
      return;
    }
    /** 2. 判断有没有登录信息？ */
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_SSO');
      let data: any = await handler.DoMethodReturnString('SSO_Init');
      if (data.code == 200) {
        //没有登录信息跳转对方的登录页面.
        const url = `${data.SSOPath}login?service=${data.JumpSSOServicePath}`;
        window.location.href = url;
      } else if (data.includes('info@')) {
        //有登录信息直接进入登录页面
        router.push('/');
        return;
      }
    } catch (e: any) {
      message.error(e + ',请重新登录');
    }
  };

  //通过判断urlParams.ticket判断是否有登录信息
  if (urlParams.ticket == null) {
    Init('');
  } else {
    console.log(ticket.value);
    Init(ticket.value);
  }
</script>
<style lang="less" scoped>
  .example {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    :deep(.ant-spin-lg .ant-spin-dot) {
      font-size: 55px;
      .ant-spin-dot-item {
        width: 25px;
        height: 25px;
      }
    }
  }
</style>
