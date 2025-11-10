<template>
  <div class="simple-subtable">
    <div v-if="dtlList.length === 0" class="empty">当前实体没有从表，请配置</div>
    <div v-for="dtl in dtlList" :key="dtl.key" class="dtl-block" :ref="(el) => setDtlRef(dtl.key, el as HTMLElement)">
      <NDataTable
        :columns="dtl.columns"
        :data="dtl.rows"
        :row-key="(row: any) => String(row[dtl.pk])"
        :row-props="(row: any) => ({ 'data-row-id': String(row[dtl.pk]) })"
        :pagination="false"
        :bordered="true"
      />
    </div>
    <Modal v-model:open="editor.visible" :title="editor.title" width="100%" :footer="null" :maskClosable="false" destroyOnClose wrapClassName="ant-modal-full-modal">
      <component
        v-if="editor.visible"
        :is="editor.component"
        :params="editor.params"
        :EnName="editor.params?.EnName"
        :PKVal="editor.params?.PKVal"
        @close-self="closeEditor(true)"
      />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, reactive, h, nextTick, onUnmounted } from 'vue';
  import { NDataTable } from 'naive-ui';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import WebUser from '/@/bp/web/WebUser';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { resetUserRegedit } from '/@/components/Entities/src/searchUtils';
  import { Button as AntButton, Modal, message } from 'ant-design-vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { markRaw } from 'vue';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Events from '/@/utils/Events';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';

  type TableColumn = {
    title: string;
    key: string;
    width?: number;
    align?: string;
    titleAlign?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    render?: (row: any) => any;
    sorter?: boolean | ((row1: any, row2: any) => number);
    sortOrder?: 'ascend' | 'descend' | false;
  };

  const props = defineProps({
    entity: { type: Object, required: true },
    mainTableRow: { type: Object, default: () => ({}) },
  });

  type DtlDef = {
    key: string;
    name: string;
    enName: string;
    columns: TableColumn[];
    rows: any[];
    pk: string;
    pTable?: string;
    allowSort: boolean;
    // 额外：权限与查询上下文（用于操作列与刷新）
    hisUAC?: { IsUpdate?: boolean; IsDelete?: boolean };
    params: Recordable;
    ur: UserRegedit;
    entityWG?: WaiGuaBaseEntity | null;
    actionBtnCount?: number;
  };

  const dtlList = ref<DtlDef[]>([]);

  // 全屏编辑 Modal
  type EditorState = {
    visible: boolean;
    title: string;
    component: any;
    params: Recordable;
  };
  const editor = reactive<EditorState>({ visible: false, title: '编辑', component: null, params: {} });
  const openEditor = async (dtl: DtlDef, row: any) => {
    try {
      editor.title = dtl.name ? `${dtl.name}: 编辑` : '编辑';
      const subParams = { ...dtl.params };
      // 避免冲突字段重复
      delete (subParams as any)['EnName'];
      delete (subParams as any)['PKVal'];
      // RefPK/RefPKVal 兼容
      const refPK = (dtl.params as any)['RefPK'];
      const refPKVal = (dtl.params as any)['PKVal'] || (dtl.params as any)['RefPKVal'];
      const baseParams: Recordable = { EnName: dtl.enName, PKVal: row[dtl.pk] };
      if (refPK && refPKVal) baseParams[refPK] = refPKVal;
      if (refPKVal) baseParams['RefPKVal'] = refPKVal;
      editor.params = { ...baseParams, ...subParams };
      editor.component = markRaw(
        createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
          loading: true,
        }),
      );
      editor.visible = true;
    } catch (e) {
      console.error(e);
      message.error('打开编辑器失败');
    }
  };
  const closeEditor = async (_reload = false) => {
    editor.visible = false;
    if (_reload) {
      // 简单处理：刷新所有子表数据
      for (const d of dtlList.value) {
        await reloadDtlRows(d as DtlDef);
      }
    }
  };

  const emit = defineEmits(['handleGPNCallback']);

  // 处理 GPN 回调：支持常见几类即可
  const handleGPNCallback = async (dtl: DtlDef, obj: any) => {
    try {
      if (!(obj instanceof GPNReturnObj)) return;
      switch (obj.ReturnType) {
        case GPNReturnType.Reload:
        case GPNReturnType.CloseAndReload:
          await reloadDtlRows(dtl);
          break;
        default:
          emit('handleGPNCallback', obj);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createRowActions = (row: Recordable, entityWG: WaiGuaBaseEntity | null | undefined, permissionStr: string) => {
    if (!entityWG) return [];
    const rowFunctions: RefMethod[] = [];
    const btns = entityWG?.SearchOptBtns;
    let btnDef = '';
    if (typeof btns === 'function') {
      btnDef = btns(row);
    } else if (typeof btns === 'string') {
      btnDef = btns;
    }
    if (typeof btnDef === 'string') {
      const btnList = btnDef
        .split(',')
        .filter((b) => b)
        .map((b) => b.trim());

      for (const btn of btnList) {
        const refMethod: RefMethod = new RefMethod();
        refMethod.Title = btn;
        refMethod.ClassMethod = btn;
        refMethod.Tag = 'WaiGua';
        rowFunctions.push(refMethod);
      }
    }
    if (typeof permissionStr === 'string' && permissionStr.trim().length > 0) return rowFunctions.filter((rf) => permissionStr.includes(',' + rf.Title + ','));
    return rowFunctions;
  };

  const buildColumns = (
    dtl: DtlDef,
    attrs: any[],
    _pk: string,
    _enName: string,
    allowSort: boolean,
    _sortColumns: string[] = [],
    enableSorter = false,
    permissionStr: string,
  ): TableColumn[] => {
    const normalCols: TableColumn[] = [];
    // 简单渲染字段（可见且基础控件）
    const visibleAttrs = attrs.filter((a) => a.UIVisible && a.UIContralType < 4);
    console.log('visibleAttrs', visibleAttrs);

    for (const a of visibleAttrs) {
      let col: TableColumn | null = null;

      // DDL 字段：显示 Key + 'T'
      if ((a.UIContralType === UIContralType.DDL && a.MyFieldType === FieldType.Normal) || attrs.find((m: any) => m.AttrOfOper === a.Key)) {
        const tAttr = attrs.find((oldAttr: any) => oldAttr.Key === a.Key + 'T');
        if (tAttr) {
          col = { title: a.Desc, key: tAttr.Key, width: a.UIWidth + 50, align: 'center', titleAlign: 'center' };
        }
      }
      // 枚举或外键：显示 Key + 'Text'
      else if (a.MyFieldType === FieldType.Enum || a.MyFieldType === FieldType.FK) {
        const tAttr = attrs.find((oldAttr: any) => oldAttr.Key === a.Key + 'Text');
        if (tAttr) {
          col = { title: a.Desc, key: tAttr.Key, width: a.UIWidth + 50, align: 'center', titleAlign: 'center' };
        }
      }
      // Boolean 字段
      else if (a.MyDataType === DataType.AppBoolean) {
        col = {
          title: a.Desc,
          key: a.Key,
          width: a.UIWidth + 50,
          align: 'center',
          titleAlign: 'center',
          render: (row: any) => (row[a.Key] == 1 ? '是' : row[a.Key] == 0 ? '否' : row[a.Key]),
        };
      }
      // 日期字段：截取显示
      else if (a.IsDateField) {
        col = {
          title: a.Desc,
          key: a.Key,
          width: a.UIWidth + 50,
          align: 'center',
          titleAlign: 'center',
          render: (row: any) => {
            const time = row[a.Key];
            if (typeof time === 'string') return time.length > 16 ? time.substring(0, 16) : time;
            return time;
          },
        };
      }
      // 普通字段
      else {
        col = { title: a.Desc, key: a.Key, width: a.UIWidth < 50 ? 50 : a.UIWidth, align: 'center', titleAlign: 'center' };
      }

      // 如果启用了前端排序，为当前列添加排序功能
      if (col && enableSorter) {
        const sortKey = col.key; // 捕获当前列的 key
        col.sorter = (row1: any, row2: any) => {
          const val1 = row1[sortKey];
          const val2 = row2[sortKey];

          // 处理 null 或 undefined
          if (val1 == null && val2 == null) return 0;
          if (val1 == null) return 1;
          if (val2 == null) return -1;

          // 数字类型比较
          if (typeof val1 === 'number' && typeof val2 === 'number') {
            return val1 - val2;
          }

          // 日期字符串比较
          if (a.IsDateField) {
            return new Date(val1).getTime() - new Date(val2).getTime();
          }

          // 布尔值比较
          if (a.MyDataType === DataType.AppBoolean) {
            return (val1 ? 1 : 0) - (val2 ? 1 : 0);
          }

          // 字符串比较（包括中文）
          return String(val1).localeCompare(String(val2), 'zh-CN');
        };
      }

      if (col) {
        normalCols.push(col);
      }
    }

    const cols: TableColumn[] = [];
    // 拖拽把手列放最左侧
    if (allowSort) {
      cols.push({
        title: '移动',
        key: '__move__',
        width: 60,
        align: 'center',
        titleAlign: 'center',
        fixed: 'left',
        render: () => h('span', { class: 'table-drag-icon', style: { cursor: 'move', color: '#64748b' } }, '≡'),
      });
    }
    cols.push(...normalCols);
    // 操作列（同步 DtlSearch 的思路：编辑/详情 + 删除，按权限显示）
    const canUpdate = !!dtl.hisUAC?.IsUpdate;
    const canDelete = !!dtl.hisUAC?.IsDelete;
    const butsItem = ((dtl.params?.ButsItem as string) || '').split(',').filter((x) => !!x);
    const wgRowCount = Array.isArray(dtl.entityWG?.RowFunctions) ? dtl.entityWG!.RowFunctions.length : 0;
    const predictCount = (canUpdate ? 1 : 1) + (canDelete ? 1 : 0) + butsItem.length + wgRowCount; // 总会有一个“编辑/详情”

    if (predictCount > 0) {
      const btnCount = predictCount;
      const actionColWidth = Math.max(btnCount * 60 + 20, 100);
      cols.push({
        title: '操作',
        key: '__action__',
        width: actionColWidth,
        align: 'center',
        titleAlign: 'center',
        fixed: 'right',
        render: (row: any) => {
          const nodes: any[] = [];
          const actionBtn = (label: string, onClick: () => void, danger = false) =>
            h(AntButton as any, { type: danger ? 'primary' : 'primary', danger, size: 'small', round: true, onClick }, { default: () => label });
          if (canUpdate) nodes.push(actionBtn('编辑', () => openEditor(dtl, row)));
          // if (!canUpdate) nodes.push(actionBtn('详情', () => openEditor(dtl, row)));
          if (canDelete) nodes.push(actionBtn('删除', () => onDeleteRow(dtl, row), true));
          // 扩展：ButsItem（行按钮）
          if (butsItem.length > 0) {
            butsItem.forEach((btnName) => {
              nodes.push(
                actionBtn(btnName, async () => {
                  const res = await WF_Comm_Dtl.TableTopBtnClick(btnName, dtl.enName, (dtl.params as any).PKVal, row[dtl.pk]);
                  if (res instanceof GPNReturnObj) {
                    await handleGPNCallback(dtl, res);
                  }
                }),
              );
            });
          }
          // 扩展：外挂行函数
          for (const fn of createRowActions(row, dtl.entityWG, permissionStr)) {
            nodes.push(
              h(
                AntButton,
                {
                  type: 'primary',
                  size: 'small',
                  round: true,
                  onClick: async () => {
                    const res = await dtl.entityWG?.BtnClick?.('SearchOpt', fn.Title || '', '', row);
                    if (res instanceof GPNReturnObj) {
                      handleGPNCallback(dtl, res);
                    }
                  },
                } as any,
                () => fn.Title as string,
              ) as any,
            );
          }

          const extRowFuncs = dtl.entityWG?.RowFunctions || [];
          for (const erf of extRowFuncs) {
            nodes.push(
              actionBtn(erf.label || '操作', async () => {
                const preRow = { ...(props.mainTableRow || {}) };
                const cb = await erf.onClick(row, props.entity.classID, props.mainTableRow);
                if (cb instanceof GPNReturnObj) {
                  await handleGPNCallback(dtl, cb);
                  return;
                }
                if (cb && cb.mainTableRow) {
                  const keys = Object.keys(preRow);
                  for (const k of keys) {
                    if (cb.mainTableRow[k] !== preRow[k]) {
                      Events.emit('update-en-row', { key: k, val: cb.mainTableRow[k] });
                    }
                  }
                }
              }),
            );
          }
          return h(
            'div',
            {
              style: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
            },
            nodes,
          );
        },
      });
    }
    return cols;
  };
  // 删除并刷新当前子表
  const onDeleteRow = async (dtl: DtlDef, row: any) => {
    const id = row[dtl.pk];
    if (!id) return;
    Modal.confirm({
      title: () => '提示',
      content: () => '确定要删除吗？',
      async onOk() {
        try {
          const en = await ClassFactory.GetEn(dtl.enName);
          en.setPKVal(id);
          await en.RetrieveFromDBSources();
          await en.Delete();
          await reloadDtlRows(dtl);
          message.success('删除成功');
        } catch (e: any) {
          console.error(e);
          message.error(e?.toString?.() || '删除失败');
        }
      },
    });
  };

  // 仅刷新某个子表的数据（保留列定义）
  const reloadDtlRows = async (dtl: DtlDef) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', dtl.enName);
    handler.AddPara('PageIdx', 1);
    handler.AddPara('PageSize', 200);
    // 使用 UserRegedit 的 Vals 查询条件（已在 ur 内）
    // 后端 Search_SearchIt 会读取用户条件，无需额外拼接
    const data = await handler.DoMethodReturnJson<Recordable>('Search_SearchIt');
    const rows = (data && (data as any).DT) || [];
    dtl.rows = rows;
  };
  const loadDtl = async (comp: any): Promise<DtlDef | null> => {
    const pkFieldName = props.entity.PK;
    const url = comp.compSrc + '&PKVal=' + props.mainTableRow[pkFieldName];
    const params = getAllRequestParams(url);
    const enName = params['EnName'];
    if (!enName) return null;
    // 获取从表实体，用于列元数据
    const ens = await ClassFactory.GetEns(enName);
    await ens.Init();
    const en = ens.GetNewEntity;
    const pk = en.PK;
    const attrs = en._enMap?.attrs || [];
    const pTable = en._enMap?.PhysicsTable || '';
    const allowMove = params['IsMove'] == 1; // 非严格等于，兼容字符串
    const hasIdx = !!attrs.find((a: any) => a.Key === 'Idx');
    const allowSort = allowMove && hasIdx;
    if (allowMove && !hasIdx) console.warn('当前子表配置了排序功能，但缺少 Idx 字段，排序将不会生效。', { enName });

    // 使用与 DtlSearch 一致的 UserRegedit 与查询条件
    const { getQueryArgs } = useDtlQueryCondition();
    const ur = new UserRegedit();
    const urMyPK = WebUser.No + '_' + enName + '_SearchAttrs';
    ur.setPKVal(urMyPK);
    const code = await ur.RetrieveFromDBSources();
    if (code == 0) {
      await resetUserRegedit(ur as any, urMyPK, WebUser.No, enName);
    }
    ur.Vals = '';
    const queryArgs = getQueryArgs(params, {}, en);
    for (let i = 0; i < queryArgs.length; i += 2) {
      ur.Vals += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    const { enable, key } = en.LogicDelConfig;
    if (enable && key) ur.Vals += `@${key}=0`;

    // 获取需要排序的列并设置默认排序
    const sortColumnsStr = (params['SortColumns'] || '').toString().trim();
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

    await ur.Update();

    // 加载数据：WF_Comm.Search_SearchIt，取大页码
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', enName);
    handler.AddPara('PageIdx', 1);
    handler.AddPara('PageSize', 200);
    const data = await handler.DoMethodReturnJson<Recordable>('Search_SearchIt');
    const rows = (data && (data as any).DT) || [];

    // 检查是否启用前端排序
    const enableSorter = params['EnableSorter'] == 1; // 非严格等于，兼容字符串
    // 先构造 dtl 对象，再用其生成列，确保渲染闭包引用的是相同对象
    const dtl: DtlDef = {
      key: comp.key,
      name: comp.name || '',
      enName,
      columns: [],
      rows,
      pk,
      pTable,
      allowSort,
      hisUAC: en?.HisUAC || {},
      params,
      ur,
      entityWG: null,
    } as DtlDef;
    // 加载外挂定义（WGEntity_*）用于扩展行按钮
    try {
      const wgName = 'WGEntity_' + enName.substring(enName.lastIndexOf('.') + 1);
      dtl.entityWG = await ClassFactoryOfWaiGuaEntity.GetEn(wgName);
    } catch (e) {
      dtl.entityWG = null;
    }
    const pHandler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    pHandler.AddPara('EnName', enName);
    const pData = await pHandler.DoMethodReturnString('Entity_DBRoleMethods');
    dtl.columns = buildColumns(dtl, attrs, pk, enName, allowSort, sortColumnsArray, enableSorter, pData);
    return dtl;
  };

  // 拖拽初始化
  const dtlRefs = reactive<Record<string, HTMLElement | undefined>>({});
  const sortableMap = new Map<string, any>();
  const setDtlRef = (key: string, el?: HTMLElement) => {
    dtlRefs[key] = el;
  };

  const initSortableFor = (dtl: DtlDef) => {
    if (!dtl.allowSort) return;
    const el = dtlRefs[dtl.key];
    if (!el) return;
    const tbodyEl = el.querySelector('.n-data-table-tbody');
    if (!tbodyEl) return;
    // 动态 import，避免首次无依赖
    import('sortablejs').then(({ default: Sortable }) => {
      const instance = new Sortable(tbodyEl as HTMLElement, {
        animation: 150,
        dataIdAttr: 'data-row-id',
        handle: '.table-drag-icon',
        onEnd: async () => {
          const ids = (instance as any).toArray?.() || [];
          if (!ids || ids.length < 2) return;
          // 本地重排
          const keyField = dtl.pk;
          const map = new Map<string, any>();
          dtl.rows.forEach((r) => map.set(String(r[keyField]), r));
          const newRows = ids.map((id: string) => map.get(String(id))).filter(Boolean);
          dtl.rows = newRows;
          // 持久化（通用 List_Move）
          try {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
            handler.AddPara('MyPKs', ids.join(','));
            if (dtl.pTable) handler.AddPara('PTable', dtl.pTable);
            handler.AddPara('PKField', dtl.pk);
            await handler.DoMethodReturnString('List_Move');
          } catch (_e) {
            // 忽略失败，不打断交互
          }
        },
      });
      sortableMap.set(dtl.key, instance);
    });
  };

  onUnmounted(() => {
    sortableMap.forEach((ins) => {
      try {
        ins?.destroy?.();
      } catch (_) {}
    });
    sortableMap.clear();
  });

  onMounted(async () => {
    // 解析实体中声明的从表组件
    const groups = props.entity?._enMap?.attrs?.groups || [];
    const comps = groups.filter((g: any) => g.type === 'component');
    const list: DtlDef[] = [];
    for (const comp of comps) {
      const def = await loadDtl(comp);
      if (def) list.push(def);
    }
    dtlList.value = list;
    await nextTick();
    // 初始化每个从表的拖拽
    dtlList.value.forEach((d) => initSortableFor(d as DtlDef));
  });

  // 暴露给模板使用（通过直接在模板中调用 setDtlRef）
</script>

<style scoped>
  .simple-subtable {
    padding: 0px 8px;
  }
  .dtl-block + .dtl-block {
    margin-top: 12px;
  }
  .dtl-block {
    background: #ffffff;
    border: 1px solid #e9edf5;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    overflow: hidden;
    border-left: 4px solid #1677ff33;
  }
  /* 子表头配色，区别于主表 */
  :deep(.n-data-table thead th) {
    background-color: #f6f8ff !important;
    color: #344767;
    font-weight: 600;
    border-bottom: 1px solid #e6eaf7 !important;
    text-align: center;
  }
  /* Naive-UI 表头标题容器为 flex，强制居中 */
  :deep(.n-data-table .n-data-table-th .n-data-table-th__title) {
    justify-content: center !important;
  }
  :deep(.n-data-table .n-data-table-th .n-data-table-th__title-wrapper) {
    display: flex !important;
    justify-content: center !important;
  }
  /* 行配色与斑马纹，弱化边界更轻盈 */
  :deep(.n-data-table tbody td) {
    background: #ffffff;
    border-bottom: 1px solid #f1f3f8;
  }
  :deep(.n-data-table tbody tr:nth-child(odd) td) {
    background: #fafcff;
  }
  /* 让操作列更紧凑 */
  :deep(.n-data-table td:last-child) {
    text-align: center;
    white-space: nowrap;
  }
  .dtl-header {
    font-weight: 600;
    margin: 8px 0;
  }
  .dtl-title {
    color: #333;
  }
  .empty {
    padding: 12px;
    color: #999;
  }
  /* 拖拽把手样式 */
  :deep(.table-drag-icon) {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    user-select: none;
  }
  :deep(tr:hover .table-drag-icon) {
    color: #3b82f6;
  }
</style>
