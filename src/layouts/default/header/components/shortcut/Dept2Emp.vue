<template>
  <Tooltip :title="'组织结构'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-people"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'组织'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/Comm/TreeEns?EnName=TreeEns_Dept2Emp');
  };
</script>
