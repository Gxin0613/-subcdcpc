<template>
  <SelectHelper :widget="widgetInfo" :setting-url="settingUrl">
    <div class="group-bar" :style="groupBarStyle">
      <!-- <div class="title" :style="groupBarStyle">{{ widgetInfo?.title }}</div> -->
      <div class="title">
        <div class="name">
          <i :class="expand ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'" @click="handleFold"></i>
          {{ widgetInfo?.title }}
        </div>
        <div class="type">
          {{ widgetInfo?.dto?.CtrlType }}
        </div>
      </div>
      <div v-show="expand" :id="`groupbar_${widgetInfo!.id}`" :data-group-id="widgetInfo?.id" data-type="item_container">
        <component
          v-for="widget in widgetInfo?.children"
          :data-item-id="widget.id"
          class="form-item"
          :key="widget.id"
          :is="getWidgetComp(widget)"
          :child-type="widget.key"
          :widgetInfo="widget"
          @update-widget="
            (key, val) => {
              widget[key] = val;
              if (widget.dto) widget.dto[key] = val;
            }
          "
        />
      </div>
    </div>
    <Prompt :visible="promptVisible" @add-elem="addElemById" :widgetInfo="widgetInfo" @close="clearTempData" />
  </SelectHelper>
</template>

<script lang="ts">
  import { computed, defineAsyncComponent, defineComponent, inject, onMounted, onUnmounted, PropType, ref } from 'vue';
  import { FormGroup, FormItem } from '/@form/props/form/FormComponents';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { useDesignerStore } from '/@/store/modules/form';
  import { useMessage } from 'naive-ui';
  import Prompt from '/@form/components/prompt/Prompt.vue';
  import useValidator from '/@form/hooks/useValidator';
  import EventBus from '/@/utils/Events';
  import { updateContainerComponentsSort } from '/@form/api/FromApi';
  import { getCorrectKey, syncFieldProps } from '/@form/props/type-utils/FormTypeUtils';
  import { useRoute } from 'vue-router';
  import { CreateFieldFunctions } from '/@form/props/type-map/FormTypeMap';
  import { useID } from '/@form/hooks/useID';
  import { createIDCardFields } from '/@form/props/type-utils/CreateFieldFunctions';
  import Sortable from 'sortablejs';
  import { getEnumsFieldUrl } from '/@form/utils/EnumUtils';
  import { useContainerFold } from '../../../hooks/useContainerFold';
  import { cloneDeep } from 'lodash';

  // 非容器字段组件按需加载，避免一次性引入所有
  const NormalFields = import.meta.glob(['../**/*.vue', '!../container-components/*.vue']);
  const asyncCompCache = new Map<string, any>();
  const toKebab = (name: string) =>
    name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
  const resolveWidgetComp = (groupKey: string, key: string) => {
    const tag = `${groupKey}-${key}`.toLowerCase();
    const dirHints: Record<string, string[]> = {
      input: ['basis-components'],
      appendix: ['appendix-components'],
      universal: ['universal-components'],
      customize: ['customize-components'],
      slave: ['slave-components'],
    };
    const candidates = Object.keys(NormalFields).sort((a, b) => {
      const hit = (p: string) => (dirHints[groupKey] || []).some((d) => p.includes(`/${d}/`));
      return Number(hit(b)) - Number(hit(a));
    });
    return defineAsyncComponent(async () => {
      if (asyncCompCache.has(tag)) return asyncCompCache.get(tag);
      for (const path of candidates) {
        try {
          const mod: any = await (NormalFields as any)[path]();
          const comp = mod?.default;
          const name = comp?.name as string;
          if (!name) continue;
          const kebab = toKebab(name);
          if (kebab === tag) {
            asyncCompCache.set(tag, comp);
            return comp;
          }
        } catch (_) {
          // ignore and continue
        }
      }
      throw new Error(`Widget component not found for: ${tag}`);
    });
  };

  export default defineComponent({
    name: 'ContainerGroupfield',
    components: {
      SelectHelper,
      Prompt,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<FormGroup>,
      },
    },
    setup(props) {
      const store = useDesignerStore();
      const message = useMessage();
      const promptVisible = ref<boolean>(false);
      const validator = useValidator();
      // 全局加载主题
      // const themeStore = useDesignerTheme()
      // const theme: ComputedRef = computed(() => themeStore.defineTheme.FoolFrmGroupBar)

      // 组件列表
      const editable = inject('editable');
      const dragEnd = async (ev: any) => {
        const toGroupId = ev.to.dataset.groupId as string; // 到达分组
        const fromGroupId = ev.from.dataset.groupId as string; // 原始分组
        const dragElementId = ev.item.dataset.itemId as string; // 当前元素
        const fromGroup = store.widgetsList.find((group) => group.id == fromGroupId);
        const toGroup = store.widgetsList.find((group) => group.id == toGroupId);
        if (!fromGroup || !toGroup) {
          message.error('数据异常，请刷新页面');
          return;
        }
        const dragElemRef = fromGroup.children.find((children) => children.id == dragElementId);
        if (!dragElemRef) {
          message.error('数据异常，请刷新页面');
          return;
        }
        const dragElem = JSON.parse(JSON.stringify(dragElemRef));
        const { oldDraggableIndex, newDraggableIndex } = ev;
        fromGroup.children.splice(oldDraggableIndex, 1);
        dragElem.dto.GroupID = toGroupId;
        toGroup.children.splice(newDraggableIndex, 0, dragElem); // 更新item在store的索引
        const formData = new FormData();
        formData.append('GroupID', toGroupId);
        const sortedStr = toGroup.children.map((child) => child.id).join(',') || '';
        formData.append('MyPKs', sortedStr);
        formData.append('MyPK', dragElementId);
        await updateContainerComponentsSort(formData);

        // store.activeDropZoneId = -1
      };
      const autoGenerate = computed(() => store.globalFormConfig.autoGenerateId);
      const route = useRoute();

      const getAthFieldUrl = (key: string, groupId: string) => {
        const formId = route.query.FrmID + '';
        return `./SysEnumList.htm?EnName=GPN_Ath&FrmID=${formId}&GroupField=${groupId}&PageNo=${key}`;
      };

      // GPN打开通用组件页面
      const getCommonUrl = (key: string, groupId: string, EnName, args = '') => {
        const formId = route.query.FrmID + '';
        if (!EnName) {
          message.warning('未配置解析实体GPN或开发中');
          return;
        }
        return `?EnName=${EnName}&FrmID=${formId}&GroupField=${groupId}&PageNo=${key}${args}`;
      };

      const getFKUrl = (groupId: string) => {
        let url = '';
        const formId = route.query.FrmID + '';
        url = './GPE.htm?EnName=GPN_NewDDL&FrmID=' + formId + '&GroupField=' + groupId + '&PageNo=SelectedDict';
        return url;
      };
      const customizeGPN = {
        group: 'GPN_ComponentGroup',
        field: 'GPN_ComponentField',
        ext: 'GPN_ComponentMapExt',
        TQ: 'GPN_TongQiField',
      };
      // 添加
      const dragAdd = async (ev: any) => {
        const { newDraggableIndex, from, to } = ev;
        store.newWidgetIndex = newDraggableIndex;
        // 如果是一个容器拖动到另一个容器
        if (from.dataset.type === 'item_container' && from.dataset.type === to.dataset.type) {
          return;
        }
        const gIdx = store.widgetsList.findIndex((item: FormGroup) => item.id === props.widgetInfo?.id);
        if (gIdx === -1) {
          message.error('没有找到父容器');
          clearTempData();
          return;
        }

        const item = JSON.parse(JSON.stringify(store.currentDragWidget));
        if (item.category === 'customize') {
          if (!Reflect.ownKeys(customizeGPN).includes(item.key)) {
            message.error(`没有定义${item.key}类的自定义组件，请检查代码`);
            return;
          }
          // if (item.key !== 'field') {
          //   message.warning('开发中...');
          //   return;
          // }
          const groupId = props.widgetInfo!.id;
          EventBus.emit('openIframe', {
            title: '新增自定义组件',
            url: `?EnName=${customizeGPN[item.key]}&FrmID=${route.query.FrmID}&SortNo=${groupId}&GroupField=${groupId}`,
          });
          return;
        }
        // 如果是创建枚举字段
        if (item.key.startsWith('enums')) {
          EventBus.emit('openIframe', {
            title: '添加枚举类型字段',
            url: getEnumsFieldUrl(item.key, props.widgetInfo?.id + '', route.query.FrmID + ''),
          });
          return;
        }
        // 如果是创建枚举字段
        if (item.category === 'appendix') {
          EventBus.emit('openIframe', {
            title: '添加附件',
            url: getAthFieldUrl(item.key, props.widgetInfo?.id + ''),
          });
          return;
        }

        // 如果是创建枚举字段
        if (item.category === 'mapExt') {
          const url = getCommonUrl(item.key, props.widgetInfo?.id + '', item.EnName, item.UrlParams);
          if (!url) {
            return;
          }
          EventBus.emit('openIframe', {
            title: '自定义控件',
            url,
          });
          return;
        }
        // 如果是创建枚举字段
        if (item.category === 'Universal') {
          const url = getCommonUrl(item.key, props.widgetInfo?.id + '', 'GPN_ComponentField');
          if (!url) {
            return;
          }
          EventBus.emit('openIframe', {
            title: '添加组件',
            url,
          });
          return;
        }
        // 如果是创建外键
        if (item.key.startsWith('foreignKey')) {
          EventBus.emit('openIframe', {
            title: '创建外键/枚举字段',
            url: getFKUrl(props.widgetInfo?.id + ''),
          });
          return;
        }
        // 如果是字段模板
        if (item.key === 'fieldTemplate') {
          const formId = route.query.FrmID;
          EventBus.emit('openIframe', {
            title: '创建字段模板',
            url: `?EnName=TreeEns_FrmTemplate&FrmID=${formId}&PageNo=TreeEns`,
          });
          return;
        }

        // 如果是身份证
        if (item.key.startsWith('id_card')) {
          await createIDCard(item, newDraggableIndex, gIdx);
          return;
        }
        const { category, key } = item;
        if (validator.isContainer(category, key)) {
          // clearTempData()
          EventBus.emit('createContainer', ev);
          return;
        }
        if (autoGenerate.value == 0 || item.manualInputId) {
          promptVisible.value = true;
          return;
        }
        const { getNextId } = useID();
        const { id, title } = await getNextId(item.key, route.query.FrmID + '');
        item.id = id;
        item.title = `${item.title}_${title}`;
        await saveToDatabase(item, newDraggableIndex, gIdx);
      };

      // 创建身份证号
      const createIDCard = async (item: any, newIndex: number, groupIdx: number) => {
        try {
          store.globalLoading = true;
          store.loadingDesc = '入库中..';
          item.groupId = props.widgetInfo?.id;
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
            store.widgetsList[groupIdx].children.splice(newIndex, 0, nField);
          }
        } catch (e: any) {
          message.error(e);
        } finally {
          store.globalLoading = false;
          store.loadingDesc = 'loading..';
        }
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
          store.widgetsList[groupIdx].children.push(field);
          forceSort(store.widgetsList[groupIdx], item.id);
          return;
        }
        store.widgetsList[groupIdx].children.splice(fieldIndex, 0, field);
        forceSort(store.widgetsList[groupIdx], item.id);
      };

      // 保存到数据库和表单，无论是否手动输入id，最终都通过这里保存
      const saveToDatabase = async (item: any, newIndex: number, groupIdx: number) => {
        try {
          item.groupId = props.widgetInfo?.id;
          const mapKey = `${item.groupKey}-${item.key}`;
          const createFunction = CreateFieldFunctions.get(mapKey);
          if (!createFunction) {
            message.error('没有创建此组件的方法，请检查');
            return;
          }
          store.globalLoading = true;
          store.loadingDesc = '入库中..';
          // 转成字符串
          const formId = route.query.FrmID + '';
          const entity = await createFunction(item, formId, newIndex);
          if (!entity) {
            message.error(`此id [${item.id}] 已经存在，请重试`);
            store.globalLoading = false;
            store.loadingDesc = 'loading..';
            return;
          }
          const entityData = entity.getData();
          insertFieldToGroup(item, entityData, groupIdx, newIndex);
          // const field = syncFieldProps(item, entityData);
          // store.widgetsList[groupIdx].children.splice(newIndex, 0, field);
          store.globalLoading = false;
          store.loadingDesc = 'loading..';
        } catch (e: any) {
          message.error(e.toString());
        } finally {
          store.globalLoading = false;
          store.loadingDesc = 'loading..';
        }
      };

      const cloneNode = (elem: any) => {
        store.currentDragWidget = elem;
        return;
      };

      const clearTempData = () => {
        store.currentDragWidget = null;
        promptVisible.value = false;
        store.newWidgetIndex = -1;
      };

      // 通过id添加数据
      const addElemById = async (name: string, id: string, close: boolean) => {
        const groupIndex = store.widgetsList.findIndex((item: FormGroup) => item.id === props.widgetInfo?.id);
        if (groupIndex === -1) {
          message.error('没有找到父容器');
          clearTempData();
          return;
        }
        if (store.widgetsList[groupIndex].children.findIndex((item: FormItem) => item.id === id) > -1) {
          message.error('当前id已存在，id不可重复！');
          return;
        }
        const item = JSON.parse(JSON.stringify(store.currentDragWidget));
        const newIndex = store.newWidgetIndex;
        if (newIndex === -1) {
          message.error('前端出现异常，插入索引失效，请重试');
          return;
        }
        item.id = id;
        item.title = name;
        await saveToDatabase(item, newIndex, groupIndex);
        if (close) {
          clearTempData();
        }
      };
      // 获取组件名
      const getWidgetComp = (widget: FormItem) => {
        const { groupKey, key } = widget as any;
        return resolveWidgetComp(groupKey, key);
      };
      let sortableInst: Nullable<Sortable> = null;
      onMounted(() => {
        EventBus.on('createField', (event: any) => {
          // 获取所有的字段分组
          const groups = store.widgetsList.filter((group) => group.dto?.CtrlType === '');
          const idx = groups.length - 1;
          if (idx === -1) {
            message.warning('请您在字段分组内创建组件');
            return;
          }
          if (props.widgetInfo?.id === groups[idx]?.id) {
            event.newDraggableIndex = props.widgetInfo?.children.length;
            dragAdd(event);
          }
        });

        EventBus.on('insertField', (item: any) => {
          const { GroupID, Idx } = item;
          if (GroupID == props.widgetInfo?.id) {
            const groupIndex = store.widgetsList.findIndex((item: FormGroup) => item.id === props.widgetInfo?.id);
            // 创建时没保留index
            // 由于mapExt类仍然是文本字段，只是需要简化创建，所以需要手动替换掉类型
            const selectedItem = cloneDeep(store.currentDragWidget);
            if (!!selectedItem['RealType'] && !!selectedItem['RealCate']) {
              selectedItem['category'] = selectedItem['RealCate'];
              selectedItem['key'] = selectedItem['RealType'];
              selectedItem['groupKey'] = selectedItem['RealCate'];
            }
            //     debugger;
            insertFieldToGroup(selectedItem, item, groupIndex, Idx);
            // store.currentDragWidget = null;
          }
        });

        sortableInst = new Sortable(document.getElementById(`groupbar_${props.widgetInfo!.id}`)!, {
          animation: 300,
          draggable: '.select-helper',
          dataIdAttr: 'data-item-id',
          ghostClass: 'form-drag',
          // handle: '.icon-drag',
          group: {
            name: 'groupbar',
            put: true,
            pull: true,
          },
          onAdd: async (ev) => {
            ev.item.remove();
            await dragAdd(ev);
          },
          onEnd: async (ev) => {
            await dragEnd(ev);
            // todo 排序后id，需要保存到数据库
          },
        });
      });

      onUnmounted(() => {
        EventBus.off('createField');
        EventBus.off('insertField');
        if (sortableInst) {
          sortableInst.destroy();
          sortableInst = null;
        }
      });

      const { expand, handleFold, groupBarStyle } = useContainerFold(props.widgetInfo as Recordable, '110px', '40px');
      return {
        editable,
        getWidgetComp,
        addElemById,
        clearTempData,
        cloneNode,
        handleFold,
        promptVisible,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.GroupField&PKVal=${props?.widgetInfo?.id}`,
        expand,
        groupBarStyle,
      };
    },
  });
</script>

<style lang="less" scoped>
  .group-bar {
    width: 100%;
    // 设置最小宽度方便放组件
    min-height: 100px;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    border-radius: 4px;
    transition: all ease 0.2s;

    .title {
      height: 40px;
      background-color: #f2f5f7;
      width: 100%;
      box-sizing: border-box;
      line-height: 40px;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .type {
        font-weight: normal;
      }
    }

    [data-type='item_container'] {
      width: 100%;
      height: auto;
      min-height: 68px;
      box-sizing: border-box;
      padding-top: 4px;
      padding-bottom: 4px;
    }
  }
  .glyphicon {
    margin-right: 10px;
  }
</style>
