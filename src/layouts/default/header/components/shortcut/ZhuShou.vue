<template>
  <Tooltip :title="'助手'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-drawer"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'助手'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGoBlank } from "/@/hooks/web/usePage";
  const go = useGoBlank();
  const toFlowPage = () => {
    go('/#/Copilot', true);
  };
</script>
