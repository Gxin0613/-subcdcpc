<template>
  <div class="step-form-container">
    <div class="step-area">
      <Steps :current="current">
        <Step v-for="step in steps" :key="step.id" :title="step.title" :sub-title="step.subTitle" :description="step.description" />
      </Steps>
    </div>
    <div class="step-form">
      <p v-for="step in steps" :key="step"> {{ step }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Steps, Step } from 'ant-design-vue';

  defineProps({
    steps: {
      type: Array,
      default: () => [],
    },
    current: {
      type: Number,
      default: 0,
    },
  });
</script>

<style lang="less" scoped></style>
