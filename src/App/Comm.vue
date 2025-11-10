<template>
  <div></div>
</template>
<script lang="ts" setup>
  import * as dd from 'dingtalk-jsapi';
  import { ref, createVNode, onMounted } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { useRoute, useRouter } from 'vue-router';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  // import Vconsole from 'vconsole';
  import { getAppEnvConfig } from '/@/utils/env';

  // new Vconsole();
  const { VITE_GLOB_DINGTALK } = getAppEnvConfig();

  const userStore = useUserStore();
  const router = useRouter();
  //setCookie('GJPT-AppNo', appNo.value, 1);
  //setCookie('GJPT-Token', 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxNTc3NiwidXNlcl9rZXkiOiI0MjZiNDNjMS1jNTVlLTQ0MDUtYTRjOS01ZDg5YzYyOTY4ODgiLCJ1c2VybmFtZSI6InpoYW5nbWlhbyJ9.WImX1KaxlcxlK_P6Ex1Etk-jRxzeJUPr_lF_ZViE8QFzyY89NdiwW1wZeBR9g4NsK0HKK7kMvUufb72jN2riCA', 1);
  //const GJPT_Token=getCookie('GJPT-Token');
  const path = ref();
  const InitPage = async () => {
    const route = useRoute();
    const zappNo = route.query.zappNo as string;
    const appNo = route.query.appNo as string;
    const formType = route.query.formType as string;
    const userName = route.query.userName as string;
    const GJPT_Token = route.query.GJPTToken as string;
    if (GJPT_Token == '' || GJPT_Token == null || GJPT_Token == undefined) {
      Modal.confirm({
        content: `登录凭证已失效.`,
        icon: createVNode(ExclamationCircleOutlined),
        okText: '确定',
        onOk() {
          //router.push(path.value);
        },
      });
    } else {
      try {
        const handler = new HttpHandler('bp.App.Handler.AppHandler');
        handler.AddPara('ry-token', GJPT_Token);
        handler.AddPara('appNo', appNo);
        const data = await handler.DoMethodReturnString('autoLoginWithRy');
        //将appNo保存到本地
        localStorage.setItem('GJPT-AppNo', appNo);
        //将GJPT-Token保存到本地
        localStorage.setItem('ry-token', GJPT_Token);
        localStorage.setItem('GJPT-UserName', userName);

        userStore.setToken(data);
        if (formType == 'pc') {
          path.value = '/WF/Comm/DataV';
          router.push(path.value);
        } else {
          localStorage.setItem('GJPT-ZAppNo', zappNo);
          if (appNo == '66138-410116-95714') {
            //自定义页面
            // 进了vue页面，参数
            router.push('/CCMobile/Tabs?EnName=Tabs_HNApp');
          } else {
            path.value = '/CCMobilePortal/Home?skipPlatformCheck=1&Token=' + data;
            router.push(path.value);
          }
        }
      } catch (error: any) {
        Modal.confirm({
          content: error,
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确定',
          onOk() {
            //router.push(path.value);
          },
        });
        return;
      }
    }
  };
  onMounted(async () => {
    await InitPage();
  });
</script>
