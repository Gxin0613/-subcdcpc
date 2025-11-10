<template>
  <div class="wrapper"> </div>
</template>
<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  // mapattrs
  const route = useRoute();
  const frmID = route.query.FrmID;
  onMounted(() => {});
</script>
<style lang="less" scoped>
  .wrapper {
    width: 100vw;
    height: var(--viewport-height);
  }
</style>
