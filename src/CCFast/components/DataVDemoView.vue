<template>
  <div class="data-v-demo-view">
    <h1>{{ '自定义vue文件' }}</h1>
    <h3>外部参数: {{ JSON.stringify(props.params, null, 2) }}</h3>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    params: {
      type: Boolean,
      default: false,
    },
  });

  console.log({ props });
</script>

<style lang="less" scoped>
  .data-v-demo-view {
    width: 100%;
    height: 100%;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    h1 {
      color: #333;
      font-size: 24px;
    }
  }
</style>
