<template>
  <BaseComponent ref="baseComponentLog" style="width: unset; height: unset" :close-drawer-func="closeDrawer">
    <aside class="components-bar" :style="componentsBarStyle">
      <!-- <Button
        class="flow-btn"
        @click="
          () => {
            showIndex = true;
          }
        "
        v-if="!showIndex"
        >显示索引</Button
      >
      <Button class="flow-btn" @click="() => (showIndex = false)" v-if="showIndex">关闭索引</Button> -->
      <div class="wrapper">
        <Tree
          :expandedKeys="expandedKeys"
          v-model:selected-keys="selectedKey"
          :tree-data="treeData"
          @select="(selectedKeys, info) => handleSelected(selectedKeys, info)"
          @expand="
            (value) => {
              expandedKeys = [];
              expandedKeys = value as string[];
            }
          "
          show-icon
        >
          <template #icon="{ CtrlType, selfIcon }">
            <template v-if="!selfIcon">
              <folder-outlined v-if="CtrlType != 'rich'" />
              <file-outlined v-else-if="CtrlType == 'rich'" />
            </template>
            <template v-else>
              <i :class="selfIcon"></i>
            </template>
          </template>
          <template #title="{ key: treeKey, title, CtrlType, ParentOID, info, children, index }">
            <div style="display: flex; flex-direction: row">
              <span style="flex-grow: 1" v-if="CtrlType == 'rich'">
                <span v-if="designerStore.globalFormConfig.showChapterIndex">{{ index + ' ' }}</span>
                {{ title }}
              </span>
              <Popconfirm :ok-text="'确认'" :cancel-text="'取消'" @confirm="deleteNode(info, [])" v-if="CtrlType == 'rich'"
                ><Icon icon="fluent:delete-48-regular" style="display: inline-block; height: 24px; position: absolute; right: 20px" />
                <template #title>确定要删除大块文本 [ {{ title }} ] 吗？</template>
              </Popconfirm>
              <Dropdown :trigger="['contextmenu']" v-if="CtrlType != 'rich'">
                <span style="flex-grow: 1">
                  <span v-if="designerStore.globalFormConfig.showChapterIndex">{{ index + ' ' }}</span>
                  {{ title }}
                </span>
                <template #overlay>
                  <Menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, ParentOID, info)">
                    <MenuItem key="addChild" v-if="CtrlType == 'Dir'" style="width: 150px !important">
                      <PlusCircleOutlined style="margin-right: 5px" />{{ '新建下级目录' }}</MenuItem
                    >
                    <MenuItem key="addbro" style="width: 150px !important"><DiffOutlined style="margin-right: 5px" />{{ '新建同级目录' }}</MenuItem>
                    <SubMenu key="addBasicAttr" v-if="CtrlType == 'Attr'" :title="'添加基础字段'" style="width: 150px !important">
                      <template #icon>
                        <MenuOutlined />
                      </template>
                      <MenuItem v-for="attr in basicSelectOptions" :key="attr.value"><i :class="attr.icon" style="margin-right: 5px"></i>{{ attr.label }}</MenuItem>
                    </SubMenu>
                    <SubMenu key="addCustomizeAttr" v-if="CtrlType == 'Attr'" :title="'添加自定义字段'">
                      <template #icon>
                        <AppstoreAddOutlined />
                      </template>
                      <MenuItem v-for="attr in customizeSelectOptions" :key="attr.value"><i :class="attr.icon" style="margin-right: 5px"></i>{{ attr.label }}</MenuItem>
                    </SubMenu>
                    <!-- <MenuItem key="addBigText" v-if="CtrlType == 'Dir'" style="width: 150px !important"> <FormOutlined style="margin-right: 5px" />{{'添加大块文本'}}</MenuItem> -->

                    <MenuItem key="delete" style="display: flex; flex-direction: row; width: 150px">
                      <Popconfirm :ok-text="'确认'" :cancel-text="'取消'" @confirm="deleteNode(info, children)" style="width: 100%"
                        ><DeleteOutlined style="margin-right: 5px" /><div style="display: inline-block; width: 105px">{{ '删除目录' }}</div>
                        <template #title>确定要删除目录 [ {{ title }} ] 吗？</template>
                      </Popconfirm>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
              <Dropdown :trigger="['click']" v-if="CtrlType != 'rich'">
                <Icon icon="icon-park-outline:more-two" style="display: inline-block; height: 24px; position: absolute; right: 20px" />
                <template #overlay>
                  <Menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey, ParentOID, info)">
                    <MenuItem key="addChild" v-if="CtrlType == 'Dir'" style="width: 150px !important">
                      <PlusCircleOutlined style="margin-right: 5px" />{{ '新建下级目录' }}</MenuItem
                    >
                    <MenuItem key="addbro" style="width: 150px !important"><DiffOutlined style="margin-right: 5px" />{{ '新建同级目录' }}</MenuItem>
                    <SubMenu key="addBasicAttr" v-if="CtrlType == 'Attr'" :title="'添加基础字段'">
                      <template #icon>
                        <MenuOutlined />
                      </template>
                      <MenuItem v-for="attr in basicSelectOptions" :key="attr.value"><i :class="attr.icon" style="margin-right: 5px"></i>{{ attr.label }}</MenuItem>
                    </SubMenu>
                    <SubMenu key="addCustomizeAttr" v-if="CtrlType == 'Attr'" :title="'添加自定义字段'">
                      <template #icon>
                        <AppstoreAddOutlined />
                      </template>
                      <MenuItem v-for="attr in customizeSelectOptions" :key="attr.value"><i :class="attr.icon" style="margin-right: 5px"></i>{{ attr.label }}</MenuItem>
                    </SubMenu>
                    <!-- <MenuItem key="addBigText" v-if="CtrlType == 'Dir'"> <FormOutlined style="margin-right: 5px" />{{'添加大块文本'}}</MenuItem> -->
                    <MenuItem key="delete">
                      <Popconfirm :ok-text="'确认'" :cancel-text="'取消'" @confirm="deleteNode(info, children)"
                        ><DeleteOutlined style="margin-right: 5px" /><div style="display: inline-block; width: 105px">{{ '删除目录' }}</div>
                        <template #title>确定要删除目录 [ {{ title }} ] 吗？</template>
                      </Popconfirm>
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>
          </template>
        </Tree>
      </div>
    </aside>
    <Prompt :visible="promptVisible" @add-elem="addElemById" @close="clearTempData" />
    <PromptBigText :visible="promptBigTextVisible" @add-elem="addElemById" @close="clearTempData" />
  </BaseComponent>
</template>

<script lang="ts">
  import { computed, defineComponent, nextTick, onMounted, ref, shallowRef, watch, h } from 'vue';
  import FormComponents, { FormGroup, FormItem } from '../../FoolFormDesigner/props/form/FormComponents';
  import { useDesignerStore } from '/@/store/modules/form';
  import { Dropdown, Menu, MenuItem, Popconfirm, Tree, message, SubMenu, Button } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Icon } from '/@/components/Icon';
  import useValidator from '../../FoolFormDesigner/hooks/useValidator';
  import { deleteComponent, updateContainerComponentsSort } from '../../FoolFormDesigner/api/FromApi';
  import Event from '/@/utils/Events';
  import Entity from '/@form/dto/Entity';
  import { basicSelectOptions, customizeSelectOptions, getSettingUrl, isFormItem } from '../units';
  import { useRoute } from 'vue-router';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Prompt from '/@form/components/prompt/Prompt.vue';
  import useUUID from '../../FoolFormDesigner/hooks/useUUID';
  import useWidgetHelper from '../../FoolFormDesigner/hooks/useWidgetsHelper';
  import { useID } from '../../FoolFormDesigner/hooks/useID';
  import EventBus from '/@/utils/Events';
  import { createIDCardFields } from '../../FoolFormDesigner/props/type-utils/CreateFieldFunctions';
  import { getCorrectKey, syncFieldProps } from '../../FoolFormDesigner/props/type-utils/FormTypeUtils';
  import { getEnumsFieldUrl } from '../../FoolFormDesigner/utils/EnumUtils';
  import { CreateFieldFunctions } from '../../FoolFormDesigner/props/type-map/FormTypeMap';
  import PromptBigText from '../prompt/promptBigText.vue';
  import { DeleteOutlined, FileOutlined, FolderOutlined, DiffOutlined, FormOutlined, PlusCircleOutlined, AppstoreAddOutlined, MenuOutlined } from '@ant-design/icons-vue';

  interface treeNode {
    title: string;
    key: number | string; //同oid
    OID: number | string;
    ParentOID: string | number | null;
    CtrlType: string | null;
    attrChildren?: Array<FormItem>;
    children?: Array<treeNode>;
    info: FormGroup | FormItem;
    settingUrl: string;
    selfIcon: string;
    index: string;
  }

  export default defineComponent({
    name: 'ChapterLog',
    components: {
      Tree,
      Dropdown,
      Menu,
      MenuItem,
      Icon,
      Popconfirm,
      BaseComponent,
      Prompt,
      PromptBigText,
      SubMenu,
      FileOutlined,
      FolderOutlined,
      DeleteOutlined,
      DiffOutlined,
      FormOutlined,
      PlusCircleOutlined,
      AppstoreAddOutlined,
      MenuOutlined,
    },
    setup() {
      const baseComponentLog = shallowRef<InstanceType<typeof BaseComponent>>();
      // const showIndex = ref(true);
      const designerStore = useDesignerStore();
      const helper = useWidgetHelper();
      const treeData = ref<Array<Recordable>>([]);
      const selectedKey = ref();
      const validator = useValidator();
      const route = useRoute();
      const expandedKeys = ref<string[]>([]);
      const promptVisible = ref<boolean>(false);
      const promptBigTextVisible = ref<boolean>(false);
      const showWidget = ref<FormItem | FormGroup | null>(designerStore.selectedWidget);
      const { FrmID } = route.query;
      const autoGenerate = computed(() => designerStore.globalFormConfig.autoGenerateId);
      const initTree = () => {
        expandedKeys.value = [];
        findRootNode();
        treeData.value.forEach((node: treeNode) => {
          //寻找子节点
          node.children = [...(node.children || []), ...findChildren(node.key, node.index)];
        });
      };
      /**
       * 找出所有根节点，ParentOID为' '或者null的groupField
       * treeData为所有根节点
       */
      const findRootNode = () => {
        const rootNodes: Array<FormGroup> = designerStore.widgetsList.filter((widget: FormGroup) => widget.dto?.ParentOID == '' || widget.dto?.ParentOID == null);
        let i = 0;
        treeData.value = rootNodes.map((widget) => {
          let children: treeNode[] = [];
          //大块文本显示为单独一节，CtrlType为null或者''
          if (widget.dto?.CtrlType == '' || widget.dto?.CtrlType == null || widget.dto?.CtrlType == 'Dir') {
            const childWidgets = widget.children.filter((item: FormItem) => item.visible && item.dto?.MyDataType === 1 && item.dto.TextModel === 3);
            let childIndex = 0;
            children = childWidgets.map((item: FormItem) => {
              expandedKeys.value.push(item.id?.toString() || '');
              return {
                title: item.title,
                key: item.id?.toString() || '',
                CtrlType: 'rich',
                OID: -1,
                ParentOID: widget.OID || '',
                info: item,
                settingUrl: getSettingUrl('rich', item, FrmID) || '',
                selfIcon: item?.dto?.ICON && item?.dto?.ICON != '0' ? item?.dto.ICON : '',
                index: (i + 1).toString() + '.' + (++childIndex).toString(),
              };
            });
          }
          expandedKeys.value.push((widget.OID || widget.id || widget.dto?.OID || '').toString());
          return {
            title: widget.title,
            key: (widget.OID || widget.id || widget.dto?.OID || '').toString(),
            OID: widget.OID || widget.id || widget.dto?.OID || -1,
            ParentOID: '',
            CtrlType: widget.dto?.CtrlType || '',
            attrChildren: widget.children,
            children: children,
            info: widget,
            settingUrl: getSettingUrl(widget.dto?.CtrlType || '', widget, FrmID),
            selfIcon: widget.dto?.Icon ? widget.dto?.Icon : '',
            index: (++i).toString(),
          };
        });
      };
      /**
       * @description 递归找出当前节点的子节点
       * @param OID 节点的oid
       * @returns 返回一个treeNode数组
       */
      const findChildren: (OID: string | number, parentIndex: string) => treeNode[] = (OID: string | number, parentIndex: string) => {
        if (OID === -1) return []; //当前节点的OID不合法
        let children: Array<treeNode> = [];
        //找出所有孩子
        const childrenWidgets: Array<FormGroup> = designerStore.widgetsList.filter((widget: FormGroup) => widget.dto?.ParentOID?.toString() === OID.toString());
        if (childrenWidgets.length == 0) return []; //没有孩子直接返回
        //格式化
        let i = 0;
        children = childrenWidgets.map((widget: FormGroup) => {
          //大块文本显示为单独一节，CtrlType为null或者''
          let widgetChildren: Array<treeNode> = [];
          if (widget.dto?.CtrlType == '' || widget.dto?.CtrlType == null || widget.dto?.CtrlType == 'Dir') {
            const childWidgets = widget.children.filter((item: FormItem) => item.visible && item.dto?.MyDataType === 1 && item.dto.TextModel === 3);
            let childIndex = 0;
            widgetChildren = childWidgets.map((item: FormItem) => {
              expandedKeys.value.push(item.id?.toString() || '');
              return {
                title: item.title,
                key: item.id || '',
                OID: -1,
                ParentOID: widget.OID || '',
                CtrlType: 'rich',
                info: item,
                settingUrl: getSettingUrl('rich', item, FrmID) || '',
                selfIcon: item?.dto?.ICON && item?.dto?.ICON != '0' ? item?.dto.ICON : '',
                index: (i + 1).toString() + '.' + (++childIndex).toString(),
              };
            });
          }
          //递归寻找下一层孩子
          expandedKeys.value.push((widget.OID || widget.id || widget.dto?.OID || '').toString());
          i++;
          widgetChildren = [...findChildren(widget.OID || widget.id || widget.dto?.OID || -1, i.toString()), ...widgetChildren];
          return {
            title: widget.title,
            key: (widget.id || widget.OID || widget.dto?.OID || '').toString(),
            OID: widget.id || widget.OID || widget.dto?.OID || -1,
            ParentOID: OID,
            CtrlType: widget.dto?.CtrlType || '',
            attrChildren: widget.children,
            children: widgetChildren,
            info: widget,
            settingUrl: getSettingUrl(widget.dto?.CtrlType || '', widget, FrmID),
            selfIcon: widget.dto?.Icon ? widget.dto?.Icon : '',
            index: parentIndex + '.' + i.toString(),
          };
        });
        return children;
      };
      //新增目录
      const handleAddCatalog = (ParentOID: string | number) => {
        const elemUrl = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_DirNew&ParentOID=' + ParentOID + '&FrmID=' + route.query.FrmID;
        baseComponentLog.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, elemUrl, '新建表单元素'));
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
          const entity = await createFunction(item, formId, newIndex, 600);
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
        await saveToDatabase(item, newIndex, groupIndex);
        if (close) {
          clearTempData();
        }
      };
      //做插入前的处理，获取打开GPN的url，初步判断插入是否合法等
      const handleAdd = async (whichPrompt) => {
        //只有Dir章节或者Attr章节才能插入字段
        if (isFormItem(showWidget.value)) {
          message.error('请选择纯目录或者Attr章节');
          return;
        }
        if (!isFormItem(showWidget.value) && showWidget.value?.dto?.CtrlType != 'Dir' && showWidget.value?.dto?.CtrlType != 'Attr') {
          message.error('请选择纯目录或者Attr章节');
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
          return;
        }

        if (item.category === 'customize') {
          if (!Reflect.ownKeys(customizeGPN).includes(item.key)) {
            message.error(`没有定义${item.key}类的自定义组件，请检查代码`);
            return;
          }
          const groupId = showWidget.value!.id;
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
            url: getEnumsFieldUrl(item.key, showWidget.value?.id + '', route.query.FrmID + ''),
          });
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
          await createIDCard(item, newIndex, gIdx);
          return;
        }
        if (autoGenerate.value == 0 || item.manualInputId) {
          if (whichPrompt == 'prompt') promptVisible.value = true;
          else promptBigTextVisible.value = true;

          designerStore.newWidgetIndex = newIndex;
          return;
        }
        const { getNextId } = useID();
        const { id, title } = await getNextId(item.key, route.query.FrmID + '');
        item.id = id;
        item.title = `${item.title}_${title}`;
        await saveToDatabase(item, newIndex, gIdx);
      };
      const handleSelect = (value, whichPrompt) => {
        //根据选择更新defignerStore的数据
        const newItem = [...basicSelectOptions, ...customizeSelectOptions].filter((item) => item.value == value)[0] as any;
        newItem.title = newItem.label;
        newItem.key = newItem.value;
        newItem.groupKey = newItem.category;
        newItem.id = useUUID(newItem.key);
        designerStore.currentDragWidget = helper.mergeWidgetObject(newItem);
        designerStore.selectedWidget = null;
        // designerStore.newWidgetIndex = isFormItem(showWidget.value) ? -1 : showWidget.value?.children.length || 0;
        handleAdd(whichPrompt);
      };
      const onContextMenuClick = (treeKey: string, menuKey: string, ParentOID: string | number, info: FormGroup) => {
        if (menuKey === 'addbro') handleAddCatalog(ParentOID);
        if (menuKey === 'addChild') handleAddCatalog(info.dto?.OID || '');
        if (menuKey != 'delete' && !menuKey.startsWith('add')) {
          designerStore.selectedLogWidget = info;
          showWidget.value = info;
          selectedKey.value = [treeKey];
          handleSelect(menuKey, 'prompt');
        }
        if (menuKey == 'addBigText') {
          designerStore.selectedLogWidget = info;
          showWidget.value = info;
          handleSelect('textBig', 'promptBigText');
        }
        initTree();
      };
      // 清理临时数据
      const clearTempData = () => {
        designerStore.currentDragWidget = null;
        promptVisible.value = false;
        promptBigTextVisible.value = false;
        designerStore.newWidgetIndex = -1;
      };
      //关闭抽屉，刷新页面
      const closeDrawer = () => {
        Event.emit('reloadForm', false);
      };

      const componentsBarStyle = computed(() => {
        return {
          width: designerStore.componentsCollapse ? '0' : '240px',
        };
      });

      const getCurrentComponentInfo = (settingUrl: string) => {
        if (!settingUrl) {
          message.error('缺少链接');
          return {};
        }
        const url = settingUrl?.split('?')[1];
        if (!url) {
          message.error('缺少参数');
          return {};
        }
        const params: {
          [propName: string]: string;
        } = {};
        url.split('&').forEach((item) => {
          const [key, val] = item.split('=');
          params[key] = val;
        });
        params['FrmID'] = FrmID + '';
        return params;
      };
      //删除结点
      const deleteNode = async (widget: FormGroup, children: any[]) => {
        designerStore.selectedWidget = widget;
        designerStore.selectedLogWidget = widget;
        try {
          designerStore.globalLoading = true;
          const attr = designerStore.selectedWidgetDto?.getData();
          if (attr?.hasOwnProperty('EditType') && attr.EditType != 0) {
            message.warning('此组件不可进行删除');
            return;
          }
          await deleteChild(widget);
          designerStore.selectedWidget = null;
          designerStore.selectedWidgetDto = null;
          const { category, key } = widget as any;
          if (validator.isContainer(category, key)) {
            if (children.length == 0 || !children) {
              setTimeout(() => {
                message.success('删除成功');
                Event.emit('reloadForm', false);
                designerStore.globalLoading = false;
              }, 500);
            } else if (children && children.length > 0 && children.length < 2) {
              setTimeout(() => {
                message.success('删除成功');
                Event.emit('reloadForm', false);
                designerStore.globalLoading = false;
              }, 2500);
            } else if (children && (children.length > 2 || children.length == 2)) {
              setTimeout(() => {
                message.success('删除成功');
                Event.emit('reloadForm', false);
                designerStore.globalLoading = false;
              }, 4500);
            }
            designerStore.selectedWidget = null;
            designerStore.selectedLogWidget = null;
            return;
          }
          if (isFormItem(widget)) {
            const groupId = widget?.dto?.GroupID;
            const idx = designerStore.widgetsList.findIndex((item: FormGroup) => item.id == groupId);
            if (idx === -1) {
              message.error('没有找到父容器，删除失败');
              return;
            }
            const children = designerStore.widgetsList[idx].children;
            const cIdx = children.findIndex((item) => item.id === widget?.id);
            if (cIdx === -1) {
              message.error('没有找到此子节点');
              return;
            }
            children.splice(cIdx, 1);
            message.success('删除成功');
            designerStore.selectedWidget = null;
            designerStore.selectedLogWidget = null;
            designerStore.globalLoading = false;
          }
        } catch (e: any) {
          message.error(e.toString());
          return;
        }
      };
      /**
       * @description 递归删除分组容器的子节点和其中的mapAttr
       * @param widget 要删除的groupfield
       */
      const deleteChild = async (widget: FormGroup | FormItem) => {
        if (isFormItem(widget)) {
          //如果是FormItem，比如大块文本，则直接删除本身
          const settingUrl = getSettingUrl('rich', widget, FrmID);
          await deleteComponent(getCurrentComponentInfo(settingUrl || ''));
          return;
        }
        if (widget.dto?.CtrlType != 'Ath' && widget.dto?.CtrlType != 'Dtl') {
          //找到当前groupfield的孩子，Ath和Dtl没有子级
          const groupChildren: Array<FormGroup | FormItem> = designerStore.widgetsList.filter(
            (item: FormGroup | FormItem) => item.dto?.ParentOID?.toString() === widget.dto?.OID?.toString(),
          );
          if (groupChildren.length > 0) {
            //有孩子向下寻找孩子
            groupChildren.forEach(async (group: FormGroup) => {
              deleteChild(group);
              // //删除所有的mapAttr
              const en = new BSEntity('BP.Sys.GroupField');
              en.OID = group.dto?.OID || '';
              en.setPK(group.dto?.OID || '');
              await en.Retrieve();
              await en.DoMethodReturnString('DoDelAllField');
              // //删除当前groupfield
              const settingUrl = getSettingUrl(group.dto?.CtrlType || '', widget, FrmID);
              await deleteComponent(getCurrentComponentInfo(settingUrl!));
            });
          } else {
            //没孩子删除mapAttr，然后删除本身
            //删除所有的mapAttr
            const en = new BSEntity('BP.Sys.GroupField');
            en.setPK(widget.dto?.OID || '');
            en.OID = widget.dto?.OID || '';
            await en.Retrieve();
            await en.DoMethodReturnString('DoDelAllField');
            //删除当前groupfield
            const settingUrl = getSettingUrl(widget.dto?.CtrlType || '', widget, FrmID);
            await deleteComponent(getCurrentComponentInfo(settingUrl || ''));
          }
        } else {
          //Ath和Dtl没有子级，也没有mapAttr直接删除本身
          const settingUrl = getSettingUrl(widget.dto.CtrlType, widget, FrmID);
          await deleteComponent(getCurrentComponentInfo(settingUrl || ''));
        }
      };
      //选中节点
      const handleSelected = async (selectedKeys, info) => {
        await chooseItem(info.node.info);
      };
      const chooseItem = async (widget: FormGroup | FormItem) => {
        // 减少无效请求
        if (designerStore.selectedLogWidget?.id === widget?.id) {
          return;
        }
        designerStore.selectedWidget = null;
        designerStore.selectedWidgetDto = null;
        await nextTick();
        designerStore.settingsCollapse = false;
        designerStore.settingPanelLoading = true;
        designerStore.selectedLogWidget = widget;
        designerStore.selectedWidget = widget;
        const id = widget?.id;
        const entity = new Entity(widget?.dtoClassName || '', id);
        await entity.Init();
        designerStore.selectedWidgetDto = entity;
        Event.emit('chooseWidget');
        designerStore.settingPanelLoading = false;
      };
      watch(
        () => designerStore.widgetsList,
        () => {
          initTree();
        },
        { deep: true },
      );
      watch(
        () => designerStore.selectedLogWidget,
        (newValue) => {
          if (newValue != null) showWidget.value = designerStore.selectedLogWidget;
        },
      );
      onMounted(() => {
        initTree();
      });
      return {
        expandedKeys,
        designerStore,
        baseComponentLog,
        promptVisible,
        promptBigTextVisible,
        addElemById,
        clearTempData,
        closeDrawer,
        treeData,
        selectedKey,
        onContextMenuClick,
        handleSelect,
        deleteNode,
        handleSelected,
        componentsBarStyle,
        basicSelectOptions,
        customizeSelectOptions,
        collapse: computed(() => !designerStore.componentsCollapse),
      };
    },
  });
</script>

<style lang="less" scoped>
  .components-bar {
    // position: absolute;
    // left: 0;
    // top: 0;
    width: 240px;
    height: 100vh;
    border-right: 1px solid #eeeeee;
    box-sizing: border-box;
    overflow: auto;
    flex-shrink: 0;
    background-color: #f2f5f7 !important;
    transition: all ease 0.3s;
    position: relative;
    // z-index: 12;

    .wrapper {
      padding: 0px;
      padding-top: 20px;
    }

    .title {
      font-size: 18px;
      height: 40px;
      line-height: 40px;
      color: #1890ff;
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      span {
        margin-left: 8px;
      }
    }

    .form-group {
      width: 100%;
      padding: 6px 0;

      div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;

        .form-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100px;
          flex-shrink: 0;
          height: 30px;
          background-color: #f1f2f3;
          margin: 4px 0;
          box-sizing: border-box;
          padding-left: 4px;
          padding-right: 4px;
          font-size: 12px;
          user-select: none;
          cursor: move;

          span {
            margin-left: 8px;
            white-space: nowrap;
          }

          &:hover {
            box-shadow: rgba(100, 100, 111, 0.2) -2px 0px 12px 0px;
            border: 1px solid #1890ff;
            color: #1890ff;
          }
        }
      }
    }
    :deep(.ant-tree .ant-tree-treenode) {
      width: 100%;
    }
    :deep(.ant-tree .ant-tree-node-content-wrapper) {
      flex-grow: 1;
      display: flex;
    }
    :deep(.ant-tree-title) {
      display: inline-block;
      flex-grow: 1;
    }
    :deep(.ant-tree) {
      background-color: #f2f5f7 !important;
    }
  }
</style>
