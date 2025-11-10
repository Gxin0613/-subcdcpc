<template>
  <Tooltip :title="'项目'" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toPrjPage">
      <node-index-outlined />
      <span style="font-size: 12px">{{'项目'}}</span>
    </span>
  </Tooltip>
</template>

<script lang="ts" setup>
  import { Tooltip } from 'ant-design-vue';
  import { NodeIndexOutlined } from '@ant-design/icons-vue';
  import { useGo } from '/@/hooks/web/usePage';
  const go = useGo();
  const toPrjPage = () => {
    go('/WF/Comm/TreeEns?EnName=TreeEns_TemplateSort2Template');
  };
</script>
