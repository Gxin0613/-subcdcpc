<template>
  <!-- <iframe v-if="iframeUrl" class="dev-form-container" :src="iframeUrl"></iframe> -->
  <div>loading...</div>
  <!--  <DevFormHeader />-->
  <!--  <Editor />-->
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { getToken } from '/@/utils/auth';
  import { usePostMessage } from '/@/hooks/message/usePostMessage';
  import { getAppEnvConfig } from '/@/utils/env';

  import { ccbpm } from '/#/ccbpm';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import Events from '/@/utils/Events';
  import { CHANGE_FORM_TYPE } from '/@/enums/eventsEnum';
  import { FrmType } from '../EnumLab';
  import WebUser from '/@/bp/web/WebUser';
  // import DevFormHeader from './components/header/Index.vue';
  // import Editor from './components/editor/Index.vue';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });

  // const iframeUrl = ref('');
  const getUrlFromObject = () => {
    const obj = props.params;
    const keys = Object.keys(obj);
    if (keys.length === 0) return '';
    return keys.map((key) => `${key}=${obj[key]}`).join('&') + '&Token=' + getToken();
  };
  const fetchUrl = () => {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    let prefix = VITE_GLOB_API_URL;
    if (!prefix.endsWith('/')) {
      prefix += '/';
    }
    let url = prefix + `WF/Admin/DevelopDesigner/Designer.htm?hideToolbar=1&embedded=1&` + getUrlFromObject() + '&RedirectUrl=' + encodeURIComponent(window.location.href);
    // iframeUrl.value = url;
    window.location.href = url;
  };

  onMounted(() => {
    fetchUrl();
  });
  const listenIframeEvent = (event) => {
    //接收消息
    const data = event.data as ccbpm.PostMessageInfo;
    switch (data.type) {
      case MessageTypeEnum.ChangeFormType:
        //接受准备消息
        Events.emit(CHANGE_FORM_TYPE, FrmType.FoolForm);
        break;
      default: {
        break;
      }
    }
  };
  usePostMessage(listenIframeEvent);
</script>

<style lang="less" scoped>
  .dev-form-container {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    border: none;
  }
</style>
