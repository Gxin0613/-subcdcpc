<template>
  <div class="p-4">
    <GenerList :params="{ EnName: 'GL_FlowCheckInfo', FlowNo: query.FlowNo, WorkID: query.WorkID }" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import GenerList from '/@/WF/views/GenerList.vue';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const query = ref(props.params);
</script>
<style lang="less" scoped>
  h1,
  h2 {
    color: #333;
    font-weight: 600;
  }

  p,
  li {
    margin-bottom: 15px;
    font-size: 16px;
  }

  ul {
    list-style-type: disc;
    padding-left: 20px;
  }

  .checkFlow {
    font-weight: 600;
    margin-bottom: 25px;
  }
  .btmContent {
    margin-bottom: 10px;
    text-align: center;
  }
  .footer {
    text-align: center;
    padding: 10px 0;
    margin-top: 20px;
    font-size: 16px;
  }
  :deep(.ant-table-footer) {
    text-align: center;
    padding: 10px;
    background-color: #f2f2f2;
    // margin-top: 20px;
  }
  :deep(.warning-row) {
    color: #dada88;
  }
  :deep(.info-row) {
    color: green;
  }
  :deep(.error-row) {
    color: red;
  }
</style>
