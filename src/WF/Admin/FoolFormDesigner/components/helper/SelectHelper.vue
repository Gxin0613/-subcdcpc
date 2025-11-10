<template>
  <div
    class="select-helper"
    :style="[computedCols, handleVisible, handleContainer]"
    :class="{ 'is-active': isActive && editable, 'drop-zone-active': dropZoneActive }"
    @click.stop="chooseItem"
  >
    <template v-if="isActive && editable">
      <!-- <div class="icon icon-drag" :title="'拖动'" @click.stop="openProfessionSetting">
        <n-icon :component="SettingsOutline" size="16" color="#1890ff" />
      </div> -->
      <div v-if="hasExtSetting" class="icon icon-quick-settings" :title="'快捷设置'" @click.stop="openExtSetting">
        <n-icon :component="AirplaneOutline" size="16" color="#28a745" />
      </div>
      <div class="icon icon-duplicate" :title="'高级设置'" @click.stop="openProfessionSetting">
        <n-icon :component="SettingsOutline" size="16" color="#1890ff" />
      </div>
      <n-popconfirm
        @positive-click="deleteNode"
        :positive-button-props="{
          color: '#d03050',
        }"
      >
        <template #trigger>
          <div class="icon icon-delete" :title="'删除'">
            <n-icon :component="Delete" size="16" color="#ff5555" />
          </div>
        </template>
        确定要删除组件[ {{ widget.title }} ] 吗？
      </n-popconfirm>
    </template>
    <slot></slot>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, inject, nextTick, onMounted, PropType } from 'vue';
  import { useDesignerStore } from '/@/store/modules/form';
  import { FormGroup, FormItem } from '/@form/props/form/FormComponents';
  import { NIcon, NPopconfirm, useMessage } from 'naive-ui';
  import { SettingsOutline, AirplaneOutline } from '@vicons/ionicons5';
  import { Delete } from '@vicons/carbon';
  import { Span } from 'naive-ui/lib/legacy-grid/src/interface';
  import useValidator from '/@form/hooks/useValidator';
  import Entity from '/@form/dto/Entity';
  import { useRoute } from 'vue-router';
  import { deleteComponent } from '/@form/api/FromApi';
  import Event from '/@/utils/Events';
  import { AtPara } from '/@/bp/da/AtPara';
  import { GroupField } from '../../props/database/FormInfo';

  export default defineComponent({
    name: 'SelectHelper',
    components: { NIcon, NPopconfirm },
    props: {
      widget: {
        type: Object as PropType<FormItem | FormGroup>,
        default: () => {},
      },
      settingUrl: {
        type: String,
        default: '',
      },
    },

    setup(props) {
      const designerStore = useDesignerStore();
      const formConfig = computed(() => designerStore.globalFormConfig);
      const validator = useValidator();

      const openExtSetting = () => {
        const at = new AtPara(props.widget?.dto?.AtPara);
        const extEnName = at.GetValStrByKey('ExtEnName');
        const extPKVal = at.GetValStrByKey('ExtEnPKVal');
        designerStore.professionSettingType = 'EN';
        designerStore.professionSettingUrl = `?EnName=${extEnName}&PKVal=${extPKVal}`;
        designerStore.professionSettingTitle = props.widget?.title;
        designerStore.professionSettingVisible = true;
      };
      // 打开高级设置
      const openProfessionSetting = () => {
        let url = '';
        const at = new AtPara(props.widget?.dto?.AtPara);
        const EnName = at.GetValStrByKey('EnName');
        const id = props.widget.id;
        if (!!props.widget.dto && props.widget.dto.UIContralType == 60) {
          url = `?EnName=${EnName}&PKVal=HtmlText_${id}`;
        } else {
          if (!EnName) {
            url = props.settingUrl;
          } else {
            url += `?EnName=${EnName}&PKVal=${id}`;
          }
        }
        designerStore.professionSettingType = 'EN';
        designerStore.professionSettingUrl = url;
        designerStore.professionSettingTitle = props.widget?.title;
        designerStore.professionSettingVisible = true;
      };
      const isActive = computed(() => {
        const { selectedWidget } = designerStore;
        const { widget } = props;
        return !!selectedWidget && !!widget && selectedWidget.id === widget.id;
      });

      // 计算每一个组建的高度，以及标签及输入框布局
      const computedCols = computed(() => {
        const { labelSpan = 1, inputSpan = 1 } = props.widget;
        return {
          // height: designerStore.globalFormConfig.labelPosition === 'left' ? '32px' : '62px',
          '--cus-form-item-grids': `${labelSpan}fr ${inputSpan}fr`,
          width: `calc(${calcSpan.value} / 24 * 100%)`,
        };
      });

      // 判断是否是基础表单组件
      const isFormItem = (widget: FormItem | FormGroup): widget is FormItem => {
        return (widget as FormItem)?.dto?.GroupID !== undefined;
      };

      const chooseItem = async () => {
        // 减少无效请求
        if (designerStore.selectedWidget?.id === props.widget?.id) {
          return;
        }
        designerStore.selectedWidget = null;
        designerStore.selectedWidgetDto = null;
        await nextTick();
        designerStore.settingsCollapse = false;
        designerStore.settingPanelLoading = true;
        designerStore.selectedWidget = props.widget;
        const id = props.widget?.id;
        const entity = new Entity(props.widget?.dtoClassName || '', id);
        await entity.Init();
        designerStore.selectedWidgetDto = entity;
        Event.emit('chooseWidget', null);
        designerStore.settingPanelLoading = false;
      };

      const message = useMessage();

      const handleVisible = computed(() => {
        if (props.widget.hasOwnProperty('CtrlType')) {
          console.log(props.widget);
        }
        // 半透明显示
        if (!props.widget.visible) {
          if (formConfig.value.showHiddenField == 1) {
            return {
              opacity: '0.45',
            };
          }
          return {
            display: 'none',
          };
        }
        return {};
      });

      const editable = inject('editable');

      // 处理容器
      const handleContainer = computed(() => {
        const { category, key } = props.widget as any;
        return {
          '--cus-selector-color': validator.isContainer(category, key) && isActive.value && editable ? '2px dotted #1890ff' : '1px solid #1890ff',
          '--base-border': validator.isContainer(category, key) && editable ? '2px dotted transparent' : '1px solid transparent',
        };
      });
      const route = useRoute();
      const getCurrentComponentInfo = () => {
        const { FrmID } = route.query;
        if (!props.settingUrl) {
          message.error('缺少链接');
          return {};
        }
        const url = props.settingUrl?.split('?')[1];
        if (!url) {
          message.error('缺少参数');
          return {};
        }
        const params: Recordable = {};
        url.split('&').forEach((item) => {
          const [key, val] = item.split('=');
          params[key] = val;
        });
        params['FrmID'] = FrmID + '';
        params['PKVal'] = (props.widget?.dto as GroupField)?.CtrlID || props.widget?.id || null;
        return params;
      };

      onMounted(() => {
        Event.on('deleteNode', (nodeId) => {
          if (nodeId === props.widget?.id) {
            deleteNode();
          }
        });
      });

      const deleteNode = async () => {
        try {
          const attr = designerStore.selectedWidgetDto?.getData();
          if (attr?.hasOwnProperty('EditType') && attr.EditType != 0) {
            message.warning('此组件不可进行删除');
            return;
          }
          const { category, key, id } = props.widget as any;
          // 禁止删除存在字段的分组
          if (validator.isContainer(category, key)) {
            const group = designerStore.widgetsList.find((g) => g.id === id);
            if (Array.isArray(group?.children) && group.children.length > 0) {
              message.warning('此分组存在字段，不可删除');
              return;
            }
          }
          await deleteComponent(getCurrentComponentInfo());
          designerStore.selectedWidget = null;
          designerStore.selectedWidgetDto = null;
          const delIdx = designerStore.widgetsList.findIndex((item) => item.id === id);

          if (validator.isContainer(category, key) && delIdx > -1) {
            designerStore.widgetsList.splice(delIdx, 1);
            message.success('删除成功');
            return;
          }
          if (!isFormItem(props.widget)) {
            return;
          }
          const groupId = props.widget?.dto?.GroupID;
          const idx = designerStore.widgetsList.findIndex((item: FormGroup) => item.id == groupId);
          if (idx === -1) {
            message.error('没有找到父容器，删除失败');
            return;
          }
          const children = designerStore.widgetsList[idx].children;
          const cIdx = children.findIndex((item) => item.id === props.widget?.id);
          if (cIdx === -1) {
            message.error('没有找到此子节点');
            return;
          }
          children.splice(cIdx, 1);
          message.success('删除成功');
        } catch (e: any) {
          message.error(e.toString());
        }
      };

      // 计算总宽度
      const calcSpan = computed(() => {
        // 计算基础因子，如果是6行表单，基础为4，如果是4则为6， 总数为24
        const formCols = formConfig.value.cols === 6 ? 4 : 6;
        // 这里的总长度当然也应该计算两数之和
        const { inputSpan = 1, labelSpan = 1 } = props.widget;
        // if(inputSpan >= 4) return 24 as Span
        const totalSpan = inputSpan + labelSpan;
        const finalSpan = totalSpan * formCols;
        return (finalSpan > 24 ? 24 : finalSpan) as Span;
      });

      // 判断是否拖入当前区域
      const dropZoneActive = computed(() => {
        return designerStore.activeDropZoneId === props.widget?.id;
      });

      return {
        dropZoneActive,
        chooseItem,
        isActive,
        calcSpan,
        SettingsOutline,
        AirplaneOutline,
        Delete,
        deleteNode,
        computedCols,
        openExtSetting,
        openProfessionSetting,
        handleContainer,
        handleVisible,
        editable,
        hasExtSetting: computed(() => {
          const at = new AtPara(props.widget?.dto?.AtPara);
          const extEnName = at.GetValStrByKey('ExtEnName');
          const extPKVal = at.GetValStrByKey('ExtEnPKVal');
          return !!extEnName && !!extPKVal;
        }),
      };
    },
  });
</script>

<style lang="less" scoped>
  .select-helper {
    margin-bottom: 4px;
    height: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 2px !important;
    border-radius: 4px;
    position: relative;
    border: var(--base-border);

    &:deep(.n-form-item) {
      width: 100%;
    }

    &:deep(.n-form-item.n-form-item--left-labelled) {
      grid-template-columns: var(--cus-form-item-grids) !important;
    }

    &:deep(.n-form-item.n-form-item--top-labelled) {
      --n-label-height: 32px !important;
    }

    .icon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 12;
      background-color: white;
      cursor: pointer;
    }

    .icon-delete {
      position: absolute;
      top: -16px;
      right: 16px;
      border: 1px solid #ff5555;
    }

    .icon-drag {
      position: absolute;
      left: 12px;
      top: -16px;
      border: 1px solid #1890ff;
    }
    .icon-quick-settings {
      position: absolute;
      right: 88px;
      top: -16px;
      border: 1px solid #28a745;
    }
    .icon-duplicate {
      position: absolute;
      right: 52px;
      top: -16px;
      border: 1px solid #1890ff;
    }
  }

  .is-active {
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 6px;
    border: var(--cus-selector-color) !important;
  }

  .drop-zone-active {
    box-sizing: border-box;
    border-radius: 6px;
    border: 2px solid rgba(69, 157, 255, 0.35);
    background: rgba(69, 157, 255, 0.03);
    box-shadow: rgba(69, 157, 255, 0.03) 0px 5px 15px;
  }
</style>
