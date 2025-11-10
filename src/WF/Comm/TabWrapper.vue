<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import IframePage from '/@/views/sys/iframe/index.vue';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import Exception from '/@/views/sys/exception/Exception.vue';
  import { onMounted, onUnmounted, onActivated } from 'vue';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import Events from '/@/utils/Events';

  defineOptions({ name: 'CommTabWrapper' });

  const route = useRoute();
  const router = useRouter();

  // 在组件创建时就确定URL，避免响应式变化
  const url = ref((route.query.url as string) || '');
  const title = ref((route.query.title as string) || 'new Tab');

  // 解码URL
  url.value = decodeURIComponent(url.value);

  const { loadComponent, getComponentParamsByUrl } = useComponentLoader();

  const isIframeSrc = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/#/');
  };

  // 在组件创建时就确定要渲染的内容
  const getComponentInfo = () => {
    const urlValue = url.value;

    if (urlValue.startsWith('/src/')) {
      return {
        type: 'component',
        component: loadComponent(urlValue),
        params: getComponentParamsByUrl(urlValue),
      };
    } else if (isIframeSrc(urlValue)) {
      return {
        type: 'iframe',
        frameSrc: urlValue,
      };
    } else {
      return {
        type: 'exception',
      };
    }
  };

  let componentInfo = getComponentInfo();

  const tabStore = useMultipleTabStore();

  const currentTab = computed(() => {
    return tabStore.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
  });

  const updateTitle = (title: string) => {
    const tab = currentTab.value;
    if (tab?.meta?.title) {
      tab.meta.title = title;
      document.title = title;
    } else {
      document.title = title;
    }
  };
  const componentKey = ref(0);
  const iframeMessageHandler = ({ data }) => {
    switch (data.type) {
      case MessageTypeEnum.ReloadPage:
        {
          if (route.path.startsWith('/Middle/')) {
            Events.emit('middle_close_current_tab');
            return;
          }
          const tab = currentTab.value;
          if (tab) {
            tabStore.closeTab(tab, router);
          }
        }
        break;
      case MessageTypeEnum.ChangeFrameSrc:
        if (!!data.url) {
          if (componentInfo.type === 'component') componentInfo.params = getComponentParamsByUrl(decodeURIComponent(decodeURIComponent(data.url)));
          if (componentInfo.type === 'iframe') componentInfo.frameSrc = data.url;
        }
        //url.value = data.url;
        //const en = getComponentInfo();

        componentKey.value++;
        break;
    }
  };

  // 激活时更新标题（从缓存恢复时）
  onActivated(() => {
    if (title.value) {
      updateTitle(title.value);
    }
  });

  onMounted(() => {
    if (title.value) {
      updateTitle(title.value);
    }
    window.addEventListener('message', iframeMessageHandler, true);
  });

  onUnmounted(() => {
    window.removeEventListener('message', iframeMessageHandler, true);
  });
</script>

<template>
  <div class="tab-container">
    <!-- 组件类型 -->
    <component v-if="componentInfo.type === 'component'" :key="componentKey" :is="componentInfo.component" :params="componentInfo.params" />

    <!-- iframe类型 -->
    <IframePage v-else-if="componentInfo.type === 'iframe'" :key="componentKey" :frame-src="componentInfo.frameSrc" />

    <!-- 异常页面 -->
    <Exception v-else :status="404" :title="'未能加载页面，请检查配置，支持组件及iframe'" />
  </div>
</template>

<style lang="less" scoped>
  .tab-container {
    height: 100%;
    width: 100%;
  }
</style>
