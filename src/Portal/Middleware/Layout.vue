<template>
  <Layout class="top-layout">
    <layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible style="background-color: white">
      <!-- 流程中间件 -->
      <div
        class="logo"
        :style="{
          width: collapsed ? '80px' : '200px',
        }"
      >
        <img src="/resource/CompanyImgLogo/cclogo.png" style="width: 40px; height: 40px" :alt="`${VITE_GLOB_SX_TITLE}logo`" v-show="collapsed" />
        <div class="ml-2 truncate md:opacity-200 xs:opacity-0" style="display: flex; font-size: 15px" v-show="!collapsed">
          <img src="/resource/CompanyImgLogo/cclogo.png" alt="" />{{ '流程中间件' }}</div
        >
      </div>
      <SystemMenu @add-tab-by-key="AddTabByKey" ref="siderMenu" />
    </layout-sider>
    <Layout>
      <layout-header
        class="layout-header-class"
        style="background: var(--system-bg-color); color: #fff; padding: 0; height: 48px; font-size: 14px; position: relative; z-index: 10"
      >
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="collapsed = !collapsed" />
        <menu-fold-outlined v-else class="trigger" @click="collapsed = !collapsed" />
        <div class="quick-links">
          <!-- background: var(--system-bg-color); -->
          <Menu mode="horizontal" v-model:selectedKeys="selectedKeys" style="background: var(--system-bg-color); height: 48px; font-size: 14px">
            <menu-item key="110-01" @click="addTabByMenu({ path: 'GenerList', title: '发起', Paras: '?EnName=GL_Start' })">
              <i class="icon-paper-plane"></i> {{ '发起' }}</menu-item
            >
            <menu-item key="110-02" @click="addTabByMenu({ path: 'GenerList', title: '待办', Paras: '?EnName=GL_Todolist' })"> <i class="icon-clock"></i> {{ '待办' }}</menu-item>
            <menu-item key="110-04" @click="addTabByMenu({ path: 'GenerList', title: '在途', Paras: '?EnName=GL_Runing' })"> <i class="icon-hourglass"></i> {{ '在途' }}</menu-item>
            <menu-item key="110-05" @click="addTabByMenu({ path: 'GenerList', title: '近期', Paras: '?EnName=GL_RecentWork' })">
              <i class="icon-envelope"></i> {{ '近期' }}</menu-item
            >
            <menu-item key="110-06" @click="addTabByMenu({ path: 'GenerList', title: '抄送', Paras: '?EnName=GL_CC' })"> <i class="icon-bag"></i> {{ '抄送' }}</menu-item>
            <menu-item key="110-07" @click="addTabByMenu({ path: 'GenerList', title: '收藏', Paras: '?EnName=GL_Focus' })"> <i class="icon-star"></i> {{ '收藏' }}</menu-item>
          </Menu>
          <Menu mode="horizontal" v-model:selectedKeys="selectedKeys" style="justify-content: flex-end; background: var(--system-bg-color); height: 48px; font-size: 14px">
            <template v-if="isAdmin">
              <menu-item key="999-04" @click="addTabByMenu({ path: '/Middle/TreeEns', title: '流程', Paras: '?EnName=TreeEns_FlowSort2Flow' })">
                <i class="icon-organization"></i> {{ '流程' }}</menu-item
              >
              <menu-item key="999-05" @click="addTabByMenu({ path: '/Middle/TreeEns', title: '表单', Paras: '?EnName=TreeEns_FrmSort2Frm' })">
                <i class="icon-diamond"></i> {{ '表单' }}</menu-item
              >
              <!-- <menu-item key="999-99" v-if="isDevMode()" @click="addTabByMenu({ path: '/Middle/TreeEns', title: '项目', Paras: '?EnName=TreeEns_TemplateSort2Template' })">
                <i class="icon-support"></i>{{'项目'}}</menu-item> -->
              <menu-item key="999-06" @click="addTabByMenu({ path: '/Middle/TreeEns', title: '组织', Paras: '?EnName=TreeEns_Dept2Emp' })">
                <i class="icon-people"></i> {{ '组织' }}</menu-item
              >
              <menu-item key="999-07" @click="addTabByMenu({ path: '/Middle/TreeEns', title: '数据源', Paras: '?EnName=TreeEns_DBSrc' })">
                <i class="icon-settings"></i> {{ '数据源' }}</menu-item
              >
            </template>
            <menu-item key="999-08" @click="addTabByMenu({ path: 'GenerList', title: '消息列表', Paras: '?EnName=GL_Msg' })"> <i class="icon-bubbles"></i> {{ '消息' }}</menu-item>
            <!-- <menu-item key="999-32" @click="addTabByMenu({ path: 'GenerList', title: '安全', Paras: '?EnName=GL_TablePower' })">
              <i class="icon-umbrella"></i>{{'安全'}}</menu-item> -->
            <sub-menu>
              <template #icon> <img class="userIcon" :src="userIcon" :onerror="defaultIcon" /></template>
              <template #title>{{ userInfo.Name }}</template>
              <menu-item-group>
                <menu-item key="item-1" @click="SwitchToStandard"> <i class="icon-directions"></i>{{ '切换到低代码' }}</menu-item>
                <menu-item key="item-4" @click="SwitchToPortal"> <i class="icon-directions"></i>{{ '切换到门户' }}</menu-item>
                <menu-item key="item-2" @click="SwitchToMobile"><i class="icon-screen-smartphone"></i>{{ '切换到移动端' }}</menu-item>
                <menu-item key="item-3" @click="addTabByMenu({ path: '/Middle/En', title: '我的设置', Paras: `?EnName=TS.User.MySetting&PKVal=${isModeUserNo}` })">
                  <i class="icon-user"></i>{{ '我的设置' }}</menu-item
                >
                <menu-item
                  v-if="WebUser.IsAdmin"
                  key="item-23"
                  @click="addTabByMenu({ path: '/Middle/En', title: '系统设置', Paras: `?EnName=TS.Sys.SystemSetting&PKVal=${isModeUserNo}` })"
                >
                  <i class="icon-settings"></i>{{ '系统设置' }}</menu-item
                >
                <menu-item key="999-10" @click="addTabByMenu({ path: 'GenerList', title: '切换部门', Paras: '?EnName=GL_SelectDeptLogin' })">
                  <i class="icon-directions"></i>{{ '切换部门' }}</menu-item
                >
                <menu-item v-if="WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc && WebUser.No == 'admin'" @click="changeOrgAdmin">
                  <i class="icon-settings"></i>
                  管理组织(AdminOnly)</menu-item
                >
                <menu-item key="Exit" @click="LoginOut"> <i class="icon-login"></i>{{ '退出' }}</menu-item>
              </menu-item-group>
            </sub-menu>
          </Menu>
          <!-- 颜色系统齿轮 -->
          <SettingDrawer :class="`${prefixCls}-action__item`" />
        </div>
      </layout-header>
      <!-- background: '#f2f5f7' -->
      <layout-content :style="{ background: '#f0f2f5', minHeight: '280px', overflow: 'hidden' }">
        <MenuTabs ref="addTab" @remove-cache-page-id="removeCachePageId" @add-cache-page-id="addCachePageId" @add-tab-by-key="AddTabByKey" />
        <div class="component-wrapper">
          <router-view v-slot="{ Component, route }" v-if="!loading">
            <Transition name="fade">
              <Component :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </layout-content>
    </Layout>
  </Layout>
  <ChangPwd />
</template>
<script lang="ts" setup>
  import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
  import { Layout, LayoutSider, Menu, MenuItem, LayoutHeader, LayoutContent, SubMenu, MenuItemGroup } from 'ant-design-vue';
  import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
  import MenuTabs from './MenuTabs.vue';
  import SystemMenu from './Sysmenu.vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { PageEnum } from '/@/enums/pageEnum';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import menuList from '/@/Portal/Middleware/menu';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { useDesign } from '/@/hooks/web/useDesign';
  import SettingDrawer from '/@/layouts/default/setting/index.vue';
  import Events from '/@/utils/Events';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import { useGo } from '/@/hooks/web/usePage';
  import { ChangPwd } from '/@/components/ChangPwd';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { showFailToast } from 'vant';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { usePermission } from '/@/hooks/web/usePermission';
  const userStore = useUserStore();
  const router = useRouter();
  const collapsed = ref<boolean>(false);
  const addTab = ref();
  const siderMenu = ref();
  const cacheNamesList = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const userInfo = userStore.getUserInfo as User;
  const { VITE_GLOB_API_URL, VITE_GLOB_SX_TITLE } = getAppEnvConfig();
  const { prefixCls } = useDesign('layout-header');
  const go = useGo();
  // const SettingDrawer = defineAsyncComponent(() => {
  //   return import('/@/layouts/default/setting/ChangPwd.vue'); // 返回一个Promise
  // });
  //console.log(userInfo);
  //获取代理路径
  const basicPath = VITE_GLOB_API_URL;
  //用户头像图片
  const userIcon = basicPath + '/DataUser/UserIcon/' + userInfo.No + '.png';
  //没有用户头像图片时获取默认图片
  const defaultIcon = (e) => {
    let img = e.srcElement;
    img.src = basicPath + '/DataUser/UserIcon/Default.png';
    img.onerror = null;
  };

  // const isAdmin = () => {
  //   if (typeof userInfo.IsAdmin === 'boolean') {
  //     return userInfo.IsAdmin;
  //   }
  //   return parseInt(userInfo.IsAdmin) === 1;
  // };
  const isAdmin = computed(() => {
    return userInfo?.IsAdmin === 1;
  });
  const isModeUserNo = computed(() => {
    let pkVal = userInfo.No;
    if (userInfo.CCBPMRunModel == CCBPMRunModel.SAAS) {
      pkVal = userInfo.OrgNo + '_' + userInfo.No;
    }
    return pkVal;
  });
  const pathList = menuList.map((menu) => menu.children).flat();
  function AddTabByKey(key, colseable = true) {
    const path = pathList.find((pathInfo) => pathInfo.No === key || pathInfo.Paras.includes(key));
    if (path) {
      const params = getAllRequestParams(path.Paras);
      addTabByMenu({
        title: path.Name,
        path: path.Path,
        Icon: path.Icon,
        Paras: path.Paras,
        closable: colseable,
        ...params,
      });
    }
  }

  async function addTabByMenu(tabInfo) {
    let userNo = WebUser.No;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) userNo = WebUser.OrgNo + '_' + WebUser.No;

    const mySetting = new MySetting(userNo);
    mySetting.No = userNo;
    const num = await mySetting.RetrieveFromDBSources();
    if (num == 0) {
      mySetting.SetValByKey('Name', WebUser.Name);
      mySetting.SetValByKey('FK_Dept', WebUser.FK_Dept);
      mySetting.SetValByKey('OrgNo', WebUser.OrgNo);
      await mySetting.Insert();
    }
    addTab.value.add(tabInfo);
  }

  function removeCachePageId(removedId) {
    //页签关闭前调用，删除需要缓存的组件名称 key
    nextTick(() => {
      siderMenu.value.selectedKeys = [];
      siderMenu.value.selectedKeys.push(addTab.value.activeKey);
      selectedKeys.value = [];
      selectedKeys.value.push(addTab.value.activeKey);
    });
    cacheNamesList.value = cacheNamesList.value.filter((pageId) => pageId !== removedId);
  }

  const loading = ref(false);

  function addCachePageId(addedId: string) {
    loading.value = true;
    //添加页签前时调用，缓存对应组件名称
    cacheNamesList.value.push(addedId);
    setTimeout(() => {
      loading.value = false;
    }, 16);
  }
  const pStore = usePermissionStore();
  const p = usePermission();
  const SwitchToStandard = async () => {
    await pStore.buildCCFastRoutes();
    await p.refreshMenu();
    router.replace({
      path: PageEnum.BASE_HOME,
    });
    // window.location.href = window.location.
    setTimeout(() => {
      console.log(router);
    }, 3000);
  };
  const SwitchToMobile = () => {
    //跳过路由守卫
    // userStore.setSkipRouteCheck(true);
    router.push({
      path: PageEnum.BASE_CCMobile_HOME,
      query: {
        skipPlatformCheck: '1',
      },
    });
  };
  const SwitchToPortal = async () => {
    //获取pageID
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const getPages = await handler.DoMethodReturnJson('SystemPortal_GenerPages');
    let pageID = 0;
    if (getPages.length > 0) {
      pageID = getPages[0].No;
    } else {
      showFailToast('获取门户信息失败，请联系管理人员配置门户信息。');
      // @ts-ignore
      return;
    }
    const url = PageEnum.BASE_RptPortal_HOME + '?PageID=' + pageID + '&edit=0';
    router.replace(url);
    // window.location.href = window.location.
    setTimeout(() => {
      console.log(router);
    }, 3000);
  };
  const changeDept = () => {
    go('/WF/GL/SelectDeptLogin');
  };
  const changeOrgAdmin = () => {
    go('/GroupHome');
  };

  const LoginOut = () => {
    userStore.confirmLoginOut();
    console.log('No值:', WebUser.No);
  };

  onMounted(() => {
    Events.on('middleware_open_tab', ({ path, query }) => {
      addTabByMenu({
        path,
        Paras: '?url=' + encodeURIComponent(query.url),
        key: Math.random(),
        title: query.title,
      });
    });
    Events.on('middle_close_current_tab', () => {
      const { remove, activeKey } = addTab.value;
      remove(activeKey);
    });
  });
  onUnmounted(() => {
    Events.off('middleware_open_tab');
    Events.off('middle_close_current_tab');
  });
</script>
<style lang="less" scoped>

  .top-layout {
    @prefixCls:~'@{namespace}-layout-content';
  .@{prefixCls}{
    &--dark{
      color: @white !important;
      .ant-menu-title-content{
      background-color: var(--system-bg-color);
      border-color: var(--system-bg-color);
      &:hover{
        background-color: var(--system-hover-bg-color) ;
        border-color: var(--system-hover-bg-color);
      }
      &:active{
        background-color: var(--system-active-bg-color);
        border-color: var(--system-active-bg-color);
      }
  }
    }
    &--light{
      color: @text-color-base !important;
      .ant-btn-primary:not(.ant-btn-background-ghost):not([disabled]) {
        color: @text-color-base !important;
      }
        .ant-btn-primary{
          background-color: var(--system-bg-color);
          border-color: var(--system-bg-color);
          &:hover{
            background-color: var(--system-hover-bg-color) ;
            border-color: var(--system-hover-bg-color);
          }
          &:active{
            background-color: var(--system-active-bg-color);
            border-color: var(--system-active-bg-color);
          }
        }
    }
  }
    position: relative;
    z-index: 10;

    :deep(.ant-layout-sider-children) {
      overflow: hidden scroll;
      scrollbar-width: none; //火狐取消滚动条
    }
    :deep(.ant-layout-sider) {
      height: 100%;
    }

  }
  // .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu{
  //   color: #fff;
  // }

  .vben-layout-header-action__item {
    width: 45px;
    height: 48px;
    text-align: center;
  }
  .ant-layout {
    height: 100%;
  }

  .trigger {
    font-size: 18px;
    line-height: 48px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
    color: #1890ff;
  }

  .logo {
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--system-bg-color);
    color:white;
    position: fixed;
    left: 0;
    top: 0;
    width: 200px;
    z-index: 99;
    transition: all ease .3s;
  }

  .truncate {
    font-size: 16px;
    font-weight: 700;
    transition: all 0.5s;
    // margin-left: 0.5rem;
    margin-left: 0;
    line-height: 32px;
  }

  .logo img {
    width: 32px;
    height: 32px;
  }

  .site-layout .site-layout-background {
    background: #fff;
  }

  .ant-layout-header {
    display: flex;
    justify-content: space-between;
    height: 48px;
    line-height: 48px;
  }

  .quick-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    padding-top: 1px; //添加
    :deep(.ant-menu) {
      flex: 1;
      :deep(.ant-menu-item:hover::after) {
        background-color: #0c46ae;
        color: #fff;
      }
    }
  }
  .component-wrapper {
    height: calc(100% - 15px);
    // height: calc(100% - 48px - 40px);
    overflow-y: auto;
  }
  .userIcon {
    display: inline-block;
    object-fit: contain;
    width: 14px;
    height: 14px;
  }

  .layout-header-class {

    :deep(.ant-menu-horizontal > .ant-menu-submenu > .ant-menu-submenu-title) {
      color: #fff;
      height: 46px;
    }
    .ant-tabs-nav {
      padding: 0;
    }
    :deep(.ant-tabs-nav-wrap) {
      background-color: white;
    }
    :deep(.ant-menu-item-selected::after) {
      border-bottom: 0 !important;
    }
    :deep(.ant-menu-submenu-title) {
      &:hover {
        top: 0;
        color: #fff !important;
        background: var(--system-active-bg-color);
      }
    }
    :deep(.ant-menu-item-selected) {
      top: 0;
      color: #fff;
      transition: none;
      background: var(--system-active-bg-color);
    }
    :deep(.ant-menu-item) {
      top: 0;
      color: #fff;
      margin-top: 1px;
      transition: none;
      &:hover {
        color: #fff !important;
        background: var(--system-hover-bg-color);
      }
    }
  }
</style>
