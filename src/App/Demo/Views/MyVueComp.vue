<template>
  <div class="wrapper">
    <h2>Hello! 这是一个自定义的vue文件</h2>
    <pre class="args">页面参数: {{ JSON.stringify(params, null, 2) }}</pre>
  </div>
</template>

<script lang="ts" setup>
  defineProps({
    params: {
      type: Object,
    },
  });
</script>

<style lang="less" scoped>
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 500px;
    background-color: #fff;
    padding-top: 50px;
  }
  .args {
    background-color: #ccc;
    padding: 10px 12px;
  }
</style>
