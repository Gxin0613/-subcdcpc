<template>
  <span v-if="required && labelRight" style="color: #ff5555; margin-right: 6px">*</span>
  <i v-if="icon" style="margin-right: 6px" :class="icon"></i>
  <span v-if="fieldLink" class="link-title" @click="openUrl(fieldTitle, fieldLink)">{{ fieldTitle }}</span>
  <span v-else :title="fieldTitle">{{ fieldTitle }}</span>
  <span v-if="required && !labelRight" style="color: #ff5555; margin-left: 6px">*</span>
</template>

<script setup lang="ts">
  import { inject } from 'vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { DealExp } from '/@/utils/gener/StringUtils';
  const props = defineProps({
    fieldTitle: {
      type: String,
      default: () => {
        return {};
      },
    },
    fieldLink: {
      type: [String, Object],
      default: '',
      required: false,
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
  });

  const labelRight = import.meta.env.VITE_ENTITY_LABEL_ALIGN == 'right';
  // 由外部托管基础组件
  const handleGPNCallback = inject('handleGPNCallback') as Function;
  const openUrl = (title = '', data: string | Recordable | null) => {
    if (data instanceof GPNReturnObj) {
      handleGPNCallback(data, data.title);
      return;
    }
    let finalSrc = '';
    if (typeof data === 'string') {
      finalSrc = data;
    }
    finalSrc = DealExp(finalSrc, props.rowData, false, true);
    if (handleGPNCallback && data) {
      if (finalSrc.startsWith('http://') || finalSrc.startsWith('https://')) {
        handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByDrawer100, finalSrc), title);
        return;
      }
      handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByModal, finalSrc), title);
    }
  };
  // end
</script>

<style lang="less" scoped>
  .link-title {
    color: #1279ff;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #0960bd;
    }
  }
</style>
