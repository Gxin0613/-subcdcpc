<template>
  <Tooltip title="String" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <OrderedListOutlined />
      <span style="font-size: 12px">Num</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { OrderedListOutlined } from '@ant-design/icons-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    // go('/WF/Comm/GroupPageNew?EnName=GPN_NewFlow')
    go('/WF/Comm/En?EnName=TS.FrmUI.MapAttrNum&PKVal=ND101_Emps');
  };
</script>
