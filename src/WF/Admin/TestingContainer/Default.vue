<template>
  <div style="overflow: hidden">
    <Spin :spinning="loading" style="background-color: white; overflow: hidden">
      <Layout style="min-height: 100vh; background-color: white">
        <LayoutSider width="230" style="background: #fff; border-right: 1px solid rgb(220, 227, 232); position: relative">
          <UserInfo
            v-if="userInfoVisible"
            :UserNo="userInfo.No"
            :UserName="userInfo.Name"
            :DeptName="userInfo.DeptName"
            :WorkID="workID"
            @changeFrameSrc="changeFrameSrc"
            @changeUserInfo="changeUserInfo"
            ref="user"
          />
        </LayoutSider>
        <Layout>
          <LayoutContent>
            <TestFlow v-if="currPage === 'FlowTester'" :FlowNo="route.query.FlowNo" @changeFrameSrc="changeFrameSrc" @changeUserInfo="changeUserInfo" />
            <FlowInstance v-if="currPage === 'FlowInstance'" :key="componentKey" :WorkID="curWorkID || workID" :FlowNo="route.query.FlowNo" @changeFrameSrc="changeFrameSrc" @changeUserInfo="changeUserInfo" />
            <GenerList
              v-if="currPage === 'SelectGWF'"
              :params="{ EnName: 'GL_SelectGWF', FlowNo: route.query.FlowNo, TesterNo: route.query.TesterNo }"
              @changeFrameSrc="changeFrameSrc"
              @changeUserInfo="changeUserInfo"
            />
            <FlowInstances v-if="currPage === 'FlowInstances'" :WorkID="workID" :FlowNo="route.query.FlowNo" :UserNo="getAuthCache(TESTER_KEY)" @changeFrameSrc="changeFrameSrc" />
            <En v-if="currPage === 'En'" :PKVal="workID" EnName="TS.FlowData.GenerWorkFlowExt" />
            <!-- <iframe v-if="currPage === 'MyFlow' && frameSrc != ''" :src="frameSrc" ref="frameRef" style="width: 100%; height: 100vh" scrolling="no"></iframe> -->
            <MyFlow v-if="currPage === 'MyFlow' && ready" :params="flowParams" />
            <div v-if="currPage === 'CCMobileMyFlow' && ready" style="margin: auto; width: 40%">
              <MobilePreview :url="mobilePreviewUrl" />
            </div>
            <component v-if="ready && !!frameSrc && currPage === 'StartGuide'" :is="loadComponent(frameSrc)" :params="getAllRequestParams(frameSrc)" />
          </LayoutContent>
        </Layout>
      </Layout>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { Layout, LayoutContent, LayoutSider, message, Spin } from 'ant-design-vue';
  import UserInfo from './UserInfo.vue';
  // 父组件传过来的属性
  import { reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { useRoute } from 'vue-router';
  import FlowInstance from '/@/WF/Admin/TestingContainer/FlowInstance.vue';
  import FlowInstances from '/@/WF/Admin/TestingContainer/FlowInstances.vue';
  import GenerList from '/@/WF/views/GenerList.vue';
  import En from '/@/WF/Comm/En.vue';
  import MyFlow from '/@/WF/MyFlow.vue';
  import TestFlow from '/@/WF/Admin/TestingContainer/TestFlow.vue';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { ADMIN_TOKEN_KEY, TESTER_KEY, TOKEN_KEY } from '/@/enums/cacheEnum';
  import { usePostMessage } from '/@/hooks/message/usePostMessage';
  import { ccbpm } from '/#/ccbpm';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import MobilePreview from '/@/WF/Admin/FoolFormDesigner/components/design/MobilePreview.vue';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { GloComm } from '../../Comm/GloComm';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { cloneDeep } from 'lodash';
  const { loadComponent } = useComponentLoader();
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const userInfo = reactive({
    No: '',
    Name: '',
    DeptName: '',
  });
  const route = useRoute();
  // const router = useRouter();
  const userStore = useUserStoreWithOut();
  const currPage = ref<string>('MyFlow');
  //发起流程的WorkID
  const workID = ref(0);

  //iframe
  const frameSrc = ref('');

  // 流程参数
  const ready = ref(false);
  const flowParams = ref({});

  const mobilePreviewUrl = ref('');

  /**
   * 管理员登录
   * @constructor
   */
  const AdminLogin = async () => {
    //让管理员登录
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
    handler.AddPara('Token', getAuthCache(ADMIN_TOKEN_KEY));
    const data = await handler.DoMethodReturnString('Default_LetAdminerLogin');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    //获取当前用户的信息
    setAuthCache(TOKEN_KEY, getAuthCache(ADMIN_TOKEN_KEY));
  };
  const hideLoading = ref(false);
  const InitPage = async () => {
    try {
      loading.value = true;
      if (!!route.query.TesterNo) setAuthCache(TESTER_KEY, route.query.TesterNo);
      if (!route.query['CurrPage']) {
        const adminToken = getAuthCache(ADMIN_TOKEN_KEY);
        const token = getAuthCache(TOKEN_KEY);
        if (!!adminToken && adminToken != token) currPage.value = 'MyFlow';
      }
      currPage.value = route.query['CurrPage'] as string;
      workID.value = parseInt((route.query['WorkID'] as string) || '0');
      if (currPage.value === 'MyFlow' || currPage.value == 'CCMobileMyFlow') {
        if (workID.value == 0) {
          try {
            //初始进入测试容器的时候生成一个WorkID
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
            handler.AddJson(route.query);
            handler.AddPara('TesterNo', getAuthCache(TESTER_KEY));
            const data = await handler.DoMethodReturnString('Defaut_Init');
            if (typeof data === 'string' && data.includes('err@')) {
              message.error(data);
              return;
            }
            if (typeof data === 'string') {
              const strs = data.split('@');
              workID.value = parseInt(strs[0]);
              if (strs.length == 2) {
                localStorage.setItem('Token', strs[1]);
                //获取当前测试用户的信息
                userStore.token = strs[1];
                await userStore.getUserInfoAction();
              }
            }
            if (typeof data === 'object') {
              const pageName: string = data['PageName'] || '';
              delete data['DoMethod'];
              delete data['DoType'];
              delete data['HttpHandlerName'];
              delete data['PageName'];
              workID.value = data['WorkID'];
              if (pageName.startsWith('StartGuide_')) {
                currPage.value = 'StartGuide';
                frameSrc.value = `/src/WF/WorkOpt/${pageName.replace('StartGuide_', 'StartGuide/')}.vue?${GetParamsUrl(data)}}`;
                return;
              } else if (pageName.startsWith('GPN_')) {
                currPage.value = 'StartGuide';
                frameSrc.value = GloComm.UrlGPN(pageName, '', '&' + GetParamsUrl(data));
                return;
              } else if (pageName.startsWith('GL_')) {
                currPage.value = 'StartGuide';
                frameSrc.value = GloComm.UrlGenerList(pageName, '&' + GetParamsUrl(data));
                return;
              }
            }
          } catch (e) {
            message.error(e as string);
            return;
          }
        }
        if (currPage.value == 'CCMobileMyFlow') {
          frameSrc.value =
            'index.html#/CCMobile/MyFlow?TesterNo=' +
            getAuthCache(TESTER_KEY) +
            '&FlowNo=' +
            route.query.FlowNo +
            '&WorkID=' +
            workID.value +
            '&RoutFrom=MyFlow&t=' +
            Math.random();
          mobilePreviewUrl.value = frameSrc.value;
        } else frameSrc.value = '/#/WF/MyFlow?TesterNo=' + getAuthCache(TESTER_KEY) + '&FlowNo=' + route.query.FlowNo + '&WorkID=' + workID.value + '&RoutFrom=MyFlow';

        flowParams.value = getAllRequestParams(frameSrc.value);
        // &Token=' + route.query.Tokena
      } else if (currPage.value === 'StartGuide') {
        const pageName: string = (route.query['PageName'] as string) || '';
        const params = cloneDeep(route.query);
        delete params['PageName'];
        if (pageName.startsWith('StartGuide_')) {
          frameSrc.value = `/src/WF/WorkOpt/${pageName.replace('StartGuide_', 'StartGuide/')}.vue?${GetParamsUrl(params)}}`;
        } else if (pageName.startsWith('GPN_')) {
          frameSrc.value = GloComm.UrlGPN(pageName, '', '&' + GetParamsUrl(params));
        } else if (pageName.startsWith('GL_')) {
          frameSrc.value = GloComm.UrlGenerList(pageName, '&' + GetParamsUrl(params));
        }
      } else {
        const val = route.query?.WorkID || 0;
        workID.value = parseInt(val as number);
        if (workID.value != 0) await AdminLogin();
      }

      //currPage.value = 'MyFlow';

      hideLoading.value = true;
      userInfo.No = WebUser.No || '';
      userInfo.Name = WebUser.Name || '';
      userInfo.DeptName = WebUser.DeptName || '';
      //setAuthCache(ADMIN_TOKEN_KEY, getAuthCache(TOKEN_KEY));
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.log(errorObj.tips);
    } finally {
      ready.value = true;
      loading.value = false;
    }
  };
  InitPage();

  /**
   * 切换用户信息
   */
  const user = shallowRef<InstanceType<typeof UserInfo>>();
  // 这里就是添加了一个外层的变量控制（userInfoVisible），切换用户的时候，强制注销掉这个userInfo组件再重新渲染
  const userInfoVisible = ref(true);
  async function changeUserInfo(token) {
    userInfoVisible.value = false;
    // setTimeout(async () => {
    // const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
    // if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
    //   userStore.setTestToken(token);
    // } else {
    // }
    userStore.setToken(token);
    const en: User | null = await userStore.getUserInfoAction();
    userInfo.Name = en?.Name || '';
    userInfo.No = en?.No || '';
    userInfo.DeptName = en?.FK_DeptName || '';
    userInfoVisible.value = true;
    // }, 50);
  }

  /**
   * 改变Iframe
   * @param src
   * @param workID
   */
  const curWorkID=ref(0);
  const componentKey = ref(0);
  async function changeFrameSrc(pageName, myWorkID = 0, fid = 0) {
    frameSrc.value = '';
    currPage.value = '';
    currPage.value = pageName;
    curWorkID.value = myWorkID || workID.value;
    componentKey.value++;
    if (pageName === 'MyFlow' || pageName === 'CCMobileMyFlow') {
      ready.value = false;
      if (myWorkID == 0) {
        //生成WorkID
        const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_Admin_TestingContainer');
        handler1.AddPara('FK_Flow', route.query.FlowNo);
        handler1.AddPara('TesterNo', getAuthCache(TESTER_KEY));
        const result = await handler1.DoMethodReturnString('Default_Init');
        if (typeof result === 'string' && result.includes('err@')) {
          message.error(result);
          ready.value = true;
          return;
        }
        if (typeof result === 'object') {
          const pageName: string = result['PageName'] || '';
          delete result['DoMethod'];
          delete result['DoType'];
          delete result['HttpHandlerName'];
          delete result['PageName'];
          workID.value = result['WorkID'];
          ready.value = true;
          if (pageName.startsWith('StartGuide_')) {
            currPage.value = 'StartGuide';
            frameSrc.value = `/src/WF/WorkOpt/${pageName.replace('StartGuide_', 'StartGuide/')}.vue?${GetParamsUrl(result)}}`;
            return;
          } else if (pageName.startsWith('GPN_')) {
            currPage.value = 'StartGuide';
            frameSrc.value = GloComm.UrlGPN(pageName, '', '&' + GetParamsUrl(result));
            return;
          } else if (pageName.startsWith('GL_')) {
            currPage.value = 'StartGuide';
            frameSrc.value = GloComm.UrlGenerList(pageName, '&' + GetParamsUrl(result));
            return;
          }
        } else if (typeof result === 'string') {
          const strs = result.toString().split('@');
          myWorkID = parseInt(strs[0]);
          if (strs.length == 2) localStorage.setItem('Token', strs[1]);
        } else myWorkID = result;
      }
      workID.value = myWorkID;
      const flowNo = !!route.query.FlowNo ? route.query.FlowNo : route.query.FK_Flow;
      if (pageName === 'MyFlow')
        frameSrc.value = '/#/WF/MyFlow?TesterNo=' + getAuthCache(TESTER_KEY) + '&FlowNo=' + flowNo + '&WorkID=' + myWorkID + '&FID=' + fid + '&RoutFrom=MyFlow&t=' + Math.random();
      if (pageName === 'CCMobileMyFlow') {
        frameSrc.value =
          'index.html#/CCMobile/MyFlow?TesterNo=' + getAuthCache(TESTER_KEY) + '&FlowNo=' + flowNo + '&WorkID=' + myWorkID + '&FID=' + fid + '&RoutFrom=MyFlow&t=' + Math.random();
        mobilePreviewUrl.value = frameSrc.value;
      }
      flowParams.value = getAllRequestParams(frameSrc.value);
      ready.value = true;
    }

   
  }

  function handleMessage(event) {
    //接收消息
    const data = event.data as ccbpm.PostMessageInfo;
    switch (data.type) {
      case MessageTypeEnum.ChangeUserInfo:
        //接受准备消息
        changeUserInfo(data.Token);
        break;
      case MessageTypeEnum.ChangeFrameSrc:
        changeFrameSrc(data.currPage);
        break;
      default: {
        break;
      }
    }
  }
  usePostMessage(handleMessage);
</script>
<style lang="less" scoped>
  :deep(.ant-layout-content) {
    background-color: #f0f2f5;
  }
  .ant-row {
    text-align: center;
    font-size: 16px;
  }
  :deep(.van-tabbar--fixed) {
    position: relative;
  }
  :deep(.van-nav-bar--fixed) {
    position: relative;
  }
  // :deep(div) {
  //   position: relative;
  // }
</style>
