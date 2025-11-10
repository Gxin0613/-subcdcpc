import SelectHelper from '/@form/components/helper/SelectHelper.vue';
import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
import { NFormItem, NInput, NInputGroupLabel, NInputNumber } from 'naive-ui';
import { FunctionalComponent } from 'vue';

interface ComponentProps {
  widgetInfo: Recordable;
}
type InputType = 'textarea' | 'text' | 'password';
const inputType = new Map<string, InputType>([
  ['0', 'text'],
  ['1', 'password'],
  ['2', 'textarea'],
  ['3', 'textarea'],
]);
const isNumber = (type: string) => ['integer', 'number', 'amount'].includes(type);
const isText = (type: string) => ['text', 'date', 'datetime'].includes(type);
export const BasicComponent: FunctionalComponent<ComponentProps> = (props) => {
  const { widgetInfo } = props;
  const widgetType = widgetInfo.type;
  return (
    <SelectHelper setting-url={widgetInfo.settingUrl}>
      <NFormItem label={widgetInfo.title} showFeedback={false}>
        {widgetInfo.prefix && <NInputGroupLabel>{widgetInfo.prefix}</NInputGroupLabel>}
        {isNumber(widgetType) && <NInputNumber></NInputNumber>}
        {isText(widgetType) && (
          <NInput
            type={inputType.get(widgetInfo.inputType)}
            v-slots={{
              prefix: () => (widgetType.includes('date') ? <i class="input-prefix-icon icon-calendar"></i> : <></>),
            }}
          ></NInput>
        )}
        {widgetInfo.suffix && <NInputGroupLabel>{widgetInfo.suffix}</NInputGroupLabel>}
      </NFormItem>
    </SelectHelper>
  );
};

export const BasicSetting: FunctionalComponent<ComponentProps> = (props) => {
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
