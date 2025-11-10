<template>
  <Tooltip title="DataV" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-pie-chart"></i>
      <span style="font-size: 12px; padding-left: 5px">DataV</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/Comm/DataV');
  };
</script>
