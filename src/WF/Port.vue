<template>
  <Spin :spinning="loading" size="large" :tip="'正在加载，请稍侯......'">
    <div style="width: 100vw; height: 100vh">
      <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }} </div>
      <div v-else-if="isHttp"> <iframe :src="urlPath" scrolling="auto" frameborder="no" style="width: 100%; height: 100vh"></iframe></div>
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
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { IsMobile, parsePathParams } from '/@/utils/gener/StringUtils';
  import { Menu } from '../CCFast/GPM/CCMenu/Menu';
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const router = useRouter();
  const route = useRoute();
  const data = ref<any>({});

  //自定义链接
  const isHttp = ref(false);
  const urlPath = ref('');

  const portComponent = reactive({
    component: {},
    params: {},
  });
  const { loadComponent } = useComponentLoader();
  const go = useGo();
  const InitPage = async () => {
    // console.log(route.query);

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
        if (IsMobile()) {
          router.replace('/CCMobilePortal/Home');
        } else {
          router.replace('/WF/GL/Start');
        }
        break;
      case 'MyView': {
        //查看某条待办
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/MyView.vue'));
          portComponent.params = data.value;
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/MyView.vue'));
          if (!data.value['FK_Node'] || data.value['FK_Node'] == '0') data.value['FK_Node'] = route.query?.FK_Node;
          data.value['NodeID'] = data.value['FK_Node'];
          data.value['WorkID'] = route.query?.WorkID;
          if (!data.value['FK_Flow']) {
            data.value['FK_Flow'] = route.query?.FK_Flow;
          }

          portComponent.params = data.value;
        }

        break;
      }
      case 'MyFrm':
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/Frm.vue'));
          portComponent.params = {
            ...data.value,
            isComponent: true,
            fieldIsReadonly: true,
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/Frm.vue'));
          portComponent.params = {
            ...data.value,
            isComponent: true,
            fieldIsReadonly: true,
          };
        }

        break;
      case 'Frm': {
        //查看流程实例某个节点的表单
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/CCForm/Frm.vue'));
          portComponent.params = data.value;
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/CCForm/Frm.vue'));
          portComponent.params = data.value;
        }
        break;
      }

      case 'MyFlow': //发起流程
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/MyFlow.vue'));
          portComponent.params = data.value;
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/MyFlow.vue'));
          portComponent.params = data.value;
        }
        break;

      case 'MyCC': //我的抄送
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/MyCC.vue'));
          portComponent.params = data.value;
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/MyCC.vue'));
          portComponent.params = data.value;
        }

        break;
      case 'CC': //我的抄送
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_CC',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_CC',
          };
        }

        break;
      case 'HuiQianList': //会签主持人列表
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_HuiQianList',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_HuiQianList',
          };
        }

        break;

      case 'Start': //发起页面
        // router.replace('/WF/GL/Start');
        //待办
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Start',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Start',
          };
        }
        break;
      case 'Todolist': {
        //待办
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Todolist',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Todolist',
          };
        }

        break;
      }
      case 'Draft': {
        //草稿
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Draft',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Draft',
          };
        }

        break;
      }
      case 'Runing': {
        //在途
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Runing',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Runing',
          };
        }
        break;
      }
      case 'Complete': {
        //已完成
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Complete',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Complete',
          };
        }
        break;
      }
      case 'Batch': {
        //批处理
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Batch',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_Batch',
          };
        }
        break;
      }
      case 'HomePage': {
        //DataV页面
        portComponent.component = markRaw(loadComponent('/@/views/data_visualization/index.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      }
      case 'MyStartFlows': {
        //我的发起
        delete data.value['EnsName'];
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_TARecentStart',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_TARecentStart',
          };
        }
        break;
      }
      case 'RecentWork': //近期
        if (IsMobile()) {
          portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'GL_RecentWork',
          };
        } else {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            EnName: 'GL_RecentWork',
          };
        }
        break;
      case 'HungupList': //挂起
        portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
        portComponent.params = {
          EnName: 'GL_HungupList',
        };
        break;
      case 'GenerList': //GL
        portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
        portComponent.params = data.value;
        break;
      case 'TreeEns': //TreeEns
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/TreeEns.vue'));
        portComponent.params = data.value;
        break;
      case 'FlowTree': //流程树
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_FlowSort2Flow',
        };
        break;
      case 'Track': //轨迹  /WF/Port?DoWhat=Vue3Track&FK_Flow=007&WorkID=123&Token=xxssxxss
        portComponent.component = markRaw(loadComponent('/@/WF/WorkOpt/OneWork.vue'));
        portComponent.params = data.value;
        break;
      case 'FrmTree': //表单树
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_FrmSort2Frm',
        };
        break;
      case 'Organization': //组织树
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/TreeEns.vue'));
        portComponent.params = {
          EnName: 'TreeEns_Dept2Emp',
        };
        break;
      case 'Designer':
        if (!!data.value['FlowNo'] || !!data.value['FK_Flow']) {
          //流程设计器
          portComponent.component = markRaw(loadComponent('/@/WF/Admin/FlowDesigner/index.vue'));
          // portComponent.component = markRaw(loadComponent('/@/WF/Comm/En.vue'));
          // ?EnName=TS.WF.FD.FlowJiJian&PKVal=206
          portComponent.params = data.value;
        } else if (!!data.value['FrmID']) {
          //表单设计器
          portComponent.component = markRaw(loadComponent('/@/WF/Admin/FormContainer/index.vue'));
          portComponent.params = data.value;
        }
        break;
      case 'En': //实体组件
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/En.vue'));
        portComponent.params = data.value;
        break;
      case 'GroupPageNew': //新建组件
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/UIEntity/GroupPageNew.vue'));
        portComponent.params = data.value;
        break;

      case 'Search': //查询EnName
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/Search.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchEntityNoName': //低代码实体  NoName
        portComponent.component = markRaw(loadComponent('/@/CCFast/CCBill/SearchEntityNoName.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'NewEntityNoName': //低代码实体列表新增  NoName
        portComponent.component = markRaw(loadComponent('/@/CCFast/CCBill/MyEntityNoName.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchBill': //低代码单据  Bill
        portComponent.component = markRaw(loadComponent('/@/CCFast/CCBill/SearchBill.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchFlow': //流程二开  查询
        portComponent.component = markRaw(loadComponent('/@/WF/Rpt/SearchFlow.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SearchDBList': //Search视图
        portComponent.component = markRaw(loadComponent('/@/CCFast/CCBill/SearchDBList.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'TreeEnsDBView': //TreeEns视图
        portComponent.component = markRaw(loadComponent('/@/CCFast/DBView/TreeEnsDBView.vue'));
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'SelfUrl': //自定义链接
        try {
          const en = new Menu();
          en.No = data.value?.No;
          await en.RetrieveFromDBSources();
          if (en.UrlExt.startsWith('http://') || en.UrlExt.startsWith('https://')) {
            isHttp.value = true;
            urlPath.value = en.UrlExt;
          } else {
            const page = en.UrlPath;
            const params = parsePathParams(en.UrlExt);
            portComponent.component = markRaw(loadComponent(page));
            portComponent.params = {
              ...params,
              ...data.value,
            };
          }
        } catch (e: any) {
          message.error(e.toString());
          console.trace(e);
        }
        break;
      case 'WorkCheck': //审核组件
        portComponent.component = markRaw(loadComponent('/@/WF/WorkOpt/WorkCheck.vue'));
        portComponent.params = {
          ...data.value,
          DoWhat: 'WorkCheck',
        };
        break;
      case 'GeneralFixed': //高代码  通过 FixedUrl区分高代码页面，分别处理
        switch (data.value?.FixedUrl) {
          case 'Search':
            portComponent.component = markRaw(loadComponent('/@/WF/Comm/Search.vue'));
            portComponent.params = {
              ...data.value,
            };
            break;
          case 'DataV':
            portComponent.component = markRaw(loadComponent('/@/views/data_visualization/index.vue'));
            portComponent.params = {
              ...data.value,
            };
            break;
          default:
            break;
        }
        break;
      case 'Component': //通用组件
        if (data.value?.EnName.startsWith('GL_')) {
          portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
          portComponent.params = {
            EnName: data.value?.EnName,
          };
        } else if (data.value?.EnName.startsWith('GPN_')) {
          portComponent.component = markRaw(loadComponent('/@/WF/Comm/UIEntity/GroupPageNew.vue'));
          portComponent.params = {
            EnName: data.value?.EnName,
            SortNo: data.value?.SortNo || '',
          };
          break;
        } else if (data.value?.EnName.startsWith('TS.')) {
          portComponent.component = markRaw(loadComponent('/@/WF/Comm/En.vue'));
          portComponent.params = {
            EnName: data.value?.EnName,
            PKVal: data.value?.PKVal || '',
          };
        } else if (data.value?.EnName.startsWith('TreeEns_')) {
          portComponent.component = markRaw(loadComponent('/@/WF/Comm/TreeEns.vue'));
          portComponent.params = {
            EnName: data.value?.EnName,
          };
        }
        break;
      case 'DtlSearch':
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/Dtl/DtlSearch.vue'));
        for (let key in data.value) {
          if (data.value[key] === 'null') {
            data.value[key] = '';
          }
        }
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'DtlBatch':
        portComponent.component = markRaw(loadComponent('/@/WF/Comm/Dtl/DtlBatch.vue'));
        console.log('data', data.value);
        for (let key in data.value) {
          if (data.value[key] === 'null') {
            data.value[key] = '';
          }
        }
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'RptWhite':
        portComponent.component = markRaw(loadComponent('/@/CCFast/components/RptWhite.vue'));
        console.log('data', data.value);
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'Dtl':
        portComponent.component = markRaw(loadComponent('/@/WF/CCForm/Dtl.vue'));
        console.log('data', data.value);
        portComponent.params = {
          ...data.value,
        };
        break;
      case 'Default': //流程查询主页
        if (route.query.DoWhat == 'FlowSearch') {
          portComponent.component = markRaw(loadComponent('/@/WF/Comm/Search.vue'));
          portComponent.params = {
            ...data.value,
            EnName: 'TS.FlowData.GenerWorkFlowView',
          };
          break;
        } else {
          if (IsMobile()) {
            portComponent.component = markRaw(loadComponent('/@/CCMobile/GenerList.vue'));
            portComponent.params = {
              ...data.value,
              EnName: 'GL_Todolist',
            };
          } else {
            portComponent.component = markRaw(loadComponent('/@/WF/views/GenerList.vue'));
            portComponent.params = {
              ...data.value,
              EnName: 'GL_Todolist',
            };
          }
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
