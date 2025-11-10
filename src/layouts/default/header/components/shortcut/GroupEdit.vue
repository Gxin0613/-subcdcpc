<template>
  <Tooltip :title="'低代码'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <i class="icon-puzzle"></i>
      <span style="font-size: 12px; padding-left: 5px">{{'低代码'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/GL/System');
    // router.push({ path: '/WF/GL/System' });
  };
</script>
