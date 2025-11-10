<template>
  <Tooltip :title="'流程'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-organization"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'流程'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/Comm/TreeEns?EnName=TreeEns_FlowSort2Flow');
  };
</script>
