<template>
  <Tooltip :title="'实体属性'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toFlowPage">
      <OrderedListOutlined />
      <span style="font-size: 12px">{{'实体属性'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { OrderedListOutlined } from '@ant-design/icons-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toFlowPage = () => {
    go('/WF/Comm/En?EnName=TS.CCBill.FrmDict&PKVal=Dict_XueShengTaiZhang');
  };
</script>
