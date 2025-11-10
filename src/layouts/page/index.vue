<template>
  <RouterView>
    <template #default="{ Component, route }">
      <transition mode="out-in" appear>
        <!-- <keep-alive :include="getCaches">
          <component :is="Component" :key="route.fullPath" :params="getRouteParams(route)" />
        </keep-alive> -->
        <!-- <keep-alive :include="getCaches" :max="10" ref="keepAliveRef"> -->
        <component :is="Component" :key="getCacheKey(route)" :params="getRouteParams(route)" />
        <!-- </keep-alive> -->
      </transition>
    </template>
  </RouterView>
  <FrameLayout v-if="getCanEmbedIFramePage" />
</template>

<script lang="ts" setup>
  import FrameLayout from '/@/layouts/iframe/index.vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { computed, KeepAlive, shallowRef } from 'vue';
  // import { useRoute } from 'vue-router';

  defineOptions({ name: 'PageLayout' });

  const keepAliveRef = shallowRef<InstanceType<typeof KeepAlive> | null>(null);

  const { getCanEmbedIFramePage } = useRootSetting();
  const tabStore = useMultipleTabStore();
  const getCaches = computed((): string[] => {
    return tabStore.getCachedTabList;
  });

  // const isValidComponent = ref(true);

  // const route = useRoute();
  // watch(
  //   () => route.fullPath,
  //   (path) => {
  //     const pathKey = getCacheKey(route);
  //     if (tabStore.getClosedTabList.includes(path)) {
  //       isValidComponent.value = false;
  //       setTimeout(() => {
  //         const map = keepAliveRef.value?.$?.__v_cache as Map<string, any>;
  //         map.delete(pathKey);
  //         tabStore.removeClosedTab(path);
  //         isValidComponent.value = true;
  //       }, 200);
  //     } else {
  //       isValidComponent.value = true;
  //     }
  //   },
  // );

  const getCacheKey = (route) => {
    const pathKey = route.path;
    const metaParams = getMetaParams(route);
    return metaParams ? `${pathKey}_${metaParams}` : pathKey;
  };

  const getMetaParams = (route) => {
    const params = getRouteParams(route);
    const keys = Object.keys(params);
    if (keys.length === 0) return '';
    return keys
      .sort()
      .map((key) => `${key}-${params[key]}`)
      .join('_');
  };

  const getRouteParams = (route) => {
    const { meta, query } = route;
    if (typeof meta === 'object') {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { urlQuery, menuInfo, loaded, ...rest } = meta;
      const args = {
        ...rest,
        ...urlQuery,
      };
      return {
        ...args,
        ...query,
      };
    }
    return {};
  };
</script>
