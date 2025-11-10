<template>
  <Layout>
    <LayoutSider v-model:collapsed="collapsed" :trigger="null" collapsible style="background: #fff">
      <div class="logo" v-if="collapsed">SAAS</div>
      <div class="logo" v-else>{{ VITE_GLOB_SX_TITLE }}BPM多租户</div>
      <Menu v-model:selectedKeys="selectedKeys" mode="inline" v-model:openKeys="openKeys">
        <SubMenu v-for="(group, index) in SaaSMenuList" :key="index">
          <template #icon>
            <i :class="!group.Icon ? 'icon-folder' : group.Icon"></i>
          </template>
          <template #title> &nbsp;&nbsp;{{ group.GroupName }} </template>
          <template v-if="group.children">
            <menu-item v-for="menu in group.children" :key="menu.No" :url="menu.FileUrl" :EnName="menu.Paras" class="menu-item-li">
              <router-link :to="{ path: group.Path + '/' + menu.Path, query: getParams(menu.Paras) }" class="menu_area" style="font-weight: 500">
                <i :class="!menu.Icon ? 'icon-folder' : menu.Icon"></i>
                <span>&nbsp;&nbsp;{{ menu.Name }}</span>
              </router-link>
            </menu-item>
          </template>
        </SubMenu>
      </Menu>
    </LayoutSider>
    <Layout>
      <LayoutHeader
        class="layout-header-class"
        style="background: var(--system-bg-color); color: #fff; padding: 0; height: 48px; line-height: 47px; font-size: 14px; position: relative; z-index: 10"
      >
        <MenuUnfoldOutlined v-if="collapsed" class="trigger" @click="() => (collapsed = !collapsed)" />
        <MenuFoldOutlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
        <div class="quick-links">
          <Menu mode="horizontal" v-model:selectedKeys="selectedKeys" style="background: var(--system-bg-color); height: 48px; font-size: 14px">
            <menu-item key="HomePage" @click="addTabByMenu({ path: '/SaasHome/SaaSWelcome', title: '主页' })" class="cg_style">
              <i class="icon-home"></i>{{ '主页' }}</menu-item
            >
            <menu-item key="TreeEns_Dept2Emp" @click="addTabByMenu({ path: '/SaasHome/TreeEns', title: '组织树', Paras: '?EnName=TreeEns_Dept2Emp' })" class="cg_style">
              <i class="icon-people"></i>{{ '组织树' }}</menu-item
            >
            <menu-item key="Orgs" @click="addTabByMenu({ path: '/SaasHome/Search', title: '组织', Paras: '?EnName=TS.SaaS.OrgAdmin' })" class="cg_style">
              <i class="icon-settings"></i>{{ '组织' }}</menu-item
            >
            <menu-item key="200-02" class="quitOut cg_style" @click="LoginOut"> <LogOutOutline style="width: 16px" />{{ '退出' }}</menu-item>
          </Menu>
        </div>
      </LayoutHeader>
      <LayoutContent :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
        <div class="component-wrapper">
          <router-view v-slot="{ Component }">
            <Transition name="fade">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </LayoutContent>
    </Layout>
  </Layout>
</template>
<script lang="ts" setup>
  import { Layout, LayoutHeader, LayoutSider, LayoutContent, Menu, SubMenu, MenuItem } from 'ant-design-vue';
  import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { LogOutOutline } from '@vicons/ionicons5';
  import { DealExp } from '/@/utils/gener/StringUtils';
  import SaaSMenuList from './SaaSMenu';
  import { useRoute, useRouter } from 'vue-router';
  import { ref } from 'vue';
  import WebUser from '/@/bp/web/WebUser';
  import { useUserStore } from '/@/store/modules/user';
  import { getAppEnvConfig } from '/@/utils/env';
  const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const selectedKeys = ref<string[]>([]);
  const openKeys = ref<string[]>([0]);
  const collapsed = ref<boolean>(false);
  function getParams(args: string) {
    return getAllRequestParams(args);
  }
  //header菜单跳转
  const addTabByMenu = (tabInfo) => {
    if (tabInfo.Paras) {
      const queryArgs = DealExp(tabInfo.Paras);
      const routerInfo = { path: tabInfo.path, query: getParams(queryArgs) };
      router.replace(routerInfo);
    } else {
      const routerInfo = { path: tabInfo.path };
      router.replace(routerInfo);
    }
  };
  const LoginOut = () => {
    userStore.confirmLoginOut();
    console.log('No值:', WebUser.No);
  };
</script>
<style scoped lang="less">
  .trigger {
    font-size: 18px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
    color: #1890ff;
  }

  .logo {
    height: 48px;
    line-height: 48px;
    text-align: center;
    color: #fff;
    background: rgb(9 96 189);
  }

  .site-layout .site-layout-background {
    background: #fff;
  }
  .layout-header-class {
    display: flex;
    align-items: center;
  }
  .quick-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    padding-top: 1px; //添加
    :deep(.ant-menu) {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex: 1;
      :deep(.ant-menu-item:hover::after) {
        background-color: #0c46ae;
        color: #fff;
      }
      .quitOut {
        .ant-menu-title-content {
          display: flex;
        }
      }
      .cg_style {
        color: #fff;
      }
    }
  }
</style>
