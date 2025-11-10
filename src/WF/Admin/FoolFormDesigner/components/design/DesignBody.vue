<template>
  <div class="body">
    <design-tool-bar v-if="editable" />
    <div class="designer-wrapper" @click.stop="releaseItem" :style="CustomFormTheme">
      <n-form
        :label-placement="formConfig.labelPosition"
        class="dynamic-form"
        require-mark-placement="left"
        :style="{
          width: formConfig.autoFitWidth === '0' ? formConfig.designerWidth + 'px' : '100%',
        }"
        :label-align="formConfig.labelAlign"
      >
        <template v-if="widgetsList.length === 0">
          <div class="empty-list" v-if="widgetsList.length === 0">{{ '请从左侧拖动组件到此处' }}</div>
        </template>
        <div class="widgets-list" id="widgets-wrapper" :style="calcHeight" data-sort-type="root" data-type="group_container">
          <div class="form-title">
            <!-- <img src="/resource/CompanyImgLogo/cc_logo_no_bg.png" alt="logo" /> -->
            <p><i v-if="formConfig.originData.Icon" :class="formConfig.originData.Icon"></i>{{ formConfig.name }}</p>
          </div>
          <component
            v-for="widget in (designerStore.widgetsList as unknown as Array<FormItem>)"
            :key="widget.id"
            :data-group-id="widget.id"
            :id="widget.id"
            class="form-item"
            :is="getWidgetName(widget)"
            :child-type="widget.key"
            :widgetInfo="widget"
            @update="(key: string, obj: Recordable) => updateWidget(widget, key, obj)"
          />
          <!-- </template> -->
        </div>
      </n-form>
    </div>
    <Prompt :visible="promptVisible" @add-elem="addElemById" @close="clearTempData" />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, inject, onMounted, onUnmounted, reactive, ref } from 'vue';
  import { NForm, NGrid, NRow, NScrollbar, useMessage } from 'naive-ui';
  import { FormItem } from '/@form/props/form/FormComponents';
  import Widgets from '../widgets/index';
  import { useDesignerStore } from '/@/store/modules/form';

  import DesignToolBar from './DesignToolBar.vue';
  import { CustomFormTheme } from '/@form/theme';
  import Prompt from '../prompt/Prompt.vue';
  import useValidator from '/@form/hooks/useValidator';
  import EventBus from '/@/utils/Events';
  import { updateGroupComponentSort } from '/@form/api/FromApi';
  import { CreateGroupFunctions } from '/@form/props/type-map/FormTypeMap';
  import { syncGroupProps } from '/@form/props/type-utils/FormTypeUtils';
  import { useRoute } from 'vue-router';
  import { createGroupField } from '/@form/props/type-utils/CreateContainerFunctions';
  import { GroupField } from '/@form/props/database/FormInfo';
  import Event from '/@/utils/Events';
  import Sortable, { GroupOptions } from 'sortablejs';

  export default defineComponent({
    name: 'DesignBody',
    components: { NForm, NGrid, NRow, NScrollbar, ...Widgets, DesignToolBar, Prompt },
    setup() {
      const promptVisible = ref<boolean>(false);
      const validator = useValidator();
      const message = useMessage();
      const route = useRoute();
      const designerStore = useDesignerStore();

      // 清理临时数据
      const clearTempData = () => {
        designerStore.currentDragWidget = null;
        promptVisible.value = false;
        designerStore.newWidgetIndex = -1;
        calledBySubTable.value = false;
        subTableId.value = '';
      };

      // 直接创建字段分组
      const directCreateGroupField = async (item: any, newIndex: number, ctrlType: string) => {
        designerStore.globalLoading = true;
        designerStore.loadingDesc = '入库中..';
        const entity = await createGroupField(item, route.query.FrmID + '', newIndex, ctrlType);
        const insertItem = syncGroupProps(item, entity.getData() as GroupField, []);
        designerStore.widgetsList.splice(newIndex, 0, insertItem);
        designerStore.globalLoading = false;
        designerStore.loadingDesc = 'loading';
      };

      // 插入容器到表单
      const insertContainerToForm = (item: any, rowData: Recordable, newIndex: number) => {
        const insertItem = syncGroupProps(item, rowData as GroupField, []);
        // 这里放入的都是容器
        if (!newIndex || newIndex == 0) {
          designerStore.widgetsList.push(insertItem);
          return;
        }
        designerStore.widgetsList.splice(newIndex, 0, insertItem);
      };

      // 保存容器组件到数据库
      const saveToDatabase = async (item: any, newIndex: number) => {
        try {
          const frmId = route.query.FrmID + '' || subTableId.value;
          item.FK_Node = route.query.FK_Node || 0;
          const createFunction = CreateGroupFunctions.get(`${item.groupKey}-${item.key}`);
          if (!createFunction) {
            message.error('没有该组件的创建方法，请检查!');
            return;
          }
          designerStore.globalLoading = true;
          designerStore.loadingDesc = '入库中..';
          const entity = await createFunction(item, frmId, newIndex);
          if (!entity) {
            message.error(`此ID [${item.id}] 已经存在，请重试`);
            designerStore.globalLoading = false;
            designerStore.loadingDesc = 'loading';
            return;
          }

          if (entity.getData()) insertContainerToForm(item, entity.getData(), newIndex);
          else insertContainerToForm(item, entity.rowData, newIndex);

          designerStore.globalLoading = false;
          designerStore.loadingDesc = 'loading';
        } catch (e: any) {
          message.error(e.toString());
        } finally {
          designerStore.globalLoading = false;
          designerStore.loadingDesc = 'loading..';
        }
      };

      const calledBySubTable = ref(false);
      const subTableId = ref('');

      // 通过id添加数据
      const addElemById = async (name: string, id: string, close: boolean) => {
        if (designerStore.widgetsList.findIndex((item) => item.id === id) > -1) {
          message.error('当前id已存在，id不可重复！');
          return;
        }
        const item = JSON.parse(JSON.stringify(designerStore.currentDragWidget));
        const newIndex = designerStore.newWidgetIndex;
        if (newIndex === -1) {
          message.error('前端出现异常，插入索引失效，请重试');
          return;
        }
        item.id = id;
        item.title = name;

        await saveToDatabase(item, newIndex);
        if (close) {
          clearTempData();
        }
      };

      const widgetsList = computed(() => designerStore.widgetsList);
      const autoGenerate = computed(() => designerStore.globalFormConfig.autoGenerateId);

      // 获取组件名
      const getWidgetName = (widget: FormItem) => {
        const { groupKey, key } = widget;
        return `${groupKey}-${key}`;
      };

      const dragAdd = async (ev) => {
        ev.item.remove(); // remove widget shortcut
        const newIndex = ev.newDraggableIndex as number;
        const item = JSON.parse(JSON.stringify(designerStore.currentDragWidget));
        const { category, key } = item;
        if (category === 'container' && key === 'groupfield') {
          item.title = '新建字段分组1';
          await directCreateGroupField(item, newIndex, '');
          return;
        }
        if (category === 'container' && key === 'dir') {
          item.title = '目录1';
          await directCreateGroupField(item, newIndex, 'Dir');
          return;
        }
        if (['appendix', 'universal'].includes(category) && item.key !== 'table') {
          EventBus.emit('createField', ev);
          return;
        }
        if (!validator.isContainer(category, key)) {
          EventBus.emit('createField', ev);
          return;
        }
        if (autoGenerate.value == 0 || item.manualInputId) {
          promptVisible.value = true;
          designerStore.newWidgetIndex = newIndex;
          return;
        }
        await saveToDatabase(item, newIndex);
      };

      let sortableInst: Nullable<Sortable> = null;
      // 组件挂载
      onMounted(() => {
        // 这里默认在最后位置创建
        EventBus.on('createContainer', (event: any) => {
          dragAdd(event);
        });

        EventBus.on('insertContainer', (item: any) => {
          const { Idx } = item;
          insertContainerToForm(designerStore.currentDragWidget, item, Idx || 0);
        });

        EventBus.on('subTableInsertBaseCol', (option) => {
          calledBySubTable.value = true;
          subTableId.value = option.formID;
          promptVisible.value = true;
        });

        sortableInst = new Sortable(document.getElementById('widgets-wrapper')!, {
          animation: 300,
          draggable: '.select-helper',
          dataIdAttr: 'data-group-id',

          group: {
            name: 'container-group',
            put: (_to, from, _dragEl: HTMLElement, _event) => {
              const disabledGroup = ['groupbar', 'container-group'];
              const fromGroupName = (from.options.group as GroupOptions).name;
              if (disabledGroup.includes(fromGroupName)) return false;
              return true;
            },
          },
          onMove: (ev) => {
            const { to } = ev;
            if (to.dataset.type === 'item_container') return false;
            return true;
          },
          onAdd: (ev) => {
            dragAdd(ev);
          },
          onEnd: async () => {
            const ids = sortableInst?.toArray();
            if (Array.isArray(ids)) {
              const formData = new FormData();
              formData.append('Vals', ids.join(','));
              await updateGroupComponentSort(formData);
            } else {
              message.error('未能获取到id序列');
            }

            // todo 排序后id，需要保存到数据库
          },
        });
      });

      // 注销监听
      onUnmounted(() => {
        EventBus.off('createContainer');
        EventBus.off('insertContainer');
        // clear sortable
        if (sortableInst) {
          sortableInst.destroy();
        }
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
        widgetsList,
        calcHeight,
        promptVisible,
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

          .form-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            box-sizing: border-box;
            height: 45px;
            line-height: 80px;
            font-weight: 600;
            font-size: 14px;
            padding-right: 8px;

            img {
              width: 120px;
              height: 40px;
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
      }
    }
  }
</style>
