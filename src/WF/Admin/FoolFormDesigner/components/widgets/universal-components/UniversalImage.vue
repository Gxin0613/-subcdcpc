<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <img :src="widgetInfo.src" :alt="widgetInfo.title" :style="imgStyle" />
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, computed } from 'vue';
  import { NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'UniversalMap',
    components: {
      NFormItem,
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<UniversalFieldItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<string>(props.widgetInfo.title);
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/EnOnly.htm?EnName=TS.FrmUI.FrmImg&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,

        imgStyle: computed(() => {
          return {
            width: '100%',
            objectFit: 'contain',
          };
        }),
      };
    },
  });
</script>

<style lang="less" scoped>
  .item {
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid #eeeeee;
    color: #999999;
  }
</style>
