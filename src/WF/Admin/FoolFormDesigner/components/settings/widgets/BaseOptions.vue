<template>
  <div class="input-options">
    <n-form label-placement="left" label-width="90" label-align="left">
      <slot></slot>
    </n-form>
  </div>
</template>

<script lang="ts" setup>
  import { NForm } from 'naive-ui';
</script>

<style lang="less" scoped>
  .input-options {
    width: 100%;
    height: 100%;
    &:deep(.n-form-item .n-form-item-blank) {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
</style>
