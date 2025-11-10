<template>
  <div
    v-show="visible"
    class="context-menu"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }">
    <ul class="menuUl">
      <li v-for="item in menuItems"
          v-hasPermi="item.hasPermi"
          :key="item.label"
          @click="handleMenuClick(item)">
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      visible: Boolean,
      position: Object,
      menuItems: Array
    },
    methods: {
      handleMenuClick(item) {
        this.$emit(item.method,item.param);
        this.$emit('update:visible', false)
      }
    }
  }
</script>

<style>
  .context-menu {
    position: fixed;
    /*background: white;*/
    /*background: #E7F0FF;*/
    /*box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);*/
    z-index: 9999;
    font-size: 14px;
  }

  .menuUl {
    height: auto;
    width: auto;
    font-size: 14px;
    text-align: left;
    border-radius: 3px;
    border: none;
    background-color: #c4c4c4;
    /*color: #fff;*/
    color: #1890ff;
    list-style: none;
    padding: 010px;
  }

  .menuUl li {
    line-height: 25px;
    width: 100px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.47);
  }

  .menuUl li:hover {
  /*/ / background-color: rgb（26, 117, 158);*/
    color: rgb(54, 138, 175);
  }


</style>
