import SelectHelper from '/@form/components/helper/SelectHelper.vue';
import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
import { NFormItem, NInput } from 'naive-ui';
import { FunctionalComponent } from 'vue';

interface ComponentProps {
  widgetInfo: Recordable;
}
export const AppendixComponent: FunctionalComponent<ComponentProps> = (props) => {
  const { widgetInfo } = props;
  return (
    <SelectHelper setting-url={widgetInfo.settingUrl}>
      <NFormItem label={widgetInfo.title} showFeedback={false}>
        <div class="upload-tips"> 请点击【字段附件】执行上传 </div>
      </NFormItem>
    </SelectHelper>
  );
};

export const AppendixSetting: FunctionalComponent<ComponentProps> = (props) => {
  const { widgetInfo } = props;
  return (
    <BaseOptions>
      <NFormItem label={'组件ID'} showFeedback={false}>
        <NInput v-model={[widgetInfo.id, 'value']} disabled={true} />
      </NFormItem>
      <NFormItem label={'组件名'} showFeedback={false}>
        <NInput v-model={[widgetInfo.title, 'value']} maxlength="40" />
      </NFormItem>
    </BaseOptions>
  );
};
