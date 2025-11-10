<template>
  <BaseComponent ref="baseComp" class="dtl-search" :close-drawer-func="editClosed" :close-modal-func="editClosed">
    <div ref="dtlSearchRef" class="dtl-search-wrapper">
      <BasicTable v-if="tableConfig" @register="tableConfig" @row-db-click="rowDoubleClick" :scroll="tableScrollConfig">
        <template #headerCell="{ column }">
          <div v-if="column.key === '_sys_move'" class="move-header">
            <i class="icon-shuffle"></i>
          </div>
        </template>
        <template #sys_move>
          <DragOutlined class="table-drag-icon" />
        </template>
        <template v-for="col in tableColumns" :key="col.key" #[col.key]="{ record }">
          <div class="td-cell">
            <!-- 图标列 -->
            <div v-if="col.key === 'Icon'" class="icon-cell">
              <i :class="record[col.key]"></i>
            </div>
            <!-- 单附件列 -->
            <template v-else-if="isSingleAth(col)">
              <div class="attachment-cell">
                <Button class="attachment-button" @click="openFieldAth(col, record[entity!.PK], col.UIIsReadonly || props.readonly)"> <UploadOutlined />{{ '上传/查看' }}</Button>
              </div>
            </template>
            <!-- 普通数据列 -->
            <div v-else class="data-cell">{{ record[col.key] }}</div>
          </div>
        </template>
        <template v-if="hasActionButtons" #action="{ record, index }">
          <div class="action-buttons">
            <div
              v-for="item in getItemButtons(record, index)"
              :key="item.label"
              class="action-item"
              :class="{ 'action-item--danger': item.icon === 'icon-close' }"
              @click="item?.onClick?.(record)"
              @keydown.enter="item?.onClick?.(record)"
              role="button"
              :aria-label="item.label || '操作按钮'"
              tabindex="0"
            >
              <i v-if="item.icon" :class="item.icon" class="action-icon"></i>
              <span v-if="item.label" class="action-label">{{ item.label }}</span>
            </div>
          </div>
        </template>
        <template #toolbar>
          <div class="dtl-header">
            <template v-if="!readonly">
              <div v-if="showSearch" class="search-container">
                <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @change="Search" allow-clear class="search-input" :aria-label="'搜索表格内容'">
                  <template #prefix>
                    <SearchOutlined class="search-icon" />
                  </template>
                </Input>
              </div>
              <div class="toolbar-actions space-between">
                <div class="button-group">
                  <Button v-for="btn in enActions" :key="btn.label" type="primary" :class="getButtonClass(btn.label || '')" @click="execEnActions(btn)">
                    {{ btn.label }}
                  </Button>
                  <Button v-for="btn in getTopButtons()" :key="btn.label" type="primary" :class="getButtonClass(btn.label || '')" @click="btn.onClick">
                    {{ btn.label }}
                  </Button>
                </div>
                <Button
                  class="fullscreen-btn"
                  :title="isFullscreen ? '退出全屏' : '全屏显示'"
                  @click="toggleFullscreen"
                  :icon="isFullscreen ? h(FullscreenExitOutlined) : h(FullscreenOutlined)"
                />
              </div>
            </template>
            <template v-else>
              <div class="toolbar-actions readonly-fs">
                <Button
                  class="fullscreen-btn"
                  :title="isFullscreen ? '退出全屏' : '全屏显示'"
                  @click="toggleFullscreen"
                  :icon="isFullscreen ? h(FullscreenExitOutlined) : h(FullscreenOutlined)"
                />
              </div>
            </template>
          </div>
        </template>
        <template #summary v-if="isShowSummary && tableColumns.filter((col) => isNumber(col.params) || isMoney(col.params)).length > 0">
          <TableSummary fixed>
            <TableSummaryRow>
              <TableSummaryCell :index="0">{{ '合计' }}</TableSummaryCell>
              <TableSummaryCell v-for="(col, index) in tableColumns" :key="col.key" :index="index + 1" style="text-align: center">
                {{ col.summary }}
              </TableSummaryCell>
            </TableSummaryRow>
          </TableSummary>
        </template>
      </BasicTable>

      <div v-if="disabled" class="dtl-search-mask">
        <Alert :message="'提示'" :description="'此从表需要与主表id关联, 请先保存主表'" type="info">
          <template #action>
            <Space direction="vertical">
              <Button size="small" type="primary" @click="$emit('save-main-table')">{{ '保存并使用' }}</Button>
            </Space>
          </template>
        </Alert>
      </div>
    </div>
    <drawer v-model:open="rightDrawer.visible" width="70%" :title="rightDrawer.title" @close="editClosed(true)" :body-style="bodyStyle" :get-container="getDrawerContainer">
      <component
        v-if="rightDrawer.visible"
        :is="rightDrawer.component"
        :params="rightDrawer.params"
        :EnName="rightDrawer.params?.EnName"
        :PKVal="rightDrawer.params?.PKVal"
        @close-self="editClosed(true)"
      />
    </drawer>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { computed, h, markRaw, nextTick, onMounted, onUnmounted, reactive, ref, shallowRef, toRaw } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Alert, Space, Modal, Button, TableSummary, TableSummaryCell, TableSummaryRow, message, Drawer, Input } from 'ant-design-vue';
  import { DragOutlined, SearchOutlined, UploadOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { useTable, BasicTable, ActionItem } from '/@/components/Table';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { cloneDeep, debounce } from 'lodash-es';
  import { AtPara } from '/@/bp/da/AtPara';
  import { ClassFactoryOfGroupPageNew } from '../UIEntity/ClassFactoryOfGroupPageNew';
  import { Entity } from '/@/bp/en/Entity';
  import { GloComm } from '../GloComm';
  import Sortable from 'sortablejs';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';

  import HttpHandler from '/@form/dto/HttpHandler';
  import type { Component } from 'vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { isChineseChar } from '/@/utils/is';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '../UIEntity/ClassFactoryOfWaiGuaEntity';
  import Events from '/@/utils/Events';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import webUser from '/@/bp/web/WebUser';
  import { fetchTableData, resetUserRegedit } from '/@/components/Entities/src/searchUtils';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { getAtStrValByKey } from '/@/utils/stringUtils';
  import { FrmAttachment } from '../../Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import { useEditTableEvents } from '/@/hooks/editTable/useEditTableEvents';
  import { DataType } from '/@/bp/en/DataType';

  // 计算属性：表格滚动配置
  const tableScrollConfig = computed(() => ({ y: props.height }));

  // 计算属性：是否显示搜索框
  const showSearch = computed(() => props.params.DisableSearch !== 1);

  // 计算属性：是否有操作按钮 - 缓存结果避免重复计算
  const hasActionButtons = computed(() => {
    if (!HisUAC.value) return false;
    return HisUAC.value.IsUpdate || HisUAC.value.IsDelete || (ButsItem && ButsItem.length > 0);
  });

  // 按钮样式计算
  const getButtonClass = computed(() => {
    return (btn: string) => {
      const baseClass = 'btn-style';
      if (btn.includes('新增') || btn.includes('新建')) {
        return `${baseClass} btn-add`;
      } else if (btn.includes('保存')) {
        return `${baseClass} btn-save`;
      } else if (btn.includes('删除')) {
        return `${baseClass} btn-del`;
      } else {
        return baseClass;
      }
    };
  });

  // 兼容旧版本（保留以避免破坏现有代码）
  // const btn_style = getButtonClass;

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  const tableColumns: any = ref([]);
  // 全屏状态
  const isFullscreen = ref(false);

  // 获取drawer容器 - 全屏时渲染到全屏容器内，否则渲染到body
  const getDrawerContainer = () => {
    if (isFullscreen.value && dtlSearchRef.value) {
      return dtlSearchRef.value;
    }
    return document.body;
  };
  // 事件队列：主表->从表（列名前缀等）
  const reload_func_ref = ref<Function | undefined>();
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainTableInfo: {
      type: Object,
      default: () => {
        return {
          row: {},
          classId: '',
        };
      },
    },
    height: {
      type: Number,
      default: window.innerHeight * 0.75,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    dtlKey: {
      type: String,
      default: '',
    },
  });

  // 在获取到 props 之后再注册事件队列监听，避免“props used before declaration”
  useEditTableEvents(props as unknown as Recordable, tableColumns, reload_func_ref);

  const bodyStyle = computed(() => {
    return {
      padding: 0,
    };
  });
  //搜索
  const searchKey = ref('');
  const { EnName, PKVal, RefPKVal, RefPK, ButsTableTop, ButsItem } = toRaw(props.params);
  let ShowAttrs = props.params.ShowAttrs || '';

  let sortablejsRef: Nullable<Sortable> = null;
  const dtlSearchRef = shallowRef<HTMLElement>();
  // 初始化拖动事件
  const initSortable = async () => {
    setTimeout(() => {
      const tbodyEl = dtlSearchRef.value?.querySelector('.ant-table-body')?.querySelector('tbody');
      if (!tbodyEl) {
        console.error('拖动功能初始化失败');
        return;
      }
      sortablejsRef = new Sortable(tbodyEl, {
        animation: 150,
        dataIdAttr: 'data-row-key',
        handle: '.table-drag-icon',
        onEnd: async () => {
          const sortedList = sortablejsRef?.toArray() || [];
          // 因为这个表格有个隐藏列，需要去掉第1项
          if (sortedList.length < 3) {
            return;
          }
          const targetList = sortedList.slice(1).join(',');
          // 移动后的PKs, 多个用逗号分开.
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
          handler.AddPara('MyPKs', targetList);
          //传入表格, PK,才能.
          handler.AddPara('PTable', entity?._enMap?.PhysicsTable);
          handler.AddPara('PKField', entity?._enMap?.PKs);
          await handler.DoMethodReturnString('List_Move');
        },
      });
    }, 200);
  };

  // 移除所有拖动事件
  const removeAllSortablejs = () => {
    if (sortablejsRef) {
      sortablejsRef.destroy();
    }
  };

  // }
  // const Data = ref<any>([]);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  // const currentRecord = ref({});
  const HisUAC: any = ref({});
  const selectedIds = ref<any>([]);
  const currentId = ref('');
  interface DrawerParams {
    visible: boolean;
    component: Component;
    title: string;
    params: Recordable;
  }
  const rightDrawer = reactive<DrawerParams>({
    visible: false,
    component: {},
    title: '',
    params: {},
  });
  let entity: Nullable<Entity> = null;
  const isShowSummary = ref(false);
  // 多选
  const onSelectItem = (selectedItems) => {
    selectedIds.value = selectedItems;
  };
  const enActions = ref<Array<{ label: string; onClick: Function }>>([]);
  const execEnActions = async (btn) => {
    const res = await btn.onClick(PKVal, selectedIds.value.join(','), {
      ...props.params,
      RefPKVal: props.params.PKVal,
    });
    if (res instanceof GPNReturnObj) {
      baseComp.value?.handleGPNCallback(res);
    }
  };

  const entityWG = ref<Nullable<WaiGuaBaseEntity>>();

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 20,
    pageSizeOptions: ['10', '20', '30'],
  });

  const handleTableChange = (pInfo) => {
    pagination.current = pInfo.current;
    pagination.pageSize = pInfo.pageSize;
    reload_func?.();
  };
  const ur = reactive(new UserRegedit());
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  const { getQueryArgs } = useDtlQueryCondition();
  const checkUserRegedit = async () => {
    ur.setPKVal(urMyPK);
    const res = await ur.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit(ur, urMyPK, webUser.No, EnName);
    }
    const hasIdx = entity!._enMap.attrs.find((attr) => attr.Key === 'Idx');
    if (hasIdx) {
      ur.OrderBy = 'Idx';
    }

    // 获取需要排序的列并设置默认排序
    const sortColumnsStr = (props.params['SortColumns'] || '').toString().trim();
    const sortColumnsArray = sortColumnsStr
      ? sortColumnsStr
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s)
      : [];

    // 如果配置了 SortColumns，使用第一个字段作为默认排序字段
    if (sortColumnsArray.length > 0) {
      ur.OrderBy = sortColumnsArray[0];
      ur.OrderWay = 'ASC'; // 默认升序
    }

    ur.Vals = '';
    const queryArgs = getQueryArgs(props.params, {}, entity!);
    for (let i = 0; i < queryArgs.length; i += 2) {
      ur.Vals += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    // const { RefPK, RefPKVal, PKVal } = props.params;
    // ur.Vals = `@${RefPK}=${PKVal || RefPKVal}`;
    const { enable, key } = entity!.LogicDelConfig;
    if (enable) {
      ur.Vals += `@${key}=0`;
    }
    await ur.Update();
  };
  // 打开字段附件
  const openFieldAth = async (attr, pkval: string, readonly: boolean) => {
    const athTablePK = EnName + '_' + attr.Key;
    const ath = new FrmAttachment(athTablePK);
    if (await ath.IsExits()) {
      await ath.Retrieve();
    }
    ath.Name = attr.Desc;
    ath.FK_MapData = EnName;
    ath.NoOfObj = attr.Key;
    if (attr.UIBindKey!.toString().includes('AthType=AthSingle')) ath.TopNumOfUpload = 1;
    if (attr.UIIsReadonly) ath.IsUpload = false;
    const saveType = getAtStrValByKey(attr.UIBindKey!, 'SaveTo');
    if (saveType) ath.AthSaveWay = saveType;
    await ath.Save();
    baseComp.value?.handleGPNCallback(
      new GPNReturnObj(
        GPNReturnType.OpenCompByModal,
        {
          compUrl: '/src/WF/CCForm/Ath.vue?',
          params: {
            FrmID: EnName,
            FK_FrmAttachment: athTablePK,
            PKVal: pkval,
            IsReadonly: !!readonly ? 1 : 0,
          },
        },
        '表格附件：' + ath.Name,
      ),
    );
  };
  // 批处理
  // const openBatchEditModal = () => {
  //   baseComp.value?.openModal({
  //     component: markRaw(
  //       createAsyncComponent(() => import('/@/WF/Comm/subComponents/BatchEditModal.vue'), {
  //         loading: true,
  //       }),
  //     ),
  //     params: { EnName, PKVal, ...props.params, checkedItems: selectedIds.value },
  //     title: '批处理',
  //     showFooter: false,
  //   });
  // };
  const enableSortFeature = ref(false);
  // end
  const InitPage = async () => {
    try {
      set_loading_func?.(true);

      // 参数验证
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }

      // 重置状态
      resetPageState();

      // 初始化实体
      const { success, entity: entityInstance, ens } = await initializeEntity();
      if (!success || !entityInstance) {
        message.error('获取实体失败');
        return;
      }

      entity = entityInstance;

      // 设置基础配置
      setBasicConfig(entityInstance, ens);

      // 生成表格列配置
      const columns = await generateTableColumns(entityInstance);

      // 配置表格
      configureTable(columns, entityInstance);
    } catch (error) {
      console.error('InitPage error:', error);
      message.error('页面初始化失败');
    } finally {
      set_loading_func?.(false);
    }
  };

  // 重置页面状态
  const resetPageState = () => {
    tableConfig.value = undefined;
    tableColumns.value = [];
    enableSortFeature.value = false;
  };

  // 初始化实体
  const initializeEntity = async () => {
    try {
      const entityName = 'WGEntity_' + EnName.substring(EnName.lastIndexOf('.') + 1);

      const [entityWGInstance, ens] = await Promise.all([ClassFactoryOfWaiGuaEntity.GetEn(entityName), ClassFactory.GetEns(EnName)]);

      entityWG.value = entityWGInstance;
      await ens.Init();

      const entityInstance = ens.GetNewEntity;

      return {
        success: !!entityInstance,
        entity: entityInstance,
        ens,
      };
    } catch (error) {
      console.error('Entity initialization failed:', error);
      return { success: false, entity: null, ens: null };
    }
  };

  // 设置基础配置
  const setBasicConfig = (entityInstance, ens) => {
    isShowSummary.value = entityInstance._enMap.ShowSummary;
    enActions.value = ens.enActions;
    HisUAC.value = entityInstance.HisUAC;
    currentId.value = entityInstance._enMap.PKs;
  };

  // 生成表格列配置
  const generateTableColumns = async (entityInstance) => {
    const attrs = entityInstance._enMap.attrs;
    const mapExts = entityInstance._enMap.enMapExts;
    const columns: Recordable[] = [];

    // 处理显示属性配置
    const normalizedShowAttrs = normalizeShowAttrs();

    for (const attr of attrs) {
      // 检查属性是否应该显示
      if (!shouldShowAttribute(attr, normalizedShowAttrs)) {
        continue;
      }

      // 设置属性绑定数据
      attr.binddata = [];

      // 生成列配置
      const column = await createColumnConfig(attr, attrs, mapExts);
      if (column) {
        columns.push(column);
      }
    }

    // 添加排序功能
    addSorterToColumns(columns);

    return columns;
  };

  // 标准化显示属性配置
  const normalizeShowAttrs = () => {
    if (!ShowAttrs || ShowAttrs === 'null' || ShowAttrs === '') {
      return '';
    }
    return ShowAttrs.endsWith(',') ? ShowAttrs : ShowAttrs + ',';
  };

  // 检查属性是否应该显示
  const shouldShowAttribute = (attr, normalizedShowAttrs) => {
    if (normalizedShowAttrs === '') {
      return attr.UIVisible !== false;
    }
    return normalizedShowAttrs.includes(attr.Key + ',');
  };

  // 创建列配置
  const createColumnConfig = async (attr, attrs, mapExts) => {
    // 检查是否已存在相同列
    if (tableColumns.value.find((column) => column.key === attr.Key)) {
      return null;
    }

    const baseColumn = {
      key: attr.Key,
      title: attr.Desc,
      width: attr.UIWidth + 50,
      slots: { customRender: attr.Key },
    };

    // 处理不同类型的字段
    if (isDropdownField(attr, mapExts)) {
      return createDropdownColumn(attr, attrs, baseColumn);
    }

    if (isEnumOrForeignKeyField(attr)) {
      return createEnumOrFKColumn(attr, attrs, baseColumn);
    }

    if (isBooleanField(attr)) {
      return createBoolean(attr, attrs, baseColumn);
    }

    return createNormalColumn(attr, baseColumn);
  };

  // 判断是否为下拉框字段
  const isDropdownField = (attr, mapExts) => {
    return (attr.UIContralType === UIContralType.DDL && attr.MyFieldType === FieldType.Normal) || mapExts.find((m) => m.AttrOfOper === attr.Key);
  };

  // 判断是否为枚举或外键字段
  const isEnumOrForeignKeyField = (attr) => {
    return attr.MyFieldType === FieldType.Enum || attr.MyFieldType === FieldType.FK;
  };

  // 判断是否是boolean字段

  const isBooleanField = (attr) => {
    return attr.MyDataType === DataType.AppBoolean;
  };

  // 创建下拉框列配置
  const createDropdownColumn = (attr, attrs, baseColumn) => {
    const newAttr = attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'T');
    if (!newAttr) return null;

    return {
      ...baseColumn,
      key: newAttr.Key,
      dataIndex: newAttr.Key,
      params: newAttr,
      slots: { customRender: newAttr.Key },
      align: 'center',
    };
  };

  // 创建枚举或外键列配置
  const createEnumOrFKColumn = (attr, attrs, baseColumn) => {
    const newAttr = attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'Text');
    if (!newAttr) return null;
    return {
      ...baseColumn,
      key: newAttr.Key,
      dataIndex: newAttr.Key,
      params: newAttr,
      slots: { customRender: newAttr.Key },
      align: 'center',
    };
  };

  const createBoolean = (attr, attrs, baseColumn) => {
    const newAttr = attrs.find((oldAttr) => oldAttr.Key === attr.Key);
    if (!newAttr) return null;
    return {
      ...baseColumn,
      key: newAttr.Key,
      dataIndex: newAttr.Key,
      params: newAttr,
      slots: { customRender: newAttr.Key },
      align: 'center',
      customRender: (text, record) => {
        return text.value == 1 ? '是' : text.value == 0 ? '否' : text.value;
      },
    };
  };

  // 创建普通列配置
  const createNormalColumn = (attr, baseColumn) => {
    return {
      ...baseColumn,
      dataIndex: attr.Key,
      align: 'center',
      ...attr,
    };
  };

  // 为列添加排序功能
  const addSorterToColumns = (columns) => {
    columns.forEach((col) => {
      col.sorter = createColumnSorter(col.Key);
    });
  };

  // 创建列排序器
  const createColumnSorter = (key) => {
    return (prev, curr) => {
      const prevData = prev[key];
      const currData = curr[key];

      // 中文排序
      if (isChineseChar(prevData) && isChineseChar(currData)) {
        return prevData.localeCompare(currData, 'zh-Hans');
      }

      // 数字排序
      if (!isNaN(prevData) && !isNaN(currData)) {
        return prevData - currData;
      }

      // 字符串
      if (typeof prevData === 'string' && typeof currData === 'string') {
        return prevData.localeCompare(currData);
      }

      return 0;
    };
  };

  // 配置表格
  const configureTable = (columns, entityInstance) => {
    const allowSort = props.params.IsMove == 1;
    const hasIdx = hasIdxField(entityInstance);
    // 验证主键
    if (!validatePrimaryKey(entityInstance)) {
      return;
    }
    // 验证排序配置
    const validSortRes = validateSortConfiguration(allowSort, hasIdx);
    // 设置表格列
    tableColumns.value = validSortRes ? addMoveColumn(columns) : columns;
    // 设置排序状态
    console.log({
      hasIdx,
      allowSort,
    });
    if (hasIdx && allowSort) {
      enableSortFeature.value = true;
    }
  };

  // 检查是否有Idx字段
  const hasIdxField = (entityInstance) => {
    return entityInstance._enMap.attrs.some((attr) => attr.Key === 'Idx');
  };

  // 验证主键
  const validatePrimaryKey = (entityInstance) => {
    const primaryKey = entityInstance?.PK;
    if (!primaryKey) {
      alert('缺少主键,请检查实体设置');
      return false;
    }
    return true;
  };

  // 验证排序配置
  const validateSortConfiguration = (allowSort, hasIdx) => {
    if (allowSort && !hasIdx) {
      console.warn('当前表格配置了排序功能，但缺少Idx字段，排序将不会生效');
      return false;
    }
    return allowSort && hasIdx;
  };

  // 添加移动列
  const addMoveColumn = (columns) => {
    const moveColumn = {
      key: '_sys_move',
      fixed: 'left',
      width: 40,
      align: 'center',
      slots: { customRender: 'sys_move' },
    };

    return [moveColumn, ...columns];
  };

  const getTopButtons = () => {
    const arr = ButsTableTop || [];
    const actions: Array<ActionItem> = [];
    if (HisUAC.value.IsInsert) {
      actions.push({
        label: '新增',
        onClick: () => add(),
      });
    }

    if (HisUAC.value.IsDelete) {
      const TableRowSelection = props.params.TableRowSelection;
      if (!TableRowSelection || TableRowSelection === 'checkbox' || TableRowSelection === 'radio') {
        actions.push({
          label: '删除',
          ghost: true,
          onClick: () => onDeletes(),
        });
      }
    }
    // if (HisUAC.value.IsInsert && HisUAC.value.IsUpdate) {
    //   actions.push({
    //     label: '批处理',
    //     ghost: true,
    //     onClick: () => openBatchEditModal(),
    //   });
    // }
    if (arr.length !== 0) {
      arr?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            const res = await WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, RefPKVal, selectedIds.value.join(), props.params);
            if (res instanceof GPNReturnObj) {
              baseComp.value?.handleGPNCallback(res);
            }
          },
        });
      });
    }
    return actions;
  };
  const getItemButtons = (item, index) => {
    if (props.readonly) return [];
    const arr = ButsItem || '';
    const actions: Array<ActionItem> = [];
    if (HisUAC.value.IsUpdate) {
      actions.push({
        // icon: GloComm.GenerBtnICON('修改'),  这个不生效暂时注释掉
        icon: 'icon-note',
        label: '',
        onClick: (record: Record<string, any>) => {
          rowDoubleClick(record);
        },
      });
    }
    if (HisUAC.value.IsDelete) {
      actions.push({
        // icon: GloComm.GenerBtnICON('删除'),
        icon: 'icon-close',
        label: '',
        onClick: () => {
          onDelete(index, item[currentId.value]);
        },
      });
    }
    if (!!arr) {
      arr
        .split(',')
        .filter((btnLab) => !!btnLab)
        .forEach((btnName: string) => {
          actions.push({
            label: btnName,
            icon: GloComm.GenerBtnICON(btnName),
            onClick: () => {
              WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, PKVal, item[currentId.value]);
            },
          });
        });
    }
    const extDtlRowFunctions = entityWG.value?.RowFunctions || [];
    for (const erf of extDtlRowFunctions) {
      actions.push({
        label: erf.label,
        icon: erf.icon,
        onClick: async (rowData) => {
          const preRow = cloneDeep(props.mainTableInfo.row);
          const cb = await erf.onClick(rowData, props.mainTableInfo.classId, props.mainTableInfo.row);
          if (cb instanceof GPNReturnObj) {
            baseComp.value?.handleGPNCallback(cb);
            return;
          }
          if (cb.mainTableRow) {
            const keys = Object.keys(preRow);
            for (const k of keys) {
              if (cb.mainTableRow[k] !== preRow[k]) {
                Events.emit('update-en-row', {
                  key: k,
                  val: cb.mainTableRow[k],
                });
              }
            }
          }
        },
      });
    }
    return actions;
  };
  const onDelete = async (index, id) => {
    if (!id) {
      return;
    }
    Modal.confirm({
      title: () => '提示',
      content: () => '确定要删除吗?',
      async onOk() {
        const record = await ClassFactory.GetEn(EnName);
        await record.Init();
        record.setPKVal(id);
        await record.Retrieve();
        await record.Delete();
        reload_func?.();
      },
      // eslint-disable-next-currentRecord @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };
  const onDeletes = async () => {
    if (selectedIds.value.length == 0) {
      message.info('请选择删除项');
      return;
    }
    Modal.confirm({
      title: () => '提示',
      content: () => '确定要删除吗？',
      async onOk() {
        try {
          set_loading_func?.(true);
          const queue = selectedIds.value.map(async (item) => {
            const enMyPK = await ClassFactory.GetEn(EnName);
            enMyPK.setPKVal(item);
            await enMyPK.RetrieveFromDBSources();
            return enMyPK.Delete();
          });
          await Promise.all(queue);
          reload_func?.();
        } catch (e: any) {
          message.error(e.toString());
          console.error(e);
        } finally {
          set_loading_func?.(false);
        }
      },
    });
  };
  const editClosed = async (reload = true) => {
    rightDrawer.visible = false;
    if (!reload) return;
    await nextTick();
    reload_func?.();
  };
  const add = async () => {
    const enGPN = await ClassFactoryOfGroupPageNew.GetEnByEntityClassID(entity?.classID || '');
    if (enGPN != null) {
      rightDrawer.component = markRaw(
        createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
          loading: true,
        }),
      );
      const subComponentParams = cloneDeep(props.params || {});
      delete subComponentParams['EnName'];
      delete subComponentParams['PKVal'];
      rightDrawer.params = { EnName: enGPN.classID, RefPKVal: PKVal, RefDtlEnName: EnName, ...subComponentParams };
      rightDrawer.title = enGPN.PageTitle || 'GPN-Page-Insert';
      rightDrawer.visible = true;
      return;
    }
    rightDrawer.component = markRaw(
      createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
        loading: true,
      }),
    );
    const subComponentParams = cloneDeep(props.params || {});
    delete subComponentParams['EnName'];
    delete subComponentParams['PKVal'];
    rightDrawer.params = { EnName, ...subComponentParams, [RefPK]: PKVal };
    rightDrawer.title = '新增';
    rightDrawer.visible = true;
  };
  const rowDoubleClick = (record: Record<string, any>) => {
    const atPara = new AtPara(record.AtPara || '');
    rightDrawer.component = markRaw(
      createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
        loading: true,
      }),
    );
    const subComponentParams = cloneDeep(props.params || {});
    delete subComponentParams['EnName'];
    delete subComponentParams['PKVal'];
    let atParaEnName = atPara.GetValStrByKey('EnName');
    if (atParaEnName == 'None') {
      message.warn('此类权限无需编辑');
      return;
    } //如果是none 就是不需要打开编辑.
    //获取存储的主键值,如果有EnPKVal,就使用EnPKVal.
    const enPKVal = atPara.GetValStrByKey('EnPKVal');
    rightDrawer.params = { EnName: atParaEnName || EnName, PKVal: record[currentId.value], RefPKVal: enPKVal || PKVal, ...subComponentParams, [RefPK]: PKVal };
    rightDrawer.title = subComponentParams.Title;
    rightDrawer.visible = true;
  };
  //搜索
  const Search = debounce(async () => {
    ur.SearchKey = searchKey.value;
    await ur.Update();
    reload_func?.();
  }, 300);

  // 全屏切换功能
  const toggleFullscreen = () => {
    const element = baseComp.value?.$el;
    if (!element) return;

    if (!isFullscreen.value) {
      // 进入全屏
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // 更新表格高度配置
  const updateTableHeight = () => {
    if (!tableMethods) return;

    const height = isFullscreen.value ? window.screen.height - 150 : Math.max(300, props.height); // 全屏时使用视口高度 : 正常时使用 props 高度

    // 通过表格实例更新滚动配置
    try {
      if (tableMethods.setProps) {
        tableMethods.setProps({
          scroll: { y: height },
        });
      }
    } catch (error) {
      console.warn('更新表格高度失败:', error);
    }
  };

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    const wasFullscreen = isFullscreen.value;
    isFullscreen.value = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);

    // 全屏状态改变时更新表格高度
    nextTick(() => {
      updateTableHeight();

      // 如果从全屏切换到非全屏且drawer是打开的，需要重新渲染drawer
      if (wasFullscreen && !isFullscreen.value && rightDrawer.visible) {
        // 强制重新渲染drawer以确保其显示在正确的容器中
        const wasVisible = rightDrawer.visible;
        rightDrawer.visible = false;
        nextTick(() => {
          rightDrawer.visible = wasVisible;
        });
      }
    });
  };

  const tableConfig = ref<Function>();
  let reload_func: Function | null = null;
  let set_loading_func: Function | null = null;
  let tableMethods: any = null;
  const createTable = async () => {
    await InitPage();
    await checkUserRegedit();
    const rowSelection = props.params.TableRowSelection;
    const config: Recordable = {
      title: '',
      api: () => {
        if (props.disabled) {
          // 返回空数据但保持正确的数据结构，而不是直接 resolve
          return Promise.resolve({
            items: [],
            total: 0,
            pageSize: pagination.pageSize,
            current: pagination.current,
          });
        }
        return fetchTableData(EnName, pagination.current, pagination.pageSize, ur);
      },
      rowKey: entity?.PK,
      canResize: true,
      rowSelection: {
        type: 'checkbox',
        onChange: onSelectItem,
      },
      onChange: handleTableChange,
      columns: tableColumns,
      clickToRowSelect: false,
      bordered: true,
      resizeHeightOffset: 100,
      isCanResizeParent: true,
      useSearchForm: false,
      showIndexColumn: false,
      showTableSetting: true,
      // 确保表格有最小高度
      scroll: {
        y: Math.max(300, props.height), // 给 disabled 状态设置最小高度
      },
      formConfig: {
        labelWidth: 120,
        autoSubmitOnEnter: false,
        showResetButton: false,
        showSubmitButton: false,
        showActionButtonGroup: true,
      },
    };
    if (!props.readonly) {
      const actionColumnWidth = getItemButtons(null, null).length * 60 + 20;
      config.actionColumn = {
        width: Math.max(actionColumnWidth, 100),
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        align: 'center',
      };
    }
    if (rowSelection == 'radio') {
      config.rowSelection = {
        type: 'radio',
        onChange: onSelectItem,
      };
    }
    if (rowSelection == 'none' || props.readonly) {
      config.rowSelection = undefined;
    }
    const [registerTable, methods] = useTable(config);
    tableConfig.value = registerTable;
    tableMethods = methods;
    if (enableSortFeature.value) await initSortable();
    reload_func = methods.reload;
    set_loading_func = methods.setLoading;
    searchKey.value = ur.SearchKey;
    // 同步到事件队列 hook
    reload_func_ref.value = methods.reload;
  };

  type DtlEventParam = {
    type: string;
    dtlKey: string;
    dtlColumn: string;
    val: any;
  };
  const handleUpdateColPrefix = (colKey: string, val: any) => {
    for (const col of tableColumns.value) {
      if (col.key === colKey) {
        if (!col.originTitle) {
          col.originTitle = col.title;
        }
        col.title = val + col.originTitle;
      }
    }
    reload_func?.();
  };
  const handleDtlEvent = (params: DtlEventParam) => {
    switch (params.type) {
      case 'updateColPrefix':
        handleUpdateColPrefix(params.dtlColumn, params.val);
        break;
    }
  };
  const registEvents = () => {
    Events.on('trigger-dtl-events', (params: DtlEventParam) => {
      if (params.dtlKey === props.dtlKey) {
        handleDtlEvent(params);
      }
    });
  };
  const unRegistEvents = () => {
    Events.off('trigger-dtl-events');
  };
  onMounted(async () => {
    await createTable();
    registEvents();

    // 添加全屏事件监听
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
  });
  onUnmounted(() => {
    removeAllSortablejs();
    unRegistEvents();

    // 移除全屏事件监听
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  });
  const { isNumber, isMoney, isSingleAth } = useFieldType();

  defineEmits(['save-main-table']);
  defineExpose({ editClosed });
</script>
<style lang="less" scoped>
  .vben-basic-table-form-container {
    overflow: hidden;
    box-sizing: border-box;
  }

  .vben-basic-table-action.center {
    justify-content: flex-end;
  }

  .dtl-search {
    :deep(.ant-table-thead > tr > th) {
      background-color: #f8faff;
      border-bottom: 1px solid #e6f0ff;
      font-weight: 500;
      font-size: 14px;
    }

    :deep(td.ant-table-cell) {
      padding: 0 !important;
    }

    :deep(.vben-basic-table-form-container .ant-form) {
      margin-bottom: 6px;
      padding: 6px 10px 0;
    }

    :deep(.ant-btn-dangerous) {
      color: #ff4d4f;
      background-color: transparent;
      border-color: #ff4d4f;

      &:hover {
        background-color: #ff4d4f;
        color: #fff;
      }
    }
  }

  .dtl-search-wrapper {
    position: relative;

    // 全屏状态样式
    &:fullscreen,
    &:-webkit-full-screen,
    &:-moz-full-screen,
    &:-ms-fullscreen {
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      box-sizing: border-box !important;
      overflow: hidden !important;

      // 超强制全白背景 - 覆盖所有可能的元素
      *,
      *::before,
      *::after,
      div,
      section,
      main,
      article,
      aside,
      nav,
      header,
      footer {
        background: #fff !important;
        background-color: #fff !important;
        color: inherit !important;
      }

      // 直接针对可能的黑色背景元素
      :deep(.ant-layout),
      :deep(.ant-layout-content),
      :deep(.ant-layout-sider),
      :deep(.ant-layout-header),
      :deep(.ant-layout-footer),
      :deep(.ant-back-top),
      :deep(.ant-affix) {
        background: #fff !important;
        background-color: #fff !important;
      }

      // 表格相关的所有容器
      :deep(.vben-basic-table),
      :deep(.vben-basic-table-header-action),
      :deep(.vben-basic-table-form-container),
      :deep(.ant-table-wrapper),
      :deep(.ant-table-container),
      :deep(.ant-table-content),
      :deep(.ant-table-scroll),
      :deep(.ant-table-body),
      :deep(.ant-table-thead),
      :deep(.ant-table-tbody),
      :deep(.ant-table),
      :deep(.ant-spin-container),
      :deep(.ant-spin-nested-loading) {
        background: #fff !important;
        background-color: #fff !important;
        height: 100% !important;
      }

      // 表格主容器 - 使用 flex 布局填满全屏
      :deep(.vben-basic-table) {
        display: flex !important;
        flex-direction: column !important;
        height: 100vh !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
      }

      // 表格工具栏 - 固定高度
      :deep(.vben-basic-table-header-action) {
        flex-shrink: 0 !important;
        height: auto !important;
        padding: 16px !important;
      }

      // 表格内容区域 - 占用剩余空间
      :deep(.vben-basic-table-form-container) {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      // 表格包装器 - 填满父容器
      :deep(.ant-table-wrapper) {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
      }

      // 表格容器 - 填满并允许滚动
      :deep(.ant-table-container) {
        flex: 1 !important;
        overflow: auto !important;
        min-height: 0 !important;
      }

      // 确保没有任何地方有暗色背景
      :deep(.ant-table thead > tr > th) {
        background: #fafafa !important;
        background-color: #fafafa !important;
      }

      :deep(.ant-table tbody > tr > td) {
        background: #fff !important;
        background-color: #fff !important;
      }

      :deep(.ant-table tbody > tr:nth-child(even) > td) {
        background: #f9f9f9 !important;
        background-color: #f9f9f9 !important;
      }

      // 额外确保整个文档区域都是白色
      &::before,
      &::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #fff;
        z-index: -1;
        pointer-events: none;
      }

      // 全屏状态下的drawer样式修复
      :deep(.ant-drawer) {
        position: absolute !important;
        z-index: 9999 !important;
      }

      :deep(.ant-drawer-mask) {
        position: absolute !important;
        z-index: 9998 !important;
      }

      :deep(.ant-drawer-wrap) {
        position: absolute !important;
        z-index: 9999 !important;
      }

      // 确保Modal在全屏状态下也能正常显示
      :deep(.ant-modal-root) {
        position: absolute !important;
        z-index: 9999 !important;
      }

      :deep(.ant-modal-mask) {
        position: absolute !important;
        z-index: 9998 !important;
      }

      :deep(.ant-modal-wrap) {
        position: absolute !important;
        z-index: 9999 !important;
      }
    }

    .dtl-search-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
      z-index: 999;
      border-radius: 8px;
    }

    .td-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 40px;
      padding: 8px;
    }

    .icon-cell {
      text-align: center;
      font-size: 16px;
    }

    .attachment-cell {
      width: 100%;

      .attachment-button {
        width: 100%;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .data-cell {
      padding: 0 8px;
      text-align: center;
      word-break: break-word;
    }
  }

  .move-header {
    text-align: center;
    color: #666;
  }

  .table-drag-icon {
    color: #666;
    cursor: move;
    transition: color 0.2s;

    &:hover {
      color: #1677ff;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    .action-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      color: #1677ff;
      transition: all 0.2s;

      .action-icon {
        font-size: 14px;
      }

      .action-label {
        margin-left: 4px;
        font-size: 12px;
      }

      &:hover {
        background-color: #f0f8ff;
        transform: scale(1.05);
      }

      &--danger {
        color: #ff4d4f;

        &:hover {
          background-color: #fff2f0;
        }
      }
    }
  }

  .search-container {
    margin-right: 16px;

    .search-input {
      width: 200px;
      transition: all 0.3s;

      &:focus-within {
        width: 240px;
        box-shadow: 0 2px 8px rgba(24, 119, 255, 0.15);
      }

      @media (max-width: 768px) {
        width: 160px;

        &:focus-within {
          width: 200px;
        }
      }
    }

    .search-icon {
      color: #999;
      transition: color 0.2s;
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      gap: 8px;
      flex-direction: column;
      width: 100%;

      .ant-btn {
        width: 100%;
        margin-bottom: 4px;
      }
    }
  }

  .dtl-header {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 48px;
    padding: 8px 0;

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 16px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }

    .readonly-fs {
      flex: 1;
      justify-content: flex-end;
    }
    .space-between {
      flex: 1;
      justify-content: space-between;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .fullscreen-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        background-color: #fff;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #1677ff;
          color: #1677ff;
          background-color: #f0f8ff;
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    @media (max-width: 768px) {
      min-height: auto;
      flex-direction: column;
      align-items: stretch;
    }
  }

  .btn-style {
    height: 32px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }

  .btn-add {
    background-color: #f6ffed;
    color: #52c41a;
    border-color: #b7eb8f;

    &:hover {
      background-color: #52c41a;
      color: #fff;
      border-color: #52c41a;
    }
  }

  // 覆盖 AntD 按钮默认/primary 样式，避免使用 !important
  .ant-btn.btn-add,
  .ant-btn-primary.btn-add {
    background-color: #f6ffed;
    color: #52c41a;
    border-color: #b7eb8f;
  }
  .ant-btn.btn-add:hover,
  .ant-btn-primary.btn-add:hover {
    background-color: #52c41a;
    color: #fff;
    border-color: #52c41a;
  }

  .btn-save {
    background-color: #e6f7ff;
    color: #1890ff;
    border-color: #91d5ff;

    &:hover {
      background-color: #1890ff;
      color: #fff;
      border-color: #1890ff;
    }
  }

  .ant-btn.btn-save,
  .ant-btn-primary.btn-save {
    background-color: #e6f7ff;
    color: #1890ff;
    border-color: #91d5ff;
  }
  .ant-btn.btn-save:hover,
  .ant-btn-primary.btn-save:hover {
    background-color: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }

  .btn-del {
    background-color: #fff2f0;
    color: #ff4d4f;
    border-color: #ffccc7;

    &:hover {
      background-color: #ff4d4f;
      color: #fff;
      border-color: #ff4d4f;
    }
  }

  .ant-btn.btn-del,
  .ant-btn-primary.btn-del,
  .ant-btn-dangerous.btn-del {
    background-color: #fff2f0;
    color: #ff4d4f;
    border-color: #ffccc7;
  }
  .ant-btn.btn-del:hover,
  .ant-btn-primary.btn-del:hover,
  .ant-btn-dangerous.btn-del:hover {
    background-color: #ff4d4f;
    color: #fff;
    border-color: #ff4d4f;
  }

  /* 兼容 ghost 模式（outline 按钮），提升选择器优先级覆盖 AntD 默认 hover */
  .ant-btn.ant-btn-background-ghost.btn-del,
  .ant-btn-primary.ant-btn-background-ghost.btn-del {
    background-color: #fff2f0;
    color: #ff4d4f;
    border-color: #ffccc7;
  }
  .ant-btn.ant-btn-background-ghost.btn-del:hover,
  .ant-btn-primary.ant-btn-background-ghost.btn-del:hover {
    background-color: #ff4d4f;
    color: #fff;
    border-color: #ff4d4f;
  }

  // 兼容性类名
  .btn_style {
    .btn-style();
  }

  .btn_add {
    .btn-add();
  }

  .btn_save {
    .btn-save();
  }

  .btn_del {
    .btn-del();
  }
</style>
