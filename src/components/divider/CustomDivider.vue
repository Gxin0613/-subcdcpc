<template>
  <div :style="customStyle"> </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const props = defineProps({
    height: {
      type: String,
      default: '1px',
    },
    width: {
      type: String,
      default: '100%',
    },
    color: {
      type: String,
      default: '#cccccc',
    },
  });

  const customStyle = computed(() => {
    return {
      height: props.height,
      width: props.width,
      backgroundColor: props.color,
    };
  });
</script>
