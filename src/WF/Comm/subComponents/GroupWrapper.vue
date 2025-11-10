<template>
  <div class="group-wrapper">
    <div v-if="title" class="group-title">
      <div @click.stop="toggleCollapse"> <SendOutlined class="collapse-icon" style="margin-right: 8px" :style="iconStyle" />{{ title }} </div>
    </div>
    <Transition name="slide-fade">
      <div v-show="!collapse" class="p-4" style="padding-top: 0" :style="contentStyle">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
  import { SendOutlined } from '@ant-design/icons-vue';
  import { computed, ref } from 'vue';

  defineProps({
    title: {
      type: String,
    },
    contentStyle: {
      type: Object,
      default: () => ({}),
    },
  });
  const collapse = ref(false);
  const toggleCollapse = () => {
    collapse.value = !collapse.value;
  };
  const iconStyle = computed(() => {
    return {
      transform: collapse.value ? 'rotate(0deg)' : 'rotate(90deg)',
    };
  });
</script>

<style lang="less" scoped>
  .slide-fade-enter-active {
    transition: all 0.2s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }

  .group-wrapper {
    background-color: white;
    box-sizing: border-box;
    margin-bottom: 8px;
    overflow: hidden;

    .group-title {
      font-size: 16px;
      background: linear-gradient(90deg, #f0f8ff 0%, #f5f5f5 100%);
      border: 1px solid #d6e4ff;
      color: #1c4d73;
      font-weight: 500;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);

      padding: 8px 12px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      // &::before {
      //   content: '';
      //   position: absolute;
      //   left: 0;
      //   top: 50%;
      //   transform: translateY(-50%);
      //   width: 4px;
      //   height: 20px;
      //   background: #1890ff;
      //   border-radius: 2px;
      // }

      .collapse-icon {
        font-size: 16px;
        transition: transform 0.3s;
      }

      .collapse-btn {
        cursor: pointer;
        color: white;
      }
    }
  }
</style>
