<template>
  <Tooltip :title="'发起流程'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <node-index-outlined />
      <span style="font-size: 12px">{{ '发起流程' }}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { NodeIndexOutlined } from '@ant-design/icons-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/S_MyFlow?FK_Flow=001');
  };
</script>
