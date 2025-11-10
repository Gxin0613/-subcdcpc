<template>
  <div class="fiexd" :style="setWidth">
    <div class="flex">
      <div class="btn_style add-btn" @click="addSystem"> + </div>
      <!-- <div class="btn_style refresh-btn" @click="refreshMenu"><i class="icon-refresh"></i></div> -->
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import Events from '/@/utils/Events';
  const props = defineProps({
    width: {
      type: Number,
      default: 210,
    },
  });
  const setWidth = computed(() => {
    return {
      width: props.width + 'px',
    };
  });

  //添加ccfast系统
  const addSystem = () => {
    const url = GloComm.UrlGPN('GPN_System');
    Events.emit('ccfast_base_com_drawer', url);
  };
  //刷新菜单显示
  const refreshMenu = () => {
    window.location.reload();
  };
</script>
<style lang="less" scoped>
  //固钉
  .fiexd {
    position: fixed;
    bottom: 40px;
    z-index: 1;
  }
  .flex {
    display: flex;
    justify-content: space-evenly;
  }
  .btn_style {
    width: 40px;
    height: 40px;
    color: #ff875a;
    text-align: center;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid #ff875a;
    background-color: var(--sider-dark-bg-color);
    &:hover {
      border-color: #ff875a;
      color: #ff875a;
    }
  }
  .add-btn {
    line-height: 30px;
    font-size: 30px;
  }
  .refresh-btn {
    line-height: 40px;
    font-size: 25px;
  }
</style>
