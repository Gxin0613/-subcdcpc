<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="'地址'" :show-require-mark="true" :show-feedback="false">
      <div class="item">
        <i class="input-prefix-icon icon-location-pin"></i>
        <n-button type="primary" style="height: 30px">{{ '上传身份证' }}</n-button>
      </div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NFormItem, NButton } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'UniversalIdUpload',
    components: {
      NFormItem,
      NButton,
      SelectHelper,
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
        settingUrl: `../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrCard&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,
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
    justify-content: space-between;
    box-sizing: border-box;
    overflow: hidden;

    i {
      margin-left: 8px;
    }

    &:deep(.n-form-item-blank) {
      width: 100%;
      overflow: hidden;
    }
  }
</style>
