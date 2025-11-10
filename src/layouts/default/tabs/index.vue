<template>
  <div :class="getWrapClass">
    <Tabs type="editable-card" size="small" :animated="false" :hideAdd="true" :tabBarGutter="3" :activeKey="activeKeyRef" @change="handleChange" @edit="handleEdit">
      <template v-for="item in getTabsState" :key="item.query ? item.fullPath : item.path">
        <TabPane :closable="!(item && item.meta && item.meta.affix)">
          <template #tab>
            <TabContent :tabItem="item" class="appearance" />
          </template>
        </TabPane>
      </template>

      <template #rightExtra v-if="getShowRedo || getShowQuick">
        <TabRedo v-if="getShowRedo" />
        <TabContent isExtra :tabItem="route" v-if="getShowQuick" />
        <FoldButton v-if="getShowFold" />
      </template>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
  import type { RouteLocationNormalized, RouteMeta } from 'vue-router';
  import { computed, unref, ref } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import TabContent from './components/TabContent.vue';
  import FoldButton from './components/FoldButton.vue';
  import TabRedo from './components/TabRedo.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useUserStore } from '/@/store/modules/user';
  import { initAffixTabs, useTabsDrag } from './useMultipleTabs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';
  import { REDIRECT_NAME } from '/@/router/constant';
  import { listenerRouteChange } from '/@/logics/mitt/routeChange';
  import { useRouter, useRoute } from 'vue-router';

  defineOptions({
    name: 'MultipleTabs',
  });

  const TabPane = Tabs.TabPane;
  const affixTextList = initAffixTabs();
  const activeKeyRef = ref('');

  useTabsDrag(affixTextList);
  const tabStore = useMultipleTabStore();
  const userStore = useUserStore();
  const router = useRouter();
  const route = useRoute();

  const { prefixCls } = useDesign('multiple-tabs');
  const go = useGo();
  const { getShowQuick, getShowRedo, getShowFold } = useMultipleTabSetting();

  const getTabsState = computed(() => {
    return tabStore.getTabList.filter((item) => !item.meta?.hideTab);
  });

  const unClose = computed(() => unref(getTabsState).length === 1);

  const getWrapClass = computed(() => {
    return [
      prefixCls,
      {
        [`${prefixCls}--hide-close`]: unref(unClose),
      },
    ];
  });

  listenerRouteChange((route) => {
    const { name } = route;
    if (name === REDIRECT_NAME || !route || !userStore.getToken) {
      return;
    }

    const { path, fullPath, meta = {} } = route;
    const { currentActiveMenu, hideTab } = meta as RouteMeta;
    const isHide = !hideTab ? null : currentActiveMenu;
    const p = isHide || fullPath || path;
    if (activeKeyRef.value !== p) {
      activeKeyRef.value = p as string;
    }

    if (isHide) {
      const findParentRoute = router.getRoutes().find((item) => item.path === currentActiveMenu);
      findParentRoute && tabStore.addTab(findParentRoute as unknown as RouteLocationNormalized);
    } else {
      tabStore.addTab(unref(route));
    }
  });

  function handleChange(activeKey: any) {
    activeKeyRef.value = activeKey;
    go(activeKey, false);
  }

  // 关闭当前页签
  function handleEdit(targetKey: string) {
    // 添加操作隐藏，目前只使用删除操作
    if (unref(unClose)) {
      return;
    }

    tabStore.closeTabByKey(targetKey, router);
  }
</script>

<style lang="less">
  @import './index.less';
  .appearance {
    font-size: 14px !important;
  }
  @height: 35px;
  .vben-multiple-tabs {
    height: @height;
    line-height: @height;
    .ant-tabs-small {
      height: @height;
    }
    .ant-tabs.ant-tabs-card .ant-tabs-nav {
      height: @height;
      & > .ant-tabs-nav-wrap {
        height: @height;
        .ant-tabs-tab {
          height: @height - 5;
          border-radius: 5px;
          &:not(.ant-tabs-tab-active) .anticon-close svg {
            width: 0.9em;
          }
        }
      }
      .ant-tabs-tab-active svg {
        width: 0.9em;
      }
    }
  }
</style>
