<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <div class="item">
        <n-rate color="#1890ff" />
      </div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NRate, NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';
  export default defineComponent({
    name: 'UniversalRate',
    components: {
      NFormItem,
      SelectHelper,
      NRate,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<UniversalFieldItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.ExtScore&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,
      };
    },
  });
</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: 100%;
    border: 1px solid #eeeeee;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    &:deep(.n-form-item-blank) {
      width: 100%;
      overflow: hidden;
    }
  }
</style>
