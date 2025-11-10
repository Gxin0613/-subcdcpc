<template>
  <SelectHelper :widget="widgetInfo" :setting-url="settingUrl">
    <div class="group-bar">
      <div class="title">
        <div class="name">
          {{ widgetInfo?.title }}
        </div>
        <div class="type">
          {{ widgetInfo?.dto?.CtrlType }}
        </div>
      </div>
    </div>
  </SelectHelper>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { FormGroup } from '/@form/props/form/FormComponents';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';

  export default defineComponent({
    name: 'ContainerDir',
    components: {
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<FormGroup>,
      },
    },
    setup(props) {
      // 全局加载主题
      return {
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.GroupFieldDir&PKVal=${props?.widgetInfo?.id}`,
      };
    },
  });
</script>

<style lang="less" scoped>
  .group-bar {
    width: 100%;
    // 设置最小宽度方便放组件
    height: 40px;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    border-radius: 4px;

    .title {
      height: 40px;
      background-color: #f2f5f7;
      width: 100%;
      box-sizing: border-box;
      line-height: 40px;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-style: italic;

      .type {
        font-weight: normal;
      }
    }
  }
</style>
