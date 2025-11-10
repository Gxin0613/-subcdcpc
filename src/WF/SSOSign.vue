<template>
  <Loading v-if="loading === true" />
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { showFailToast, Loading } from 'vant';
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { url } from 'inspector';
  import DBAccess from '../utils/gener/DBAccess';
  const route = useRoute();
  const query = route.query || {};
  const loading = ref(false);
  const User = ref(query.User as string);
  const AppNO = ref(query.AppNO as string);
  const IsTitle = ref(query.IsTitle as string);
  const timestamp = ref(query.timestamp as string);
  const DoWhat = ref(query.DoWhat as string);
  const MainPath = ref(query.MainPath as string);
  const FrmID = ref(query.FrmID as string);
  const sign = ref(query.sign as string);
  const userStore = useUserStore();
  const router = useRouter();
  const PKVal = ref(query.PKVal as string);
  const EnName = ref(query.EnName as string);
  const WorkID = ref(query.WorkID as string);
  const FID = ref(query.FID as string);
  const NodeID = ref(query.FK_Node as string);
  const FlowNo = ref(query.FK_Flow as string);
  /**
   * 通过账号加签免登录
   * 传递的参数
   *   1.User      登录账号
   *   2.AppNO     取值:低代码=》系统=》应用编号
   *               作用：只展示指定系统中的菜单
   *               注意：项目中的图标和编号对应，存储位置：public\resource\CCFast\AppNo\编号.png
   *   3.IsTitle   取值：1：显示顶部菜单   0:不显示顶部菜单
   *               注意：顶部菜单=》左边：发起，待办***  右边：低代码，流程，表单*****
   *   4.timestamp 时间戳 (毫秒时间戳)
   *               注意： 会有时效校验：不能超过1分钟
   *   5.sign      加签值 
   *               注意： 需双方约定好秘钥值(localKey)
   *               组合： User_timestamp
                   取值：MD5根据秘钥对组合进行加密 sign= md5(User_timestamp,localKey)

   *  6.DoWhat     登录后跳转的页面
                   空：首页 
                   非空：页面分类 (AppNO,IsTitle 可以为空)
                      NewEntityNoName： 实体新增页面
                      todoList: 待办页面

      7.FrmID      实体id 
                     DoWhat=NewEntityNoName      传实体id
                     DoWhat=todoList             可以为空

      8.MainPath    首页数据路由
                    空：      默认路由地址
                    菜单路由： 
                      路由的获取方式：
                      例（点击左侧菜单时，地址栏展示URL如下）：
                      http://localhost:3001/#/8395-43010-1114136/841312-41592-85137
                      路由地址：8395-43010-1114136/841312-41592-85137 
   * @constructor
   */
  const InitPage = async () => {
    try {
      debugger;
      loading.value = true;
      const token = userStore.token;
      if (token) {
        await userStore.logout();
      }
      if (User.value && timestamp.value && sign.value) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_SSO');
        handler.AddPara('User', User.value);
        handler.AddPara('timestamp', timestamp.value);
        handler.AddPara('sign', sign.value);
        const data = await handler.DoMethodReturnString('SSO_SignLogin');
        loading.value = false;
        if (data.includes('err@')) {
          showFailToast(data);
        } else {
          userStore.setToken(data);
          if (AppNO.value) {
            //将appNo保存到本地
            localStorage.setItem('AppNo', AppNO.value);
          }
          if (IsTitle.value) {
            localStorage.setItem('IsTitle', IsTitle.value);
          }

          let newUrl = window.location.origin;
          if (DoWhat.value) {
            let host = newUrl + '/#/WF/Port';
            if (DoWhat.value == 'NewEntityNoName') {
              const handler = new HttpHandler('BP.CCBill.WF_CCBill');
              handler.AddPara('FrmID', FrmID.value);
              const num = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
              let turl = `${host}?DoWhat=NewEntityNoName&No=${num}&FrmID=${FrmID.value}&Token=${data}`;
              newUrl = turl;
            } else if (DoWhat.value == 'todoList') {
              newUrl = `${host}?DoWhat=Component&EnName=GL_Todolist&token=${data}`;
            } else if (DoWhat.value == 'MyView') {
              newUrl = `${host}?DoWhat=MyView&WorkID=${WorkID.value}&FID=${FID.value}&FK_Node=${NodeID.value}&NodeID=${NodeID.value}&token=${data}&FlowNo=${FlowNo.value}`;
            } else if (DoWhat.value == 'En') {
              newUrl = `${host}?DoWhat=En&PKVal=${PKVal.value}&EnName=${EnName.value}&token=${data}`;
            }
          }
          if (MainPath.value) {
            newUrl = window.location.origin + '/#/' + MainPath.value;
          }
          if (newUrl == window.location.origin) {
            newUrl = window.location.origin + '/#/WF/Comm/DataV';
          }

          window.location.replace(newUrl);
          return;
        }
      }
      if (typeof window !== 'undefined') {
        window.location.replace('');
        return;
      }
    } catch (e) {
      showFailToast(e);
      return;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>

<style scoped></style>
