import SelectHelper from '/@form/components/helper/SelectHelper.vue';
import BaseOptions from '/@form/components/settings/widgets/BaseOptions.vue';
import { NFormItem, NInput, NProgress, NRate, NButton } from 'naive-ui';
import { FunctionalComponent } from 'vue';

interface ComponentProps {
  widgetInfo: Recordable;
}

export const BasicComponent: FunctionalComponent<ComponentProps> = (props) => {
  const { widgetInfo } = props;
  const widgetType = widgetInfo.type;
  return (
    <SelectHelper setting-url={widgetInfo.settingUrl}>
      <NFormItem label={widgetInfo.title} showFeedback={false}>
        {widgetType === 'map' && <div class="item">地图组件</div>}
        {widgetType === 'link' && (
          <div class="item">
            <a href={widgetInfo.modelVal} target="_blank" rel="noopenner noreferrer">
              链接跳转
            </a>
          </div>
        )}
        {widgetType === 'progress' && <NProgress></NProgress>}
        {widgetType === 'rate' && <NRate></NRate>}
        {widgetType === 'signCheck' && <div class="item"></div>}
        {widgetType === 'iframe' && (
          <div class="universal-iframe">
            <div class="title">{widgetInfo?.title}</div>
            <div class="content">
              <iframe src={widgetInfo.url} class="iframe"></iframe>
            </div>
          </div>
        )}
        {widgetType === 'IdUpload' && (
          <div class="item">
            <i class="input-prefix-icon icon-location-pin"></i>
            <n-button type="primary" style="height: 30px">
              上传身份证
            </n-button>
          </div>
        )}
        {widgetType === 'IdName' && <div class="item"></div>}
        {widgetType === 'IdNumber' && <div class="item"></div>}
        {widgetType === 'button' && (
          <div class="item">
            <NButton secondary>按钮</NButton>
          </div>
        )}
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
