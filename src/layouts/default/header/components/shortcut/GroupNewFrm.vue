<template>
  <Tooltip :title="'表单'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-diamond"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'表单'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/Comm/TreeEns?EnName=TreeEns_FrmSort2Frm');
  };
</script>
