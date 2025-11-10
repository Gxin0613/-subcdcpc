<template>
  <div class="p-1">
    {{ '按数据集合启动： 2ByDataSet' }}
    <fieldset>
      <legend> xxxx</legend>
      <ul>
        <li>1. 配置主表数据源</li>
        <li>2. 配置子表数据源</li>
      </ul>
    </fieldset>
  </div>
</template>
<script lang="ts" setup>
  /**
   *  在此组件定义的方法如果需要父组件访问，一定需要通过defineExpose导出
   *  重要：需要保存数据的组件都需要定义async Save方法，此方法统一在父组件中调用
   */

  const Save = async () => {
    console.log('执行保存方法');
  };
  defineExpose({ Save });
</script>
