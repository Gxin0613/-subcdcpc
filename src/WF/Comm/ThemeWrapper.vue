<template>
  <div class="theme-wrapper" :class="getHeaderClass">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';

  //按钮主题色
  const { prefixCls } = useDesign('layout-content');
  const { getHeaderTheme } = useHeaderSetting();
  const getHeaderClass = computed(() => {
    const theme = unref(getHeaderTheme);
    return [
      prefixCls,
      {
        [`${prefixCls}--${theme}`]: theme,
      },
    ];
  });
</script>
<style lang="less" scoped>
  @prefixCls:~'@{namespace}-layout-content';
     .@{prefixCls}{
       &--dark{
        // :deep(.ant-tag),
        :deep(.ant-btn-primary){
           background-color: var(--system-bg-color);
           border-color: var(--system-bg-color);
           &:hover{
             background-color: var(--system-hover-bg-color) ;
             border-color: var(--system-hover-bg-color);
           }
           &:active{
             background-color: var(--system-active-bg-color);
             border-color: var(--system-active-bg-color);
           }
         }
        //  :deep(.ant-tag-danger) {
        //   background-color: #ff5555;
        //   border-color: #ff5555;
        //   color: @white !important;
        // }
         :deep(.ant-switch-checked){
           background-color: var(--system-active-bg-color);
         }
         :deep(.ant-tabs-tab){
          &:hover{
            color: var(--system-hover-bg-color);
          }
         }
         :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
             color: var(--system-active-bg-color)
         }

         :deep(.ant-tabs-ink-bar) {
           background: var(--system-active-bg-color)
         }
         :deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active) {
           color: var(--system-active-bg-color)
         }
         :deep(.ant-menu-submenu){
          &:hover{
            .ant-menu-submenu-title{
              color:var(--system-hover-bg-color);
              .ant-menu-submenu-arrow{
                color:var(--system-hover-bg-color);
              }
            }
          }
         }
         :deep(.ant-menu-submenu-selected ){
          .ant-menu-submenu-title{
            color: var(--system-active-bg-color);
            .ant-menu-submenu-arrow{
                color:var(--system-active-bg-color);
              }
          }

         }
         :deep(.ant-menu-item){
          &:hover{
             background-color: var(--system-hover-bg-color) ;
             border-color: var(--system-hover-bg-color);
             color: @white;
           }
         }
         :deep(.ant-menu-item-selected){
            background-color: var(--system-active-bg-color);
            border-color: var(--system-active-bg-color);
            color: @white;
         }
       }
       &--light{
         color: @text-color-base;
         .ant-btn-primary:not(.ant-btn-background-ghost):not([disabled]) {
           color: @text-color-base;
         }
        //  :deep(.ant-tag) {
        //   color: @white !important;
        //  }
        //  :deep(.ant-tag),

         :deep(.ant-btn-primary){
             background-color: var(--system-bg-color);
             border-color: var(--system-bg-color);
             &:hover{
               background-color: var(--system-hover-bg-color) ;
               border-color: var(--system-hover-bg-color);
             }
             &:active{
               background-color: var(--system-active-bg-color);
               border-color: var(--system-active-bg-color);
             }
           }

           :deep(.ant-switch-checked){
           background-color: var(--system-active-bg-color);
         }

        //  :deep(.ant-tag-danger) {
        //   background-color: #ff5555;
        //   border-color: #ff5555;
        // }

         :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
             color: var(--system-active-bg-color)
         }

         :deep(.ant-tabs-ink-bar) {
           background: var(--system-active-bg-color)
         }
         :deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active) {
           color: var(--system-active-bg-color)
         }


       }
     }
</style>
