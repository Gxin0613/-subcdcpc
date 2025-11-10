<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false">
      <div class="item">{{ '扩展控件' }}</div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, unref } from 'vue';
  import { NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';
  import { decodeExtraParams } from '/@/bp/tools/ParamUtils';
  import { DataType } from '/@/bp/en/DataType';
  import { DBEnums } from '../../../props/database/DatabaseFormItem';
  import type { MapAttr } from '../../../props/database/FormInfo';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'CustomizeExt',
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
      const label = ref<String>(props.widgetInfo.title);
      const dto = unref(props).widgetInfo.dto! as unknown as MapAttr;
      const AtPara = dto.AtPara;
      const paraMap = decodeExtraParams(AtPara);
      let EnName = paraMap.get('EnName');
      if (EnName === '' || EnName == null || EnName == undefined) {
        EnName = 'TS.FrmUI.MapAttrString';

        if (dto.MyDataType === DataType.AppInt && [DBEnums.DDL, DBEnums.RadioBtn].includes(dto.UIContralType)) {
          EnName = 'TS.FrmUI.MapAttrEnum';
        }

        if (dto.MyDataType === DataType.AppBoolean) {
          EnName = 'TS.FrmUI.MapAttrBoolean';
        }
        if (dto.MyDataType === DataType.AppInt || dto.MyDataType === DataType.AppFloat || dto.MyDataType === DataType.AppDouble) {
          EnName = 'TS.FrmUI.MapAttrNum';
        }

        if (dto.MyDataType === DataType.AppString && [DBEnums.DDL].includes(dto.UIContralType)) {
          EnName = 'TS.FrmUI.MapAttrSFSQL';
          EnName = 'TS.FrmUI.MapAttrSFTable';
        }
        if (dto.MyDataType === DataType.AppDate && dto.MyDataType === DataType.AppDateTime) {
          EnName = 'TS.FrmUI.MapAttrDT';
        }
      }
      return {
        label,
        InputTheme,
        settingUrl: `../../Comm/EnOnly.htm?EnName=${EnName}&PKVal=${props.widgetInfo?.id}&s=${Math.random()}`,
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
