<template>
  <div class="row c" id="infoContent">
    <div class="superUserTitle">{{'超级用户后台登录'}}</div>
    <ul class="content">
      <li> 管理组织与组织下的人员. </li>
      <li> 管理每个组织下的流程. </li>
      <li> 管理每个组织下的表单. </li>
    </ul>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
  #infoContent {
    height: 90vh;
    .superUserTitle {
      margin: 10px 0;
      font-size: 20px;
    }
    .content {
      padding: 0 20px;
    }
  }
</style>
