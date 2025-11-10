<template>
  <div></div>
</template>
<script lang="ts" setup>
  import * as dd from 'dingtalk-jsapi';
  import { ref, createVNode } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { setCookie } from '/@/utils/storage';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  // import Vconsole from 'vconsole';
  import { getAppEnvConfig } from '/@/utils/env';

  // new Vconsole();
  const { VITE_GLOB_DINGTALK } = getAppEnvConfig();
  const urlParams = getAllRequestParams(window.location.href);

  const workId = ref(urlParams.workId);
  const fk_flow = ref(urlParams.fk_flow);
  const actionType = ref(urlParams.actionType);
  const formType = ref(urlParams.formType);
  console.log('corpId', VITE_GLOB_DINGTALK);
  const userStore = useUserStore();
  const router = useRouter();
  const path = ref();
  setCookie('todo', actionType.value, 5);
  const InitPageDingDing = () => {
    console.log('进入钉钉');
    if (dd.env.platform !== 'notInDingTalk') {
      dd.ready(() => {
        console.log('进入钉钉 dd.ready');
        //获取钉钉企业ID
        dd.runtime.permission
          .requestAuthCode({
            // corpId: 'dinge23bff471f2814fa',
            corpId: VITE_GLOB_DINGTALK,
          })
          .then(
            async (onSuccess: any) => {
              console.log('进入钉钉 success');
              const randomCode = onSuccess.code;
              const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile');
              handler.AddPara('rcode', randomCode);
              const data = await handler.DoMethodReturnString('getDingTalkUserInfo');
              userStore.setToken(data);
              //const Todo = getCookie('todo');
              if (actionType.value == 'todo') {
                setCookie('todo', '', 5);
                //判断当前人员是否有权限处理当前工作，不存在让其跳转到在途页面
                const handler = new HttpHandler('BP.WF.HttpHandler.WF');
                handler.AddPara('WorkID', workId.value);
                const data: any = await handler.DoMethodReturnJson('Flow_IsCanDo');
                const isCanDo = JSON.parse(data).isCanDo;
                alert(isCanDo);
                if (isCanDo) {
                  path.value = '/CCMobile/MyFlow?WorkID=' + workId.value + '&FlowNo=' + fk_flow.value + '&FK_Flow=' + fk_flow.value + '&skipPlatformCheck=1';
                  router.push(path.value);
                } else {
                  path.value = '/CCMobile/GenerList?EnName=GL_Runing&Title=在途&skipPlatformCheck=1';
                  Modal.confirm({
                    content: '您无权限处理当前工作，点击确定进入在途页面.',
                    icon: createVNode(ExclamationCircleOutlined),
                    okText: '确定',
                    onOk() {
                      router.push(path.value);
                    },
                    // cancelText: '取消',
                    // onCancel() {
                    //   Modal.destroyAll();
                    // },
                  });
                }
                // if (IsMobile()) {

                // } else {
                //   path.value = '/WF/MyFlow?WorkID=' + workId.value + '&FlowNo=' + fk_flow.value + '&FK_Flow=' + fk_flow.value;
                //   router.push(path.value);
                // }
              } else {
                if (formType.value == 'pc') {
                  path.value = '/Middle/GenerList?EnName=GL_Todolist';
                  router.push(path.value);
                } else {
                  path.value = '/CCMobilePortal/Home?skipPlatformCheck=1';
                  router.push(path.value);
                }

                // if (IsMobile()) {

                // } else {
                //   path.value = '/WF/GL/TodoList';
                //   router.push(path.value);
                // }
              }
            },
            (onFail: any) => {
              alert('err: ' + JSON.stringify(onFail));
            },
          );
      });
      dd.error((error) => {
        alert('err1: ' + JSON.stringify(error));
      });
    }
  };
  InitPageDingDing();
</script>
