<template>
  <BaseComponent ref="baseComp" :close-drawer-func="reloadMenu">
    <Menu v-bind="getBindValues" :activeName="activeName" :openNames="getOpenKeys" :class="prefixCls" :activeSubMenuNames="activeSubMenuNames" @select="handleSelect">
      <template v-for="item in items" :key="item.path">
        <SimpleSubMenu :item="item" :parent="true" :collapsedShowTitle="collapsedShowTitle" :collapse="collapse" />
      </template>
    </Menu>
  </BaseComponent>
</template>

<script setup lang="ts">
  import type { MenuState } from './types';
  import type { Menu as MenuType } from '/@/router/types';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';
  import { computed, ref, unref, reactive, toRefs, watch, provide, shallowRef } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Menu from './components/Menu.vue';
  import SimpleSubMenu from './SimpleSubMenu.vue';
  import { listenerRouteChange } from '/@/logics/mitt/routeChange';
  import { REDIRECT_NAME } from '/@/router/constant';
  import { useRoute, useRouter } from 'vue-router';
  import { isFunction, isUrl } from '/@/utils/is';
  import { openWindow } from '/@/utils';
  import { useOpenKeys } from './useOpenKeys';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { usePermission } from '/@/hooks/web/usePermission';

  // Define props
  interface Props {
    items?: MenuType[];
    collapse?: boolean;
    mixSider?: boolean;
    theme?: string;
    accordion?: boolean;
    collapsedShowTitle?: boolean;
    beforeClickFn?: (key: string) => Promise<boolean>;
    isSplitMenu?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    collapse: false,
    mixSider: false,
    theme: '',
    accordion: true,
    collapsedShowTitle: false,
    beforeClickFn: undefined,
    isSplitMenu: false,
  });

  // Define emits
  const emit = defineEmits(['menuClick']);

  // Refs and reactive state
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const currentActiveMenu = ref('');
  const isClickGo = ref(false);

  const pStore = usePermissionStore();
  const p = usePermission();
  const router = useRouter();

  async function reloadMenu() {
    await pStore.buildCCFastRoutes();
    await p.refreshMenu();
    setTimeout(() => {
      const alias = localStorage.getItem('redirectMenuAlias');
      if (!!alias) {
        router.push({
          name: alias,
        });
        localStorage.removeItem('redirectMenuAlias');
        localStorage.removeItem('lastCreateMenuId');
      }
    }, 16);
  }

  const menuState = reactive<MenuState>({
    activeName: '',
    openNames: [],
    activeSubMenuNames: [],
  });

  const { activeName, activeSubMenuNames } = toRefs(menuState);

  const { currentRoute } = useRouter();
  const { prefixCls } = useDesign('simple-menu');
  const { setOpenKeys, getOpenKeys } = useOpenKeys(menuState, toRefs(props).items, toRefs(props).accordion, toRefs(props).mixSider, toRefs(props).collapse);
  const getBindValues = computed(() => ({ ...props }));
  watch(
    () => props.collapse,
    (collapse) => {
      if (collapse) {
        menuState.openNames = [];
      } else {
        setOpenKeys(currentRoute.value.path);
      }
    },
    { immediate: true },
  );

  watch(
    () => props.items,
    () => {
      if (!props.isSplitMenu) {
        return;
      }
      setOpenKeys(currentRoute.value.path);
    },
    { flush: 'post' },
  );

  provide('handleGPNCallback', (gpn: GPNReturnObj) => {
    baseComp.value?.handleGPNCallback(gpn);
  });

  listenerRouteChange((route) => {
    if (route.name === REDIRECT_NAME) return;

    currentActiveMenu.value = route.meta?.currentActiveMenu as string;
    handleMenuChange(route);

    if (unref(currentActiveMenu)) {
      menuState.activeName = unref(currentActiveMenu);
      setOpenKeys(unref(currentActiveMenu));
    }
  });

  async function handleMenuChange(route?: RouteLocationNormalizedLoaded) {
    if (unref(isClickGo)) {
      isClickGo.value = false;
      return;
    }
    const path = (route || unref(currentRoute)).path;

    menuState.activeName = path;
    setOpenKeys(path);
  }

  async function handleSelect(key: string) {
    if (isUrl(key)) {
      openWindow(key);
      return;
    }
    const { beforeClickFn } = props;
    if (beforeClickFn && isFunction(beforeClickFn)) {
      const flag = await beforeClickFn(key);
      if (!flag) return;
    }

    emit('menuClick', key);

    isClickGo.value = true;
    setOpenKeys(key);
    menuState.activeName = key;
  }
</script>

<style lang="less">
  @import './index.less';
</style>
