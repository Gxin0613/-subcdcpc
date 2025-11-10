<!--不需要登录展示-->
<template>
  <iframe v-if="url" :src="url" scrolling="auto" frameborder="no" style="width: 100%; height: calc(100vh - 70px)"></iframe>
</template>
<script setup name="ceshi">
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';

  import {
    Flow_MyFlowByFlowNo,
    Menu_Flow_Start,
    Menu_Flow_Todolist,
    Menu_Flow_Runing,
    Menu_Flow_Nearly,
    Menu_Flow_Complate,
    Menu_Flow_CC,
    Menu_Flow_Draft,
    Menu_Flow_Msg,
    Menu_Flow_Search,
    Menu_Admin_Flows,
    Menu_Admin_Frms,
    EntityBill_Search,
    Flow_Search,
    Menu_Admin_Orgs,
    Menu_Admin_DBSrc,
    EntityNoName_Search,
    MySettingMenu,
    RptWhiteView,
    FixedUrl_Search,
    DataVUrl_Search,
    LcUrl_Search,
    LcUrl_SelfUrl,
    GLDBViewUrl_SelfUrl,
    TreeEnsDBViewUrl_SelfUrl,
    SearchBillViewUrl_SelfUrl,
    RptBlueView,
  } from './Dev2UrlInterface';

  import {ref} from "vue";
  import BSEntity from "/@/utils/gener/BSEntity.js";
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const url = ref('');

   function getRequestParams(key) {
    if (!window) {
      return '';
    }
    const str = window.location.href;
    if (!str.includes('?')) {
      return '';
    }
    const args = str.substring(1, str.length).split('?')[1].split('&');
    for (const arg of args) {
      const [k, v] = arg.split('=');
      if (k === key) return v;
    }
    return '';
  }


 async function InitPage() {
     // console.log(userStore.getToken);
    let formId = route.meta.urlQuery.formId;
     let menuType = route.meta.urlQuery.menuType;
     let token = userStore.getToken;
     let query = route.meta.urlQuery;
      query.token = token;
     // let token = "7bc083e18037489f9163e52a78422ea3";
     // let host = "";
     url.value = '';

    //方案一:通过路由直接拼接路径跳转Port页面.
    // const queryString= QueryMerge(route.query);
    // const host = 'http://localhost:3009'
    //url = `${host}/#/WF/Port?${queryString}&token=${Token}`;
    //方案二:直接使用配置好的路径，使Port路径使用的更加明显.
   //字典查询
    const sfTable = new BSEntity('BP.Sys.SFTable','child_host_server_ip');
    await sfTable.Retrieve();
    const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
    ens.forEach(async (en) => {
      if(en.No == menuType){
        query.host = en.Name;
      }
    });
   switch (query.action) {
     case 'Start':  //发起
       url.value = Menu_Flow_Start(query)
       break;
     case 'todo':   //待办
      url.value = Menu_Flow_Todolist(query)
       break;
     case 'runing':  //在途
      url.value = Menu_Flow_Runing(query)
       break;
     case 'recent':  //近期
      url.value = Menu_Flow_Nearly(query)
       break;
     case 'complete': //已完成
      url.value = Menu_Flow_Complate(query)
       break;
     case 'cc':  //抄送
      url.value = Menu_Flow_CC(query)
       break;
     case 'draft':  //草稿
      url.value = Menu_Flow_Draft(query)
       break;
     case 'info':  //消息
      url.value = Menu_Flow_Msg(query)
       break;
     case 'searchall':  //综合查询
      url.value = Menu_Flow_Search(query)
       break;
     case 'flowlist':  //流程
      url.value = Menu_Admin_Flows(query)
       break;
     case 'formlist':  //表单
      url.value = Menu_Admin_Frms(query)
       break;
     case 'oragn':  //组织
      url.value = Menu_Admin_Orgs(query)
       break;
     case 'dblist':  //数据源
      url.value = Menu_Admin_DBSrc(query)
       break;
     case 'Flow':  //发起具体流程
       // const id = getRequestParams("id");
      url.value = Flow_MyFlowByFlowNo(query)
       break;
     case 'EntityBill':  //单据
      url.value = EntityBill_Search(query);
       break;
     case 'EntityNoName':  //实体
      url.value = EntityNoName_Search(query);
       break;
     case 'refflow':  //关联流程
       // const flowno = getRequestParams("flowno");
      url.value = Flow_Search(query);
       break;
     case 'Setting':  //我的设置
      url.value = MySettingMenu(query)
       break;
     case 'RptWhite':  //白色大屏
      url.value = RptWhiteView(query)
       break;
     case 'FixedUrl':  //高代码 实体查询
      url.value = FixedUrl_Search(query)
       break;
     case 'DataVUrl':  //高代码  白色大屏
      url.value = DataVUrl_Search(query)
       break;
     case 'linkflowfunc':  //流程菜单
      url.value = LcUrl_Search(query)
       break;
     case 'SelfUrl':  //自定义链接
      url.value = LcUrl_SelfUrl(query)
       break;
     case 'SearchBillView':  //分页视图
      url.value = SearchBillViewUrl_SelfUrl(query)
       break;
     case 'GLDBView':  //列表视图
      url.value = GLDBViewUrl_SelfUrl(query)
       break;
     case 'TreeEnsDBView':  //左树右表视图
      url.value = TreeEnsDBViewUrl_SelfUrl(query)
       break;
     case 'RptBlue':  //蓝色大屏
      url.value = RptBlueView(query)
       break;
     default:
       alert('暂不支持此菜单敬请期待!');
       break;
   }

    // url.value = `${host}/#/WF/Port?DoWhat=EntityNoName&FrmID=${formId}&token=${token}`;
    // console.log(url.value);
  }

  InitPage();
</script>
