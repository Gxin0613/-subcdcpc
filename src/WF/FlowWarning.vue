<template>
  <Result status="warning" :title="'警告提示'" style="background-color: white">
    <div class="desc">
      <div v-html="doc"></div>
    </div>
    <template v-if="isShowCloseBtn" #extra>
      <Button key="console" type="primary" @click="Close">{{ '关闭' }}</Button>
    </template>
  </Result>
</template>

<script lang="ts" setup>
  import { Result, Button } from 'ant-design-vue';
  defineProps({
    doc: {
      type: String,
      default: '',
      required: true,
    },
    isShowCloseBtn: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['CloseWindow']);
  const Close = () => {
    emit('CloseWindow');
  };
</script>

<style scoped></style>
