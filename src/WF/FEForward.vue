<template>
  <Spin :spinning="loading" size="large" :tip="'正在加载，请稍侯......'">
    <div style="width: 100vw; height: var(--viewport-height)">
      <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }} </div>
    </div>
  </Spin>
</template>
<script setup lang="ts">
  import { Spin } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
  import { reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  // import { getAppEnvConfig } from '../utils/env';
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  const route = useRoute();
  const router = useRouter();

  const userStore = useUserStore();
  onMounted(async () => {
    // const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
    // if (!VITE_GLOB_IS_THIRDPART_SYSTEM) {
    //   errorObj.hasError = true;
    //   errorObj.tips = '此页面仅限三方集成调用';
    //   return;
    // }
    const action = route.query['action'] as string;
    const token = route.query['token'] as string;
    const sToken = route.query['s_token'] as string;
    const flow_no = route.query['flow_no'] as string;
    const FrmID = route.query['FrmID'] as string;
    const DoWhat = route.query['DoWhat'] as string;
    let userInfo;
    if (!action) {
      errorObj.hasError = true;
      errorObj.tips = '未指定页面行为';
      return;
    }
    if (!token) {
      errorObj.hasError = true;
      errorObj.tips = '未提供凭证';
      return;
    }
    if (sToken) {
      userStore.setSToken(sToken);
    }
    if (token) {
      userStore.setToken(token);
      try {
        userInfo = await userStore.fetchUserInfo<Recordable>();
        console.info(userInfo);
        if (userInfo?.code == 500) {
          errorObj.hasError = true;
          errorObj.tips = userInfo?.msg || '获取用户信息失败，请检查token';
          return;
        }
      } catch (e: any) {
        errorObj.hasError = true;
        errorObj.tips = e.toString();
        return;
      }
    }

    switch (action) {
      //待办
      case 'GL_TodoList':
        router.replace('/WF/GenerList?EnName=GL_Todolist');
        break;
      //发起
      case 'GL_Start':
        router.replace('/WF/GenerList?EnName=GL_Start');
        break;
      //近期发起
      case 'GL_RecentStart':
        router.replace('/WF/GenerList?EnName=GL_RecentStart');
        break;
      //近期使用
      case 'GL_RecentWork':
        router.replace('/WF/GenerList?EnName=GL_RecentWork');
        break;
      //在途
      case 'GL_Running':
        router.replace('/WF/GenerList?EnName=GL_Runing');
        break;
      //抄送
      case 'GL_CC':
        router.replace('/WF/GenerList?EnName=GL_CC');
        break;
      //草稿
      case 'GL_Draft':
        router.replace('/WF/GenerList?EnName=GL_Draft');
        break;
      //批处理
      case 'GL_Batch':
        router.replace('/WF/GenerList?EnName=GL_Batch');
        break;
      //表单列表
      case 'FrmTree':
        router.replace('/WF/TreeEns?EnName=TreeEns_FrmSort2Frm');
        break;
      //流程列表
      case 'FlowTree':
        router.replace('/WF/TreeEns?EnName=TreeEns_FlowSort2Flow');
        break;
      //单独流程发起
      case 'MyFlow':
        router.replace('/WF/MyFlow?FlowNo=' + flow_no);
        break;
      //流程二开查询SearchFlow
      case 'DoWhat':
        router.replace('WF/Port?DoWhat=' + DoWhat + '&FlowNo=' + flow_no + '&Token=' + token);
        break;
      //已完结
      case 'GL_Complete':
        router.replace('/WF/GenerList?EnName=GL_Complete');
        break;
      //表单
      case 'MyForm':
        router.replace('/' + FrmID);
        break;
      //设置
      case 'MySetting':
        router.replace('/WF/Comm/En?EnName=TS.User.MySetting&PKVal=' + userInfo.No);
        break;
      //低代码
      case 'CCFast':
        router.replace('/WF/GL/System');
        break;
      //主页图表
      case 'DataV':
        router.replace('/WF/Comm/DataV');
        break;
      //数据源
      case 'Source':
        router.replace('/WF/Comm/TreeEns?EnName=TreeEns_DBSrc');
        break;
      default: {
        errorObj.hasError = true;
        errorObj.tips = `未支持行为: [${action}]`;
      }
    }
  });
</script>
<style lang="less" scoped>
  .modal-iframe {
    width: 100%;
    height: 100%;
  }
</style>
