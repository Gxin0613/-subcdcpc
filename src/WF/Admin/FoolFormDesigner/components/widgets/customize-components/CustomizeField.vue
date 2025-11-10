<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl" ref="helperInstance">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" :label-placement="labelPlacement" style="overflow: hidden">
      <img :src="loadImage(widgetInfo.dto?.UIContralType)" />
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  export default defineComponent({
    name: 'CustomizeField',
  });
</script>
<script lang="ts" setup>
  import { defineComponent, PropType, onMounted, unref, shallowRef, inject, computed, ComputedRef } from 'vue';
  import { NFormItem } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';
  import { message } from 'ant-design-vue';
  import { decodeExtraParams } from '/@/bp/tools/ParamUtils';
  import { allowWholeLine } from '/@form/utils/SpanUtils';
  import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { DBEnums, EnTypeMap } from '../../../props/database/DatabaseFormItem';

  // 自定义行内组件
  const props = defineProps({
    widgetInfo: {
      type: Object as PropType<UniversalFieldItemProps>,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update-widget']);
  const helperInstance = shallowRef<InstanceType<typeof SelectHelper>>();

  const labelPlacement: ComputedRef = computed(() => {
    const { widgetInfo } = props;
    return allowWholeLine(widgetInfo as unknown as Recordable) && widgetInfo.inputSpan && widgetInfo.inputSpan > 3 ? 'top' : 'left';
  });

  const AtPara = unref(props).widgetInfo.dto!.AtPara;

  const paraMap = decodeExtraParams(AtPara);
  const EnName = paraMap.get('EnName');
  const PKVal = unref(props).widgetInfo.dto?.MyPK;

  const checkAtPara = async () => {
    if (EnName && EnName !== 'undefined') return;
    const type = unref(props).widgetInfo.dto?.UIContralType as unknown as DBEnums;
    const enInfo = EnTypeMap.get(type);
    if (!enInfo) {
      message.error(`当前UI控件类型 - ${type}  未定义`);
      return;
    }
    const attr = new MapAttr(PKVal);
    await attr.RetrieveFromDBSources();
    if (!EnName) attr.SetPara('EnName', enInfo);
    await attr.Update();
    // 更新AtPara
    emit('update-widget', 'AtPara', attr.GetValStringByKey('AtPara'));
  };
  onMounted(async () => {
    if (!PKVal) {
      message.error('出现错误，获取自定义组件实体类或主键失败');
      return;
    }
    checkAtPara();
  });
  const customizePicList = inject('customizePicList') as Array<string>;
  // 背景图加载失败新增默认图片
  const loadImage = (uiControlType: number | undefined) => {
    if (!uiControlType) return new URL(`../../../Img/unknown.webp`, import.meta.url).href;
    const idx = customizePicList.findIndex((pic) => parseInt(pic) === parseInt(uiControlType));
    if (idx > -1) {
      return new URL(`../../../Img/${uiControlType}.png`, import.meta.url).href;
    }
    return new URL(`../../../Img/unknown.webp`, import.meta.url).href;
  };
  const settingUrl = `../../Comm/EnOnly.htm?EnName=${EnName}&PKVal=${PKVal}`;
</script>

<style lang="less" scoped>
  :deep(.n-form-item .n-form-item-blank) {
    border: 1px solid #dddddd;
    color: #999999;
    // display: flex;
    // align-items: center;
    // justify-content: flex-start;

    img {
      margin-left: 12px;
      margin-right: 12px;
      width: 100%;
      height: 32px;
      object-fit: cover;
    }
  }
</style>
