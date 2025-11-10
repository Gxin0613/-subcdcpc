<template>
  <aside class="attr-panel" :style="settingsStyle">
    <n-tabs type="line" :theme-overrides="TabsTheme" v-model:value="currentSettingTab">
      <n-tab-pane name="component" :tab="'组件设置'">
        <n-spin :show="loadingSetting">
          <div class="wrapper" v-if="chosen">
            <component :is="editWidget" />
          </div>
          <div class="wrapper" v-else>
            <n-empty v-if="settingsVisible" size="large" :description="'请选择一个组件'" />
          </div>
        </n-spin>
      </n-tab-pane>
      <n-tab-pane name="form" :tab="'表单设置'">
        <div class="wrapper">
          <FormSetting />
        </div>
      </n-tab-pane>
    </n-tabs>
  </aside>
</template>

<script lang="ts">
  import { NTabs, NTabPane, NForm, NFormItem, NRadioGroup, NRadioButton, NSpace, NColorPicker, NInputNumber, NEmpty, NSpin } from 'naive-ui';
  import { computed, defineComponent, onUnmounted, ref, onMounted } from 'vue';
  import { useDesignerStore } from '/@/store/modules/form';
  // load theme
  import { TabsTheme, RadioGroupTheme } from '/@form/theme/index';
  // import InputOptions from '../settings/widgets/input-widgets/Index.vue';
  // import AppendixOptions from '../settings/widgets/appendix-widgets/Index.vue';
  // import SlaveOptions from '../settings/widgets/slave-table-widgets/Index.vue';
  // import UniversalOptions from '../settings/widgets/universal-widgets/Index.vue';
  // import ContainerOptions from '../settings/widgets/container-widgets/Index.vue';
  import FormSetting from '../settings/form/Index.vue';
  import Event from '/@/utils/Events';

  const NormalFields = import.meta.glob('../settings/widgets/**/Index.vue', { eager: true });
  const Widgets: {
    [propName: string]: any;
  } = {};
  const paths = Object.keys(NormalFields as any);
  for (const path of paths) {
    const componentName = (NormalFields[path] as any).default.name;
    Widgets[componentName] = (NormalFields[path] as any).default;
  }
  export default defineComponent({
    components: {
      NTabs,
      NTabPane,
      NForm,
      NFormItem,
      NRadioGroup,
      NRadioButton,
      NSpace,
      NColorPicker,
      NInputNumber,
      NEmpty,
      NSpin,
      // InputOptions,
      // AppendixOptions,
      // SlaveOptions,
      // ContainerOptions,
      // UniversalOptions,
      ...Widgets,
      FormSetting,
    },
    setup() {
      const designerStore = useDesignerStore();
      const currentSettingTab = ref<'form' | 'component'>('form');
      const chosen = computed(() => {
        return !!designerStore.selectedWidget;
      });
      const editWidget = computed(() => {
        if (!chosen.value) return '';
        return designerStore.selectedWidget?.category + 'Options';
      });

      onMounted(async () => {
        Event.on('chooseWidget', () => {
          currentSettingTab.value = designerStore.selectedWidget ? 'component' : 'form';
        });
      });

      onUnmounted(() => {
        Event.off('chooseWidget');
      });

      return {
        chosen,
        editWidget,
        RadioGroupTheme,
        TabsTheme,
        currentSettingTab,
        loadingSetting: computed(() => designerStore.settingPanelLoading),
        settingsVisible: computed(() => !designerStore.settingsCollapse),
        settingsStyle: computed(() => {
          return {
            width: !designerStore.settingsCollapse ? '330px' : 0,
            padding: !designerStore.settingsCollapse ? '8px' : 0,
          };
        }),
      };
    },
  });
</script>

<style lang="less" scoped>
  .attr-panel {
    width: 330px;
    height: 100vh;
    border-left: 1px solid #eeeeee;
    box-sizing: border-box;
    flex-shrink: 0;
    background-color: white;
    transition: all ease 0.4s;

    .wrapper {
      height: 100%;
      width: 100%;
      box-sizing: border-box;

      :deep(.n-form-item) {
        margin-bottom: 6px;
      }
    }
  }

  .setting-item {
    padding: 0 4px;
    box-sizing: border-box;
  }
</style>
