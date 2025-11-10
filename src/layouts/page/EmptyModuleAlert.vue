<template>
  <div class="no-menu-alert">
    <Alert :message="'提示'" show-icon>
      <template #description>
        <h4>{{'当前模块下没有菜单，请鼠标移动到模块名称，然后点【新建菜单】。'}}</h4>
        <img src="/resource/NewMenu.png" alt="" style="width: 700px; height: auto; object-fit: contain" />
      </template>
    </Alert>
  </div>
</template>

<script setup lang="ts">
  import { Alert } from 'ant-design-vue';
</script>

<style lang="less" scoped>
  .no-menu-alert {
    padding: 12px;
  }
</style>
