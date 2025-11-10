<template>
  <div></div>
</template>
<script lang="ts" setup>
  import { onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import Events from '/@/utils/Events';
  const route = useRoute();
  const router = useRouter();
  const tabStore = useMultipleTabStore();
  const iframeMessageHandler = ({ data }) => {
    const currentTab = tabStore.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    switch (data.type) {
      case MessageTypeEnum.ReloadPage: {
        if (route.path.startsWith('/Middle/')) {
          Events.emit('middle_close_current_tab');
          return;
        }
        if (currentTab) {
          tabStore.closeTab(currentTab, router);
        }
      }
    }
  };
  onMounted(() => {
    window.addEventListener('message', iframeMessageHandler, true);
  });

  onUnmounted(() => {
    window.removeEventListener('message', iframeMessageHandler, true);
  });
</script>
