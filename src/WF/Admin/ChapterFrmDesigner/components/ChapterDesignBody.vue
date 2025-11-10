<template>
  <div class="body">
    <design-tool-bar v-if="editable" />
    <div class="designer-wrapper" :style="CustomFormTheme">
      <n-form
        :label-placement="formConfig.labelPosition"
        class="dynamic-form"
        :style="{
          width: formConfig.autoFitWidth === '0' ? formConfig.designerWidth + 'px' : '100%',
        }"
        :label-align="formConfig.labelAlign"
      >
        <div class="btn-group" v-if="!isFormItem(showWidget) && showWidget?.dto?.CtrlType == 'Attr'">
          <div
            >{{ '添加基础字段'
            }}<Select v-model:value="basicSelected" :options="basicSelectOptions" :placeholder="'请选择基础字段'" @change="handleSelect" style="width: 200px" :allow-clear="true" />
          </div>
          <div
            >{{ '添加自定义字段'
            }}<Select
              v-model:value="customizeSelected"
              :options="customizeSelectOptions"
              :placeholder="'请选择自定义组件'"
              @change="handleSelect"
              style="width: 200px"
              :allow-clear="true"
            />
          </div>
        </div>
        <div class="widgets-list" id="widgets-wrapper" :style="calcHeight" data-sort-type="root" data-type="group_container">
          <component
            v-if="showWidget != null"
            :key="showWidget.id"
            :data-group-id="showWidget.id"
            :id="showWidget.id"
            class="form-item"
            :is="getWidgetName(showWidget as unknown as FormItem)"
            :child-type="showWidget.key"
            :widgetInfo="showWidget"
            @update="(key: string, obj: Recordable) => updateWidget(showWidget||{}, key, obj)"
          />
        </div>
      </n-form>
    </div>
    <Prompt :visible="promptVisible" @add-elem="addElemById" @close="clearTempData" />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, inject, onMounted, onUnmounted, ref, watch } from 'vue';
  import { NForm, NGrid, NRow, NScrollbar, useMessage } from 'naive-ui';
  import FormComponents, { FormGroup, FormItem } from '/@form/props/form/FormComponents';
  import Widgets from '../../FoolFormDesigner/components/widgets/index';
  import { useDesignerStore } from '/@/store/modules/form';

  import DesignToolBar from './ChapterDesignToolBar.vue';
  import { CustomFormTheme } from '/@form/theme';
  import Prompt from '/@form/components/prompt/Prompt.vue';
  import EventBus from '/@/utils/Events';
  import { updateContainerComponentsSort } from '/@form/api/FromApi';
  import { CreateFieldFunctions } from '/@form/props/type-map/FormTypeMap';
  import { getCorrectKey, syncFieldProps } from '/@form/props/type-utils/FormTypeUtils';
  import { useRoute } from 'vue-router';
  import Event from '/@/utils/Events';
  import { Button, Select } from 'ant-design-vue';
  import { isFormItem, basicSelectOptions, customizeSelectOptions } from '../units';
  import useUUID from '/@form/hooks/useUUID';
  import useWidgetHelper from '/@form/hooks/useWidgetsHelper';
  import { getEnumsFieldUrl } from '../../FoolFormDesigner/utils/EnumUtils';
  import { createIDCardFields } from '../../FoolFormDesigner/props/type-utils/CreateFieldFunctions';
  import { useID } from '../../FoolFormDesigner/hooks/useID';

  export default defineComponent({
    name: 'ChapterDesignBody',
    components: { NForm, NGrid, NRow, NScrollbar, ...Widgets, DesignToolBar, Prompt, Button, Select },
    setup() {
      const promptVisible = ref<boolean>(false);
      const basicSelected = ref();
      const customizeSelected = ref();
      const message = useMessage();
      const route = useRoute();
      const helper = useWidgetHelper();
      const designerStore = useDesignerStore();
      const showWidget = ref<FormItem | FormGroup | null>(designerStore.selectedWidget);
      // 清理临时数据
      const clearTempData = () => {
        designerStore.currentDragWidget = null;
        promptVisible.value = false;
        designerStore.newWidgetIndex = -1;
        clearSelected();
      };
      //清空选择项
      const clearSelected = () => {
        basicSelected.value = undefined;
        customizeSelected.value = undefined;
      };

      // 如果出现隐藏字段，会导致排序错误，需要强制排序
      const forceSort = async (group: FormGroup, dragElementId: string) => {
        const hasHiddenField = group.children.find((item) => !item.visible);
        if (!!hasHiddenField) {
          const formData = new FormData();
          formData.append('GroupID', group!.id as string);
          const sortedStr = group.children.map((child) => child.id).join(',') || '';
          formData.append('MyPKs', sortedStr);
          formData.append('MyPK', dragElementId);
          await updateContainerComponentsSort(formData);
        }
      };
      const insertFieldToGroup = (item: any, rowData: Recordable, groupIdx: number, fieldIndex: number) => {
        const field = syncFieldProps(item, rowData as any);
        // 如果后端处理的index有问题，默认插入最后
        if (!fieldIndex || fieldIndex == 0) {
          designerStore.widgetsList[groupIdx].children.push(field);
          forceSort(designerStore.widgetsList[groupIdx], item.id);
          return;
        }
        designerStore.widgetsList[groupIdx].children.splice(fieldIndex, 0, field);
        forceSort(designerStore.widgetsList[groupIdx], item.id);
      };

      // 保存容器组件到数据库
      const saveToDatabase = async (item: any, newIndex: number, groupIdx: number) => {
        try {
          item.groupId = showWidget.value?.id;
          const mapKey = `${item.groupKey}-${item.key}`;
          const createFunction = CreateFieldFunctions.get(mapKey);
          if (!createFunction) {
            message.error('没有创建此组件的方法，请检查');
            return;
          }
          designerStore.globalLoading = true;
          designerStore.loadingDesc = '入库中..';
          // 转成字符串
          const formId = route.query.FrmID + '';
          const entity = await createFunction(item, formId, newIndex);
          if (!entity) {
            message.error(`此id [${item.id}] 已经存在，请重试`);
            designerStore.globalLoading = false;
            designerStore.loadingDesc = 'loading..';
            return;
          }
          const entityData = entity.getData();
          insertFieldToGroup(item, entityData, groupIdx, newIndex);
          // const field = syncFieldProps(item, entityData);
          // store.widgetsList[groupIdx].children.splice(newIndex, 0, field);
          designerStore.globalLoading = false;
          designerStore.loadingDesc = 'loading..';
          // 如果是大块文本说明，需要特殊处理
          if (item.key === 'html') {
            EventBus.emit('openIframe', {
              title: '新建大块文本说明',
              url: `./EditFExtContral/60.BigNoteHtmlText.htm?FrmID=${formId}&KeyOfEn=${entityData.KeyOfEn}`,
            });
            return;
          }
        } catch (e: any) {
          message.error(e.toString());
        } finally {
          designerStore.globalLoading = false;
          designerStore.loadingDesc = 'loading..';
        }
      };

      // 通过id添加数据
      const addElemById = async (name: string, id: string, close: boolean) => {
        //章节设计器
        const groupIndex = designerStore.widgetsList.findIndex((item: FormGroup) => item.id === showWidget.value?.id);
        if (groupIndex === -1) {
          message.error('没有找到父容器');
          clearTempData();
          return;
        }
        if (designerStore.widgetsList[groupIndex].children.findIndex((item: FormItem) => item.id === id) > -1) {
          message.error('当前id已存在，id不可重复！');
          clearSelected();
          return;
        }
        const item = JSON.parse(JSON.stringify(designerStore.currentDragWidget));
        const newIndex = designerStore.newWidgetIndex;
        if (newIndex === -1) {
          message.error('前端出现异常，插入索引失效，请重试');
          clearSelected();
          return;
        }
        item.id = id;
        item.title = name;
        await saveToDatabase(item, newIndex, groupIndex);
        if (close) {
          clearTempData();
        }
      };

      const widgetsList = computed(() => designerStore.widgetsList);
      const autoGenerate = computed(() => designerStore.globalFormConfig.autoGenerateId);

      // 获取组件名
      const getWidgetName = (widget: FormItem) => {
        // const { category, key } = widget;
        // return `${category}-${key}`;
        const { groupKey, key } = widget;
        return `${groupKey}-${key}`;
      };
      const getAthFieldUrl = (key: string, groupId: string) => {
        const formId = route.query.FrmID + '';
        return `./SysEnumList.htm?EnName=GPN_Ath&FrmID=${formId}&GroupField=${groupId}&PageNo=${key}`;
      };

      const customizeGPN = {
        group: 'GPN_ComponentGroup',
        field: 'GPN_ComponentField',
        ext: 'GPN_ComponentMapExt',
        TQ: 'GPN_TongQiField',
      };
      // GPN打开通用组件页面，暂时用不着
      const getCommonUrl = (key: string, groupId: string) => {
        const formId = route.query.FrmID + '';
        return `./SysEnumList.htm?EnName=GPN_ComponentField&FrmID=${formId}&GroupField=${groupId}&PageNo=${key}`;
      };
      //外键
      const getFKUrl = (groupId: string) => {
        let url = '';
        const formId = route.query.FrmID + '';
        url = './GPE.htm?EnName=GPN_NewDDL&FrmID=' + formId + '&GroupField=' + groupId;
        return url;
      };
      // 创建身份证号
      const createIDCard = async (item: any, newIndex: number, groupIdx: number) => {
        try {
          designerStore.globalLoading = true;
          designerStore.loadingDesc = '入库中..';
          item.groupId = showWidget.value?.id;
          const formId = route.query.FrmID + '';
          const IDFields = await createIDCardFields(item, formId, newIndex);
          for (const field of IDFields) {
            if (typeof field === 'string') {
              message.error(field);
              continue;
            }
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.key = getCorrectKey('idCard', field.getData().KeyOfEn);
            const nField = syncFieldProps(newItem, field.getData() as any);
            designerStore.widgetsList[groupIdx].children.splice(newIndex, 0, nField);
          }
        } catch (e: any) {
          message.error(e);
        } finally {
          designerStore.globalLoading = false;
          designerStore.loadingDesc = 'loading..';
        }
      };
      //做插入前的处理，获取打开GPN的url，初步判断插入是否合法等
      const handleAdd = async () => {
        //只有Dir章节或者Attr章节才能插入字段
        if (isFormItem(showWidget.value)) {
          message.error('请选择纯目录或者Attr章节');
          clearSelected();
          return;
        }
        if (!isFormItem(showWidget.value) && showWidget.value?.dto?.CtrlType != 'Dir' && showWidget.value?.dto?.CtrlType != 'Attr') {
          message.error('请选择纯目录或者Attr章节');
          clearSelected();
          return;
        }
        const gIdx = designerStore.widgetsList.findIndex((item: FormGroup) => item.id === showWidget.value?.id);
        if (gIdx === -1) {
          message.error('没有找到父容器，请从目录里选择');
          clearTempData();
          return;
        }
        const newIndex = showWidget.value?.children.length || 0;
        const item = JSON.parse(JSON.stringify(designerStore.currentDragWidget));
        if (showWidget.value?.dto?.CtrlType === 'Dir' && item.key != 'textBig') {
          message.error('纯目录章节里只能插入大块文本!');
          clearSelected();
          return;
        }

        if (item.category === 'customize') {
          if (!Reflect.ownKeys(customizeGPN).includes(item.key)) {
            message.error(`没有定义${item.key}类的自定义组件，请检查代码`);
            clearSelected();
            return;
          }
          const groupId = showWidget.value!.id;
          EventBus.emit('openIframe', {
            title: '新增自定义组件',
            url: `?EnName=${customizeGPN[item.key]}&FrmID=${route.query.FrmID}&SortNo=${groupId}&GroupField=${groupId}`,
          });
          clearSelected();
          return;
        }
        // 如果是创建枚举字段
        if (item.key.startsWith('enums')) {
          EventBus.emit('openIframe', {
            title: '添加枚举类型字段',
            url: getEnumsFieldUrl(item.key, showWidget.value?.id + '', route.query.FrmID + ''),
          });
          clearSelected();
          return;
        }
        // 如果是创建附件
        if (item.category === 'appendix') {
          EventBus.emit('openIframe', {
            title: '添加附件',
            url: getAthFieldUrl(item.key, showWidget.value?.id + ''),
          });
          return;
        }
        // 如果是创建通用组件，暂时用不着
        if (item.category === 'Universal') {
          EventBus.emit('openIframe', {
            title: '添加组件',
            url: getCommonUrl(item.key, showWidget.value?.id + ''),
          });
          return;
        }
        // 如果是创建外键
        if (item.key.startsWith('foreignKey')) {
          EventBus.emit('openIframe', {
            title: '创建外键/枚举字段',
            url: getFKUrl(showWidget.value?.id + ''),
          });
          clearSelected();
          return;
        }
        // 如果是字段模板
        if (item.key === 'fieldTemplate') {
          const formId = route.query.FrmID;
          EventBus.emit('openIframe', {
            title: '创建字段模板',
            url: `?EnName=TreeEns_FrmTemplate&FrmID=${formId}&PageNo=TreeEns`,
          });
          clearSelected();
          return;
        }

        // 如果是身份证
        if (item.key.startsWith('id_card')) {
          await createIDCard(item, newIndex, gIdx);
          return;
        }
        if (autoGenerate.value == 0 || item.manualInputId) {
          promptVisible.value = true;
          designerStore.newWidgetIndex = newIndex;
          return;
        }
        const { getNextId } = useID();
        const { id, title } = await getNextId(item.key, route.query.FrmID + '');
        item.id = id;
        item.title = `${item.title}_${title}`;
        await saveToDatabase(item, newIndex, gIdx);
      };
      const handleSelect = (value) => {
        //根据选择更新defignerStore的数据
        const newItem = [...basicSelectOptions, ...customizeSelectOptions].filter((item) => item.value == value)[0] as any;
        newItem.title = newItem.label;
        newItem.key = newItem.value;
        newItem.groupKey = newItem.category;
        newItem.id = useUUID(newItem.key);
        designerStore.currentDragWidget = helper.mergeWidgetObject(newItem);
        designerStore.selectedWidget = null;
        // designerStore.newWidgetIndex = isFormItem(showWidget.value) ? -1 : showWidget.value?.children.length || 0;
        handleAdd();
      };
      watch(
        () => designerStore.selectedLogWidget,
        (_) => {
          showWidget.value = designerStore.selectedLogWidget;
        },
      );

      // 组件挂载
      onMounted(() => {
        FormComponents.forEach((component) => {
          component.children.forEach((child) => {
            child.groupKey = child.category;
          });
        });
      });

      // 注销监听
      onUnmounted(() => {
        EventBus.off('createContainer');
        EventBus.off('insertContainer');
      });
      const calcHeight = computed(() => {
        return widgetsList.value.length === 0
          ? {
              height: '100%',
            }
          : {};
      });

      // 取消选中
      const releaseItem = () => {
        designerStore.selectedWidget = null;
        designerStore.selectedWidgetDto = null;
        Event.emit('chooseWidget', null);
      };
      return {
        basicSelectOptions,
        customizeSelectOptions,
        basicSelected,
        customizeSelected,
        showWidget,
        calcHeight,
        promptVisible,
        isFormItem,
        handleSelect,
        handleAdd,
        getWidgetName,
        addElemById,
        clearTempData,
        releaseItem,
        CustomFormTheme,
        designerStore,
        formConfig: computed(() => designerStore.globalFormConfig),
        editable: inject('editable'),
        // 子组件更新widget信息
        updateWidget: (widgetInfo: Recordable, key: string, obj: Recordable) => {
          widgetInfo[key] = obj;
        },
      };
    },
  });
</script>

<style lang="less" scoped>
  .body {
    height: 100vh;
    width: calc(100% - 600px);
    min-width: 300px;
    background-color: #f2f5f7;
    flex: 1;

    .designer-wrapper {
      height: calc(100% - 50px);
      margin: 0 auto;
      overflow: auto;
      box-sizing: border-box;

      &:deep(.n-form-item-label) {
        background-color: var(--cus-form-label-background-color);
        color: var(--cus-form-label-text-color);
      }

      .dynamic-form {
        height: calc(100vh - 60px);
        background-color: white;
        margin: 0 auto;
        position: relative;
        transition: width ease 0.4s;

        .empty-list {
          position: absolute;
          z-index: 5;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          color: #999;
        }

        .widgets-list {
          box-sizing: border-box;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          padding-top: 20px;

          .form-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            box-sizing: border-box;
            height: 65px;
            line-height: 80px;
            font-weight: 600;
            font-size: 14px;
            padding-right: 8px;

            img {
              width: 120px;
              height: 60px;
              object-fit: contain;
            }

            p {
              display: flex;
              align-items: center;

              i {
                margin-right: 8px;
              }
            }
          }
        }
        .btn-group {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          div {
            margin-left: 12px;
            margin-top: 5px;
          }
        }
      }
    }
  }
</style>
