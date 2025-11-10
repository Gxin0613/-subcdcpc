<template>
  <Spin :spinning="loading" size="large" :tip="'正在加载，请稍侯......'">
    <div style="width: 100vw; height: var(--viewport-height)">
      <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }} </div>
      <div v-else><Component :is="portComponent.component" :params="portComponent.params" /></div>
    </div>
  </Spin>
</template>
<script setup lang="ts">
  import { Spin, message } from 'ant-design-vue';
  import { markRaw, ref } from 'vue';
  import HttpHandler from '../utils/gener/HttpHandler';
  import { reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
  import { useGo } from '../hooks/web/usePage';
  import { useUserStoreWithOut } from '../store/modules/user';
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const router = useRouter();
  const route = useRoute();
  const data = ref({});
  const portComponent = reactive({
    component: {},
    params: {},
  });
  const { loadComponent } = useComponentLoader();
  const go = useGo();
  const InitPage = async () => {
    console.log(route.query);
    try {
      loading.value = true;
      errorObj.hasError = false;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF');
      handler.AddUrlData();
      data.value = await handler.DoMethodReturnString('Port_Init');
      if (data.value.toString().indexOf('err@') == 0 || data.value.toString().indexOf('warning@') == 0) {
        loading.value = false;
        errorObj.hasError = true;
        errorObj.tips = data.value as string;
        console.error(data);
        return;
      }
      console.log(data.value);
      handleRoute();
    } catch (e) {
      loading.value = false;
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
      return;
    } finally {
      loading.value = false;
    }
  };
  const userStore = useUserStoreWithOut();
  const handleRoute = async () => {
    const pageName = data.value['PageName'];
    delete data.value['PageName'];
    let token = data.value['Token'] || '';
    if (!token) {
      token = route.query.token || route.query.Token;
    }
    if (!token) {
      message.error('没有获取到Token值');
      return;
    }
    userStore.token = token;
    await userStore.getUserInfoNotSSOAction();
    switch (pageName) {
      case 'Home': //请求首页
        router.replace('/CCMobilePortal/Home');
        break;
      case 'MyFlow': {
        //查看某条待办
        portComponent.component = markRaw(loadComponent('/@/CCMobile/MyFlow.vue'));
        portComponent.params = data.value;
        break;
      }
      case 'MyFrm':
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Frm.vue'));
        portComponent.params = {
          ...data.value,
          isComponent: true,
          fieldIsReadonly: true,
        };
        break;
      case 'Frm': {
        //查看流程实例某个节点的表单
        portComponent.component = markRaw(loadComponent('/@/CCMobile/CCForm/Frm.vue'));
        portComponent.params = data.value;
        break;
      }
      case 'MyView': {
        //查看某条待办
        portComponent.component = markRaw(loadComponent('/@/CCMobile/MyView.vue'));
        portComponent.params = data.value;
        break;
      }

      case 'MyCC': //我的抄送
        portComponent.component = markRaw(loadComponent('/@/CCMobile/MyCC.vue'));
        portComponent.params = data.value;
        break;

      case 'CC': //我的抄送
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_CC',
        };
        break;

      case 'Start': //发起页面
        router.replace('/WF/GL/Start');
        break;
      case 'Todolist': {
        //待办
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_Todolist',
        };
        break;
      }
      case 'Batch': {
        //批处理
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_Batch',
        };
        break;
      }
      case 'Draft': {
        //草稿
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_Draft',
        };
        break;
      }
      case 'Runing': {
        //在途
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_Runing',
        };
        break;
      }
      case 'MyStartFlows': {
        //在途
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_TARecentStart',
        };
        break;
      }
      case 'RecentWork': //近期
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_RecentWork',
        };
        break;
      case 'En': //实体组件
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Comm/En.vue'));
        portComponent.params = data.value;
        break;
      case 'Search': //查询EnName
    //    debugger;
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Comm/Search.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchEntityNoName': //低代码实体  NoName
        portComponent.component = markRaw(loadComponent('/@/CCFastMobile/SearchEntityNoName.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchBill': //低代码单据  Bill
        portComponent.component = markRaw(loadComponent('/@/CCFastMobile/SearchBill.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchFlow': //流程二开  查询
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Rpt/SearchFlow.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'FlowTree': //流程树
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_FlowSort2Flow',
        };
        break;
      case 'FrmTree': //表单树
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_FrmSort2Frm',
        };
        break;
      case 'Organization': //组织树
        portComponent.component = markRaw(loadComponent('/@/CCMobile/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_Dept2Emp',
        };
        break;
      case 'Default': {
        //流程查询主页
        portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
        portComponent.params = {
          ...data.value,
          EnName: 'GL_Todolist',
        };
        break;
      }
      case undefined: //提示登录成功
        if (typeof data.value == 'string') alert(data.value);
    }
  };
  InitPage();
</script>
<style lang="less" scoped>
  .modal-iframe {
    width: 100%;
    height: 100%;
  }
</style>

<!-- 连接

1. 参考 Port.htm 进行参数的调用处理
-->
