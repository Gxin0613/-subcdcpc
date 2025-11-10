<template>
  <div class="preview-wrapper">
    <div class="phone-wrapper">
      <iframe class="web-content" :src="url"> </iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    url: {
      type: String,
      default: '',
    },
  });
</script>

<style lang="less" scoped>
  .preview-wrapper {
    width: 100%;
    height: calc(var(--viewport-height) - 60px);
    padding-top: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    .phone-wrapper {
      // width: 420px;
      // height: 830px;
      width: 400px;
      height: 760px;
      flex-shrink: 0;
      position: relative;
      background-image: url(/resource/img/mobile-bg.png);
      background-size: 100% 100%;
      background-position: center center;
      .web-content {
        // width: 390px;
        // height: 730px;
        width: 368px;
        height: 670px;
        position: absolute;
        top: 50px;
        left: 15px;
        overflow: hidden scroll;
        border: none;
        outline: none;
      }
    }
  }
</style>
