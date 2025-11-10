<template>
  <div></div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { getAllRequestParams } from '../utils/request/decode';

  const userStore = useUserStore();
  // console.log('query', route.query);
  const getUrl = window.location.href;
  // console.log('href', getUrl);
  const urlParams = getAllRequestParams(getUrl);
  // console.log('window.location', cloneDeep(window.location));
  // console.log('urlParams', urlParams);
  // console.log('urlParams.code', urlParams?.code);

  // alert(getInfo);
  const InitPage = async () => {
    //企业微信第三方应用用户授权回调处理，不使用history模式，参数会拼接错误，需要额外处理参数
    //获取code
    const sysCode = urlParams?.code;
    //获取state参数
    const sysState = urlParams.state?.replace('#/wechat_redirect', '');
    userStore.setToken(''); //清空Token，调用Auto_Login接口时不可以传Token
    //执行验证与免登
    const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
    handler.AddPara('dcode', sysCode);
    handler.AddPara('state', sysState);
    const data = await handler.DoMethodReturnString('Auto_Oauth2Login');
    if (data.includes('err@')) {
      alert(data);
    } else {
      userStore.setToken(data);
      await userStore.getUserInfoAction<Recordable>();
      //根据state参数，跳转页面
      window.location.href = 'http://qywx.ccbpm.cn';
    }
  };
  //企业微信后台直接进入业务设置
  const InitAuthCodePage = async () => {
    const auth_code = urlParams?.auth_code || '';
    userStore.setToken(''); //清空Token，调用Auto_Login接口时不可以传Token
    //执行验证与免登
    const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
    handler.AddPara('auth_code', auth_code.replace('#/WeChatOauth2', ''));
    const data = await handler.DoMethodReturnString('Auto_AuthCodeLogin');
    if (data.includes('err@')) {
      alert(data);
    } else {
      userStore.setToken(data);
      await userStore.getUserInfoAction<Recordable>();
      //根据state参数，跳转页面
      window.location.href = 'http://qywx.ccbpm.cn';
    }
  };
  onMounted(() => {
    const token = userStore.getToken;
    const getUrl = window.location.href;
    //登录过
    if (token) {
      window.location.href = 'http://qywx.ccbpm.cn';
    } else {
      //企业微信后台直接进入业务设置
      if (getUrl.indexOf('auth_code') != -1) {
        console.log('没有token，但存在auth_code');
        InitAuthCodePage();
      } else if (getUrl.indexOf('code') == -1) {
        console.log('没有token，且没有code');
        //第一次进入，进行授权跳转处理
        // const handler = new HttpHandler('BP.WF.HttpHandler.WF_SSO');
        // const suite_id = await handler.DoMethodReturnJson<Recordable>('GetSuiteID');
        const suite_id = 'wxf3b7bd3e5082decd';
        // const rurl = encodeURIComponent('http://qywx.ccbpm.cn/#/WeChatOauth2');
        const rurl = encodeURIComponent('http://qywx.ccbpm.cn?DoWhat=WeChatOauth2');
        console.log('redirect url: ', rurl);
        let href =
          'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + suite_id + '&redirect_uri=' + rurl + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
        console.log('before auth:', href);
        setTimeout(() => {
          console.log('start jump');
          window.location.href = href;
        });
      } else {
        console.log('存在code');
        //授权后回调处理
        InitPage();
      }
    }
  });
</script>
