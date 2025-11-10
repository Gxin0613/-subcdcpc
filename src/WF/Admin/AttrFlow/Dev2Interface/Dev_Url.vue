<template>
  <div>{{ 'Dev_Url文件' }}</div>
  <div>参数： {{ params }}</div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: {
      params: {
        type: Object,
        default: () => {},
      },
    },
    setup(props, context) {
      console.log(props, context);
    },
  });
</script>
