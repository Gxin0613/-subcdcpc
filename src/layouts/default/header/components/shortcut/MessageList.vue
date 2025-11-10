<template>
  <Tooltip :title="'消息列表'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-bubbles"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'消息'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/GL/Msg');
  };
</script>
