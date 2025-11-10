<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { Menu, MenuItem, SubMenu, Badge } from 'ant-design-vue';
  import menuList from './menu';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import Event from '/@/utils/Events';
  import { useUserStore } from '/@/store/modules/user';

  let selectedKeys = ref<string[]>([]);
  const openKeys = ref<string[]>(['0']);
  const emit = defineEmits(['AddTabByKey', 'onRefresh']);
  function getParams(args: string) {
    return getAllRequestParams(args);
  }
  const infoNums = ref();
  const middleMenuLists = ref<typeof menuList>([]);
  const InitPage = async () => {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Portal');
    infoNums.value = await handler.DoMethodReturnJson('Default_TodoNums');

    middleMenuLists.value = menuList;
    if (!isAdmin.value) {
      middleMenuLists.value = menuList.filter((item) => item.GroupNo !== '170');
    }
  };

  function selectedMenuNode(nodeInfo) {
    const { key } = nodeInfo;
    emit('AddTabByKey', key);
  }

  const user = useUserStore();
  const userInfo = user.userInfo as unknown as Record<string, any>;
  const isAdmin = computed(() => {
    return userInfo?.IsAdmin === 1;
  });

  InitPage();
  //监听GenerList页面数据变化，刷新左侧菜单显示数量
  const InnerData = ref<Recordable>();
  watch(
    () => InnerData.value,
    () => {
      InitPage();
      return;
    },
  );
  onMounted(() => {
    Event.on('innerData', (data: any) => {
      InnerData.value = data;
    });
  });
  onUnmounted(() => {
    Event.off('innerData');
  });
  defineExpose({ selectedKeys });
</script>
<template>
  <!-- 左侧菜单栏 -->
  <div class="menu">
    <Menu mode="inline" v-model:selectedKeys="selectedKeys" @select="selectedMenuNode" :open-keys="openKeys" style="background-color: #fff; color: #000000; border-right: none">
      <sub-menu v-for="(group, index) in middleMenuLists" :key="index">
        <template #icon> <i :class="!group.Icon ? 'icon-folder' : group.Icon"></i> </template>
        <template #title>&nbsp;&nbsp;{{ group.GroupName }}</template>
        <template v-if="group.children">
          <menu-item v-for="menu in group.children" :key="menu.No" :url="menu.FileUrl" :EnName="menu.Paras" class="menu-item-li" style="background-color: #fff">
            <router-link :to="{ path: group.Path + '/' + menu.Path, query: getParams(menu.Paras) }" class="menu_area" style="color: #000000; font-weight: 500">
              <i :class="!menu.Icon ? 'icon-folder' : menu.Icon"></i>
              <template v-if="menu.No == 'GL_Todolist'">
                <span>&nbsp;&nbsp;{{ menu.Name }}</span>
                <Badge :count="infoNums?.Todolist_EmpWorks" :showZero="true" :numberStyle="{ backgroundColor: '#F8AC59' }" />
              </template>
              <template v-else-if="menu.No == 'GL_CC_0'">
                <span>&nbsp;&nbsp;{{ menu.Name }}</span>
                <Badge :count="infoNums?.CCList_UnRead" :showZero="true" :numberStyle="{ backgroundColor: '#F8AC59' }" />
              </template>
              <template v-else-if="menu.No == 'GL_CC_1'">
                <span>&nbsp;&nbsp;{{ menu.Name }}</span>
                <Badge :count="infoNums?.CCList_Read" :showZero="true" :numberStyle="{ backgroundColor: '#F8AC59' }" />
              </template>
              <template v-else>
                <span>&nbsp;&nbsp;{{ menu.Name }}</span>
              </template>
            </router-link>
          </menu-item>
        </template>
      </sub-menu>
    </Menu>
  </div>
</template>
<style scoped lang="less">
  .menu {
    background-color: #fff;
    padding-top: 48px;

    :deep(.ant-menu-item) {
      margin: 0;
      padding-top: 4px;
      padding-bottom: 4px;
      font-size: 14px;
      margin-top: 0 !important;
      &:hover,
      &:active,
      &:focus {
        background-color: var(--system-hover-bg-color);
        color: var(--header-bg-color);
      }
      a {
        &:hover {
          color: var(--header-bg-color) !important;
        }
      }
    }

    /* 一级菜单 */
    :deep(.ant-menu-inline .ant-menu-submenu) {
      font-weight: 600;
    }

    /* 选中颜色 */
    // .ant-menu-dark
    :deep(.ant-menu-submenu-selected) {
      color: var(--system-bg-color) !important;
    }

    :deep(.ant-menu-submenu-title:hover) {
      background-color: #fff !important;
      color: var(--system-bg-color) !important;
      & .ant-menu-submenu-arrow {
        color: var(--system-bg-color);
      }
    }

    /* 点击之后 */
    :deep(.ant-menu-submenu-active) {
      // background-color: #e8eefc;
      color: var(--system-active-bg-color) !important;
      & .ant-menu-submenu-arrow {
        color: var(--system-bg-color);
      }
    }

    :deep(.ant-menu-submenu-open) {
      font-weight: bold;
      color: #000;
    }

    :deep(.ant-menu-inline .ant-menu-submenu-title) {
      margin-top: 6px;
      margin-bottom: 0;
    }

    // /* 点击之前 箭头*/
    // :deep(.ant-menu.ant-menu-dark .ant-menu-submenu-title .ant-menu-submenu-arrow::after) {
    //   background-color: #8c8c8c;
    //   color: var(--system-hover-bg-color);
    // }

    // :deep(.ant-menu.ant-menu-dark .ant-menu-submenu-title .ant-menu-submenu-arrow::before) {
    //   background-color: #8c8c8c;
    //   color: var(--system-hover-bg-color);
    // }

    // /* 点击之后 箭头*/
    // :deep(.ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title > .ant-menu-submenu-arrow::after) {
    //   background-color: #8c8c8c;
    //   color: var(--system-hover-bg-color);
    // }

    // :deep(.ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title > .ant-menu-submenu-arrow::before) {
    //   background-color: #8c8c8c;
    //   color: var(--system-hover-bg-color);
    // }

    //二级菜单移入效果
    :deep(.ant-menu-item-active) {
      background-color: var(--system-hover-bg-color) !important;
      color: var(--header-hover-bg-color) !important;
    }

    :deep(.ant-menu-item-active a:hover) {
      // background-color: var(--system-hover-bg-color) !important;
      color: var(--header-hover-bg-color);
      // font-weight: 500;
    }
    :deep(.ant-menu-item-selected:focus) {
      background-color: var(--system-hover-bg-color) !important;
      color: var(--header-hover-bg-color) !important;
    }

    //二级菜单选中效果
    :deep(.ant-menu-item-selected) {
      background-color: var(--system-hover-bg-color) !important;
      border: none;
      a {
        color: var(--header-bg-color) !important;
        font-weight: 500;
      }
    }
  }
  :deep(.ant-badge-not-a-wrapper:not(.ant-badge-status)) {
    padding-left: 5px;
  }
  :deep(.menu-item-li) {
    width: 100%;
    border-radius: 0;
  }
</style>
