<script lang="ts" setup>
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
</script>

<template>
  <div class="doc-wrapper">
    <v-md-preview v-if="appTitleHelper(params?.doc)" :text="params?.doc" preview-class="vuepress-markdown-body" height="600" />
  </div>
</template>

<style lang="less" scoped>
  .doc-wrapper {
    padding: 36px 12px 12px 12px;
    background-color: white;
    :deep(.github-markdown-body) {
      & h4,
      & h3 {
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 3px solid var(--system-active-bg-color);
        height: 15px;
        margin-left: 30px;
        line-height: 15px;
        color: #000;
        &::after {
          content: ' ';
          display: block;
          margin-left: -10px;
          padding-top: 10px;
          border-bottom: 1px solid #cfcfcf;
        }
      }
      & ul,
      & ol {
        & li {
          //帮助
          margin: 9px 0;
          font-size: 13px;
          color: #8c8c8c;
          margin-left: 15px;
          &:nth-child(1) {
            margin-top: 25px;
          }
        }
      }
    }
  }
</style>
