<template>
  <div class="container" @touchstart="touchStart" @touchmove="touchEnd">
    <VanEmpty v-if="errMsg" :description="errMsg" />
    <Tabs v-model:active="activeKey" @click-tab="updateTab">
      <Tab v-for="tab in tabsRef" :title="tab.title" :name="tab.url" :key="tab.key" />
    </Tabs>
    <!-- <div v-for="tab in tabsRef" :title="tab.title" :key="tab.key"> -->
    <!-- <component v-if="activeKey == tab.url" :is="tab.comp" :key="tab.key" :params="tab.params" ignore-pt in-tabs /> -->
    <!-- </div> -->
    <keep-alive v-if="currTab">
      <component v-if="currTab.comp" :is="currTab.comp" :key="currTab.key" :params="currTab.params" ignore-pt in-tabs />
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
  import { markRaw, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { ClassFactoryOfTabs } from '/@/WF/Comm/UIEntity/ClassFactoryOfTabs';
  import { TabInfo } from '/@/bp/UIEntity/TabsBase';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { Empty as VanEmpty, Tab, Tabs } from 'vant';
  defineOptions({
    name: 'CCMobileTabs',
  });
  const props = defineProps({
    params: {
      type: Object,
      default: () => {},
    },
  });

  let startX = 0;
  let _start_timestamp_ = 0;
  const threshold = 100;
  const touchStart = (e) => {
    startX = e.touches[0].pageX;
    _start_timestamp_ = Date.now();
  };
  const swipeRight = () => {
    let _idx = tabsRef.value.findIndex((tab) => tab.url == activeKey.value);
    if (_idx > 0) _idx--;
    else _idx = tabsRef.value.length;
    activeKey.value = tabsRef.value[_idx].url;
    updateTab();
  };
  const swipeLeft = () => {
    let _idx = tabsRef.value.findIndex((tab) => tab.url == activeKey.value);
    if (_idx < tabsRef.value.length - 1) _idx++;
    else _idx = 0;
    activeKey.value = tabsRef.value[_idx].url;
    updateTab();
  };
  const touchEnd = (e) => {
    console.log({ e });
    let endX = e.touches[0].pageX;
    if (Math.abs(endX - startX) < threshold) return;
    if (Date.now() - _start_timestamp_ > 1200) return;

    if (endX > startX) {
      swipeRight();
      return;
    }
    if (endX < startX) {
      swipeLeft();
      return;
    }
  };

  const updateTab = () => {
    currTab.value = tabsRef.value.find((tab) => tab.url == activeKey.value);
  };
  const currTab = ref<TabInfo>();
  const activeKey = ref('');
  const tabsRef = ref<TabInfo[]>([]);
  const errMsg = ref('');

  const emit = defineEmits(['hide-navbar']);

  const loadTabs = async () => {
    const route = useRoute();
    let enName = route.query.EnName as string;
    if (!enName) enName = props.params.EnName;
    if (!enName) {
      errMsg.value = '缺少必要参数 EnName';
      return;
    }
    const cls = await ClassFactoryOfTabs.GetEn(enName);
    await cls.Init();
    const tabs = cls.tabList;
    if (tabs.length === 0) {
      errMsg.value = '请配置对应的tab页面';
      return;
    }
    for (const tab of tabs) {
      tab.params = getAllRequestParams(tab.url);
      if (tab.urlType === 'vue') {
        const c = useCachedComponentLoader(tab.url);
        tab.comp = c ? markRaw(c) : null;
      }
    }
    tabsRef.value = tabs;
    // if (tabs.length > 0) activeKey.value = tabs[0].key;
    if (tabs.length > 0) currTab.value = tabs[0];
  };
  onMounted(() => {
    loadTabs();
    emit('hide-navbar');
  });
</script>
