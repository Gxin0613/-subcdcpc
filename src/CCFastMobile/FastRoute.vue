<template>
  <div>
    <div style="height: 100vh">
      <NavBar v-if="mobileNavbarVisible() && navbarVisible" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />
      <Component
        v-if="isIFrame === false && !!componentInfo.component"
        :ignore-pt="!mobileNavbarVisible()"
        @hide-navbar="hideNavbar"
        :is="componentInfo.component"
        :params="componentInfo.params"
      />
      <iframe v-else :src="iframeInfo.src" style="border: none; width: 100%; height: 100%"></iframe> </div
  ></div>
</template>

<script lang="ts" setup>
  import { NavBar } from 'vant';
  import { Menu } from '/@/CCFast/GPM/CCMenu/Menu';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { MenuModel } from '/@/CCFast/GPM/CCMenu/MenuModel';
  import { type Component, markRaw, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { mobileNavbarVisible } from '../utils/gener/StringUtils';
  const { loadComponent } = useComponentLoader();
  const route = useRoute();
  const title = route.query.title as string;

  const navbarVisible = ref(true);
  const hideNavbar = () => {
    navbarVisible.value = false;
  };
  // 获取url和参数
  const getRouterInfo = (url: string) => {
    let path = '',
      params = {};
    if (!!url?.trim()) {
      const result = url.split('?');
      path = result[0];
      if (result.length > 1) {
        params = Object.fromEntries(result[1].split('&').map((item) => item.split('=')));
      }
    }
    if (path.startsWith('/')) path = path.substring(1);
    return [path, params];
  };
  //组件
  const componentInfo = reactive<{
    component: Component | null;
    params: Recordable;
  }>({
    component: null,
    params: {},
  });
  //框架
  const iframeInfo = reactive({
    src: '',
    params: {},
  });
  const isHttpUrl = (str: string) => !!str && (str.startsWith('http://') || str.startsWith('https://'));
  const isSelfUrl = (str: string) => !!str && str.startsWith('self://');
  const handleSelfUrl = (url: string) => {
    const urlPrefix = window.location.origin + '/#/';
    return url.replace('self://', urlPrefix);
  };
  const isIFrame = ref(false);
  const InitPage = async () => {
    if (!route.query.MenuNo) {
      let url = '/src/CCMobile/Comm/Search.vue';
      componentInfo.component = loadComponent(url);
      componentInfo.params = {
        title: route.query.title,
        ...route.query,
      };
      return;
    }
    //根据菜单编号获取菜单信息
    const menu = new Menu();
    menu.No = route.query.MenuNo;
    await menu.Retrieve();
    if (isSelfUrl(menu.UrlExt)) {
      isIFrame.value = true;
      iframeInfo.src = handleSelfUrl(menu.UrlExt);
      return;
    }
    // 优先处理url连接
    if (isHttpUrl(menu.UrlExt)) {
      if (menu.IframeOpenType === 'inner') {
        isIFrame.value = true;
        iframeInfo.src = handleSelfUrl(menu.UrlExt);
      } else {
        componentInfo.component = markRaw(loadComponent(menu.UrlExt));
      }
      return;
    }
    let urlPath = menu.MobileUrlExt || menu.UrlPath.toString();
    urlPath = urlPath.replace('@/', 'src/');
    if (urlPath.includes('CCFast/CCBill')) urlPath = urlPath.replace('CCFast/CCBill', 'CCFastMobile');
    if (urlPath.includes('WF/Comm/Search')) urlPath = urlPath.replace('WF/Comm/Search', 'CCMobile/Comm/Search');
    if (menu.MenuModel === MenuModel.FixedUrl) {
      const url = typeof menu.UrlExt === 'string' ? menu.UrlExt.replace(/&&/g, '&') : '';
      const [_, params] = getRouterInfo(url);
      componentInfo.component = loadComponent(urlPath);
      componentInfo.params = {
        title: menu.Name,
        // ...Object.fromEntries(menu.Row),
      };
      if (typeof params == 'object') {
        componentInfo.params = {
          // ...componentInfo.params,
          ...params,
        };
      }
      return;
    }
    // 如果是自定义url
    const [_, params] = getRouterInfo(menu.UrlExt);
    componentInfo.component = loadComponent(urlPath);
    componentInfo.params = {
      title: menu.Name,
      // ...Object.fromEntries(menu.Row),
    };
    if (typeof params == 'object') {
      componentInfo.params = {
        ...componentInfo.params,
        ...params,
      };
    }
  };

  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  InitPage();
</script>

<style scoped></style>
