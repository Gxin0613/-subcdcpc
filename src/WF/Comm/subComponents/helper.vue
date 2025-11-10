<template>
  <Popover trigger="click" v-if="!gloHideHelpDoc">
    <template #content>
      <span v-if="helpDocs.startsWith('http')">{{ '打开新链接查看帮助文档' }}</span>
      <v-md-preview v-else :text="appTitleHelper(helpDocs)" preview-class="vuepress-markdown-body" height="400px" />
    </template>
    <QuestionCircleOutlined style="margin-left: 6px" @click="openHelpDocs" />
  </Popover>
</template>

<script lang="ts" setup>
  import { Popover } from 'ant-design-vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  import { getAppEnvConfig } from '/@/utils/env';
  import { ref } from 'vue';
  const props = defineProps({
    helpDocs: {
      type: String,
      default: '',
    },
  });
  const openHelpDocs = () => {
    const helpDocs = props.helpDocs;
    if (helpDocs?.startsWith('http')) {
      window.open(helpDocs, '_blank');
      return;
    }
  };

  const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
  const gloHideHelpDoc = ref(VITE_GLOB_HIDE_HELP_DOCS);
</script>
