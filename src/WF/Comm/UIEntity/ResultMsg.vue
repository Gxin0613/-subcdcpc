<template>
  <div class="container">
    <div class="title">{{ customParams.title }}</div>
    <div class="divider"> </div>
    <div class="result-code">
      {{ customParams.msg }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps({
    customParams: {
      type: Object,
      default: () => ({
        title: 'Result',
        msg: '',
      }),
    },
  });
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    background-color: white;

    .title {
      font-size: 22px;
      box-sizing: border-box;
      padding-left: 20px;
      padding: 20px 12px;
    }

    .divider {
      height: 2px;
      background-color: #f2f5f7;
    }
    .result-code {
      width: calc(100% - 40px);
      box-sizing: border-box;
      padding: 20px;
      height: 100%;
      white-space: pre-wrap;
    }
  }
</style>
