<template>
  <BaseComponent ref="baseComponent" :close-drawer-func="handlePageUpdate" :close-modal-func="fetchTableData" :update-func="handlePageUpdate">
    <Spin :spinning="loading">
      <NConfigProvider :theme-overrides="GlobalThemeOverrides">
        <ThemeWrapper>
          <div class="p-4 wrapper">
            <div v-if="errorObj.hasError" class="ant-tag-red">
              {{ errorObj.tips }}
            </div>
            <div v-else-if="enInst" style="height: 100%">
              <div class="tree-ens-main">
                <div class="tree-panel" :style="sidebarStyle">
                  <!-- 模板流程 -->
                  <div class="tel_flow">
                    <NInput v-model:value="treeFilterPattern" :placeholder="'关键字'" style="height: 30px; width: 100%; margin-left: 0" />
                    <div class="page-title" style="font-size: 16px; font-weight: 500; flex-shrink: 0">{{ enInst.PageTitle }}</div>
                  </div>
                  <template v-if="treeData">
                    <n-tree
                      v-if="isLazy == false"
                      :show-irrelevant-nodes="false"
                      :node-props="nodeProps"
                      :default-expanded-keys="defaultExpandedKeys"
                      style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
                      :filter="treeFilterAction"
                      :pattern="treeFilterPattern"
                      :virtual-scroll="true"
                      :data="treeData"
                      :selected-keys="treeSelectedKeys"
                      :on-update:expanded-keys="updatePrefix"
                      block-line
                    />
                    <n-tree
                      v-else
                      :node-props="nodeProps"
                      :show-irrelevant-nodes="false"
                      :default-expanded-keys="defaultExpandedKeys"
                      style="margin-top: 12px; height: calc(100% - 50px); min-width: 200px"
                      :filter="treeFilterAction"
                      :pattern="treeFilterPattern"
                      :data="treeData"
                      :selected-keys="treeSelectedKeys"
                      :on-update:expanded-keys="updatePrefix"
                      :on-load="handleLoad"
                      block-line
                    />
                  </template>
                  <NDropdown
                    trigger="manual"
                    placement="bottom-start"
                    :show="showDropdownRef"
                    :options="optionsRef"
                    :x="xRef"
                    :y="yRef"
                    @select="handleSelect"
                    @clickoutside="handleClickOutside"
                  />
                </div>
                <!--
                //收缩按钮
                <div class="collapse_btn">
                  <div class="btn_container" @click="sidebarVisible = !sidebarVisible"><left-outlined :style="arrowStyle" /> </div>
                </div> -->
                <div class="ens-panel p-4" ref="TreeEnsRef" :style="contentStyle">
                  <div class="table-toolbar">
                    <InputGroup compact class="search-box">
                      <Select v-model:value="searchMode">
                        <SelectOption value="global">{{ '全局搜索' }}</SelectOption>
                        <SelectOption value="current">{{ '当前搜索' }}</SelectOption>
                      </Select>
                      <InputSearch v-model:value="tableQueryKeyword" :placeholder="'请输入关键字'" style="width: 100%" :enter-button="'搜索'" @search="queryTable" />
                    </InputGroup>
                    <div class="table-toolbar-btn-list" :style="searchFieldsStyle">
                      <!-- 新建流程  导入流程 -->
                      <!-- <AButton
                        v-for="tableButton in tableButtonsRef"
                        :key="tableButton"
                        type="primary"
                        shape="round"
                        style="margin-left: 8px"
                        :danger=""tableButton.includes('删除')""
                        @click="treeEnsClickEventHandler(tableButton, currentActiveKey, checkedRowKeysRef.join(','), currentActiveOrgNo)"
                      >
                        <span v-if="tableButton.includes('新建')">
                          <FolderOpenOutlined />
                          {{ tableButton }}
                        </span>
                        <span v-else-if="tableButton.includes('目录属性')">
                          <FileSearchOutlined />
                          {{ tableButton }}
                        </span>
                        <span v-else-if="tableButton.includes('导入')">
                          <UploadOutlined />
                          {{ tableButton }}
                        </span>
                        <span v-else-if="tableButton.includes('组织管理')">
                          <i class="icon-organization"></i>
                          {{ tableButton }}
                        </span>
                        <span v-else-if="tableButton.includes('删除')">
                          <CloseCircleOutlined />
                          {{ tableButton }}
                        </span>
                        <span v-else>
                          <i class="icon-doc"></i>
                          {{ tableButton }}
                        </span>
                      </AButton> -->

                      <!-- 视频教程 -->
                      <!-- <AButton
                        type="primary"
                        shape="round"
                        v-for="(tButton, index) in topButtonsRef"
                        :style="{ marginLeft: index === topButtonsRef.length - 1 ? '20px' : '8px' }"
                        :key="tButton"
                        @click="treeEnsClickEventHandler(tButton, '', '')"
                        >{{ tButton }}</AButton
                      > -->
                    </div>
                  </div>
                  <VantList
                    style="height: 100%; overflow-y: auto; background-color: #f2f5f7"
                    v-model:loading="loading"
                    v-model:error="error"
                    :error-text="'请求失败，点击重新加载'"
                    :offset="100"
                    :finished="finished"
                  >
                    <template v-if="Array.isArray(dataSource) && dataSource.length == 0">
                      <div class="null-val">{{ '无数据' }}</div>
                    </template>
                    <div v-for="(item, index) in dataSource" class="card-item" center :key="item.OID" clickable>
                      <div class="title">
                        <span style="flex: 4">{{ getTitle(item) }}</span>
                      </div>
                      <div class="body">
                        <div class="row" v-for="col in columns" :key="col?.key">
                          <span class="row-label">{{ col?.title }}</span
                          ><span class="row-val">{{ getText(item, col?.key) }}</span></div
                        >
                      </div>
                    </div>
                  </VantList>
                </div>
              </div>
            </div>
          </div>
        </ThemeWrapper>
      </NConfigProvider>
    </Spin>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref, h, shallowRef, unref, computed, onUnmounted } from 'vue';
  import { message, InputGroup, Select, SelectOption, InputSearch, Spin, Button as AButton, Tooltip, Dropdown, Menu, MenuItem } from 'ant-design-vue';
  import {
    FolderOpenOutlined,
    FileOutlined,
    LeftOutlined,
    UploadOutlined,
    CloseCircleOutlined,
    FileSearchOutlined,
    ColumnHeightOutlined,
    MenuOutlined,
  } from '@ant-design/icons-vue';
  import { NTree, NInput, NDataTable, TreeOption, NConfigProvider, DataTableColumns, DataTableRowKey, DropdownOption, NDropdown, NIcon, NAvatar, NSwitch } from 'naive-ui';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { CellGroup as VantCellGroup, CheckboxGroup as VantCheckGroup, Checkbox as VantCheckbox, List as VantList } from 'vant';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { useRoute } from 'vue-router';
  import { ClassFactoryOfPageBaseTreeEns } from '/@/WF/Comm/UIEntity/ClassFactoryOfPageBaseTreeEns';
  import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { router } from '/@/router';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { EntitiesNoName } from '/@/bp/en/EntityNoName';
  import { Folder, FolderOpenOutline } from '@vicons/ionicons5';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import Sortable from 'sortablejs';
  import WebUser from '/@/bp/web/WebUser';
  import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
  import { debounce } from 'lodash-es';
  import { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import { FlowAdm } from '/@/WF/TSClass/Admin/FlowAdm';
  // 基础能力容器，处理弹窗，抽屉等
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const route = useRoute();

  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const enInst = ref<PageBaseTreeEns>();
  const treeData = ref<TreeOption[]>();
  const treeSelectedKeys = ref<string[]>([]);
  //默认展开的节点
  const defaultExpandedKeys = ref<string[]>([]);
  const expandedRowKeys = ref<string[]>([]);
  //是否异步加载
  const isLazy = ref(false);
  // 树查询变量
  const treeFilterPattern = ref('');
  // 允许拖动
  // const enableDrop = ref(true);
  // 树右键菜单
  const showDropdownRef = ref(false);

  //TreeEns列表状态参数
  //start
  const simpleColumns = ref<{ key: any; title: string }[]>([]);
  const error = ref(false);
  const finished = ref(false);
  //end

  //下拉菜单添加icon
  const renderIcon = (icon: String) => {
    return () =>
      h(NIcon, {
        class: icon,
      });
  };
  const optionsRef = ref<DropdownOption[]>([
    {
      label: '新建同级',
      key: 'create-same-level',
      icon: renderIcon('icon-plus'),
    },
    {
      label: '新建下级',
      key: 'create-sub-level',
      icon: renderIcon('icon-organization'),
    },
    {
      label: '节点属性',
      key: 'node-info',
      icon: renderIcon('icon-star'),
    },
    {
      label: '删除节点',
      key: 'delete-node',
      icon: renderIcon('icon-close'),
    },
    {
      label: '修改名称',
      key: 'change-node',
      icon: renderIcon('icon-pencil'),
    },
  ]);
  const xRef = ref(0);
  const yRef = ref(0);
  const treeFilterAction = (keyword: string, node: any) => {
    if (keyword.trim() === '') return true;
    return node.Name.includes(keyword);
  };
  // 处理左侧菜单显示隐藏
  const sidebarVisible = ref(true);
  const sidebarStyle = computed(() => {
    return {
      border: '5px solid #f2f5f7',
      padding: sidebarVisible.value ? '1rem' : 0,
    };
  });
  const arrowStyle = computed(() => {
    return {
      transition: 'all ease 0.3s',
      transform: `rotate(${sidebarVisible.value ? 0 : 180}deg)`,
    };
  });
  const contentStyle = computed(() => {
    return {
      width: '100%',
    };
  });
  // 处理右键菜单事件
  let activeTreeNode: any = null;
  let activeTreeItemId: any = null;
  const handleSelect = async (evtName: string) => {
    switch (evtName) {
      case 'create-same-level':
        await enInst.value?.Node_CreateSameLevelNode(activeTreeNode.No, activeTreeNode);
        await enInst?.value?.Init();
        renderTree(enInst.value as PageBaseTreeEns);
        break;
      case 'create-sub-level':
        await enInst.value?.Node_CreateChildNode(activeTreeNode.No);
        await enInst?.value?.Init();
        renderTree(enInst.value as PageBaseTreeEns);
        break;
      case 'node-info':
        const res = await enInst.value?.Node_Edit(activeTreeNode.No);
        if (!res) {
          message.error('操作失败');
          return;
        }
        baseComponent.value?.handleGPNCallback(res);
        break;
      case 'delete-node':
        const deleteRes = await enInst.value?.Node_Delete(activeTreeNode.No, activeTreeNode);
        if (!deleteRes) {
          message.error('操作失败');
          return;
        }
        baseComponent.value?.handleGPNCallback(deleteRes);
        await enInst?.value?.Init();
        renderTree(enInst.value as PageBaseTreeEns);
        break;
      case 'change-node':
        await enInst.value?.Node_ChangeNodeName(activeTreeNode.No, activeTreeNode.Name);
        await enInst?.value?.Init();
        renderTree(enInst.value as PageBaseTreeEns);
        break;
    }
    activeTreeNode = null;
    showDropdownRef.value = false;
  };
  const handleClickOutside = () => {
    showDropdownRef.value = false;
  };
  // 树节点事件
  const currentActiveKey = ref('');
  //SAAS模式组织编号
  const currentActiveOrgNo = ref('');
  const updatePrefix = (
    _keys: Array<string | number>,
    _option: Array<TreeOption | null>,
    meta: {
      node: TreeOption | null;
      action: 'expand' | 'collapse' | 'filter';
    },
  ) => {
    if (!meta.node) return;
    if (meta.node.Icon) {
      meta.node.prefix = () =>
        h(
          'i',
          {
            class: meta.node?.Icon,
          },
          '',
        );
      return;
    }
    switch (meta.action) {
      case 'expand':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(FolderOpenOutline),
          });
        break;
      case 'collapse':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(Folder),
          });
        break;
    }
  };

  const nodeProps = ({ option }: { option: TreeOption }) => {
    return {
      onClick: async () => {
        currentActiveOrgNo.value = option.OrgNo as string;
        currentActiveKey.value = option.key as string;
        treeSelectedKeys.value = [option.key as string];
        inSearchMode = false; // 关闭查找模式
        await fetchTableData();
        expandedRowKeys.value = [];
      },
      onmouseenter: debounce(() => {
        activeTreeItemId = option.key;
      }, 50),
      onmouseleave: () => {
        activeTreeItemId = null;
      },
      onContextmenu(e: MouseEvent): void {
        if (EnableContextMenu.value) {
          activeTreeNode = option;
          e.preventDefault();
          showDropdownRef.value = false;
          nextTick().then(() => {
            showDropdownRef.value = true;
            xRef.value = e.clientX;
            yRef.value = e.clientY;
          });
        }
      },
    };
  };
  // 树 end
  // 表格
  const paginationReactive = reactive({
    page: 1,
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [10, 15, 20],
    onChange: (page: number) => {
      paginationReactive.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
    },
  });
  // 表格列
  const columns = ref<DataTableColumns<RowData>>([]);
  // 表格数据源
  const dataSource = ref<Recordable[]>([]);
  // 原始数据源，处理节点内搜索
  const originDataSource = ref<Recordable[]>([]);
  // 选择的列主键集合
  const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys;
  };
  const rowPK = ref('');
  // 行定义
  const rowProps = (row: RowData) => {
    if (!Array.isArray(row.children)) {
      return {
        style: 'cursor: pointer; user-select: none',
        'data-row-id': row.No,
        ondblclick: () => {
          treeEnsClickEventHandler('双击行', currentActiveKey.value, row[rowPK.value], '', row);
          //  if (uac.IsUpdate) {
          //  treeEnsClickEventHandler('双击行', currentActiveKey.value, row[rowPK.value], '', row);
          //} else {
          // message.warn('您没有操作权限');
          // }
        },
      } as any;
    } else {
      return {
        id: row.Index,
        onClick: () => {
          const val = row[rowPK.value];
          if (expandedRowKeys.value.includes(val)) {
            expandedRowKeys.value = expandedRowKeys.value.filter((key) => key != val);
          } else {
            expandedRowKeys.value.push(val);
          }
        },
      } as any;
    }
  };
  type ColumnSize = 'small' | 'medium' | 'large';
  const columnSize = ref<ColumnSize>('large');
  const updateSize = ({ key }: MenuInfo) => {
    columnSize.value = key as ColumnSize;
  };
  // 表格end

  // 页面相关逻辑
  // 用户权限控制
  let uac: UAC = new UAC();
  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string);
  const updateTitle = (title: string) => {
    const tabStore = useMultipleTabStore();
    const currentTab = tabStore.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    //在你需要修改的地方类似下面这样
    if (currentTab?.meta?.title) {
      currentTab.meta.title = title;
      document.title = title;
    }
  };

  // 获取左侧树结构
  const { listToTree } = useTreeConvert();
  // 获取权限
  const getUAC = async (entities: EntitiesNoName | null) => {
    if (!entities) {
      uac = new UAC();
      uac.OpenForSysAdmin();
      return;
    }
    const entity = entities?.GetNewEntity;
    if (!entity) {
      message.error('获取实体失败');
      return;
    }
    await entity.Init();
    uac = entity.HisUAC;
  };

  const topButtonsRef = ref<string[]>([]);
  const tableButtonsRef = ref<string[]>([]);
  // 渲染头部按钮
  const renderToolbar = (entity: PageBaseTreeEns) => {
    const topButtons = entity.BtnsOfToolbar?.split(',').filter((item) => item !== '');
    if (Array.isArray(topButtons) && topButtons.length > 0) {
      topButtonsRef.value = topButtons;
    }

    const tableButtons = entity.BtnsOfTableTop?.split(',').filter((item) => item !== '');
    if (Array.isArray(tableButtons) && tableButtons.length > 0) {
      tableButtonsRef.value = tableButtons;
    }
  };
  const tableItemInDragStatus = ref(false);
  // 渲染树
  const renderTree = (entity: PageBaseTreeEns) => {
    const treeEns = entity.TreeEns?.map((item): Recordable => {
      const row = Object.fromEntries(item.Row);
      if (isLazy.value === true) {
        return {
          ...row,
          key: item.No,
          label: item.Name,
          isLeaf: false,
        };
      }
      return {
        ...row,
        key: item.No,
        label: item.Name,
      };
    });

    treeEns?.forEach((tEns) => {
      if (!!tEns.Icon) {
        tEns.prefix = () =>
          h(
            'i',
            {
              class: tEns.Icon,
            },
            '',
          );
      } else if (treeEns.filter((t) => t.ParentNo === tEns.No).length > 0) {
        tEns.prefix = () =>
          h(NIcon, null, {
            default: () => h(FolderOpenOutline),
          });
      } else {
        tEns.prefix = () =>
          h(NIcon, null, {
            default: () => h(FileOutlined),
          });
      }
    });

    // treeEns?.forEach((te) => {
    //   te.suffix = () =>
    //     h(
    //       NIcon,
    //       {
    //         style: {
    //           width: '20px',
    //           opacity: activeTreeItemId == te.key ? '1' : '0',
    //         },
    //         onclick: (e) => {
    //           activeTreeNode = te;
    //           e.preventDefault();
    //           showDropdownRef.value = false;
    //           nextTick().then(() => {
    //             showDropdownRef.value = true;
    //             xRef.value = e.clientX;
    //             yRef.value = e.clientY;
    //           });
    //         },
    //       },
    //       { default: () => h(MenuOutlined) },
    //     );
    // });
    treeData.value = listToTree(entity.RootNo || '0', treeEns || [], true);
    defaultExpandedKeys.value.push(entity.RootNo || '0');
  };
  //过滤admin数组
  const ensData = ref();
  // 渲染记录操作按钮
  const renderTableRowActions = (row) => {
    let rowActionBtnList = enInst.value?.BtnsOfItemOptions?.split(',').filter((btnName) => btnName.length > 0);
    if (!Array.isArray(rowActionBtnList)) {
      return h(
        'span',
        {
          style: {
            color: '#ff5555',
          },
        },
        '无权限',
      );
    }
    // 处理权限
    if (!uac.IsUpdate) {
      rowActionBtnList = rowActionBtnList.filter((action) => !action.includes('编辑'));
    }
    if (!uac.IsDelete) {
      rowActionBtnList = rowActionBtnList.filter((action) => !action.includes('删除'));
    }
    if (rowActionBtnList.length > 0) {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        rowActionBtnList.map((btn) => {
          return h(
            'span',
            {
              style: {
                marginLeft: '12px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#1890ff',
              },
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                treeEnsClickEventHandler(btn, currentActiveKey.value, row.No, '', row);
              },
            },
            {
              default: () => btn,
            },
          );
        }),
      );
    } else
      return h(
        'span',
        {
          style: {
            color: '#ff5555',
          },
        },
        '无权限',
      );
  };
  const fetchTableData = async () => {
    try {
      loading.value = true;
      dataSource.value = [];
      originDataSource.value = [];
      const ens = await enInst.value?.GetDataByTreeNodeID(currentActiveKey.value);
      //分组表格过滤admin
      if (WebUser.IsAdmin && WebUser.No == 'admin') {
        ensData.value = ens?.filter((item) => item.Row.No != 'admin');
      } else {
        ensData.value = ens;
      }
      const rows = ensData.value?.map((en) => {
        if (en.hasOwnProperty('classID')) {
          const row = Object.fromEntries(en.Row);
          return {
            ...row,
            key: row.No,
          };
        }
        return {
          ...en.Row,
          key: en.Row.No,
        };
      });
      console.log({ rows });
      if (Array.isArray(rows) && rows.length > 0) {
        originDataSource.value = rows;
        dataSource.value = rows;
        // if (dtlEnsGroupFields.value.length == 0) dataSource.value = rows;
        // else {
        //   //获取分组的集合
        //   const map = new Map();
        //   rows.forEach((item, _index, arr) => {
        //     if (!map.has(item[defaultGroupField.value])) {
        //       map.set(
        //         item[defaultGroupField.value],
        //         arr.filter((a) => a[defaultGroupField.value] == item[defaultGroupField.value]),
        //       );
        //     }
        //   });
        //   const data = Array.from(map).map((item) => [...item[1]]);
        //   let dataItem: Record<string, any> = {};
        //   let treeKey = 'No';
        //   if (Array.isArray(columns.value) && columns.value.length >= 2) {
        //     treeKey = columns.value[1]?.['key'];
        //   }
        //   data.forEach((item, _index) => {
        //     dataItem = {};
        //     dataItem[treeKey] = item[0][defaultGroupField.value] || '无';
        //     dataItem['key'] = item[0][defaultGroupField.value] || '无';
        //     dataItem['No'] = item[0][defaultGroupField.value] || '无';
        //     //部分TreeEns_xxx.ts使用的MyPK作为rowkey字段
        //     dataItem['MyPK'] = item[0][defaultGroupField.value] || '无';
        //     dataItem['isLeaf'] = false;
        //     item.forEach((obj) => {
        //       obj.key = obj.No;
        //     });
        //     dataItem['children'] = item;
        //     dataItem['Index'] = item[0]?.Idx || 0;
        //     dataSource.value.push(dataItem as never);
        //   });
        //   dataSource.value = dataSource.value.sort((a, b) => a.Index - b.Index);
        // }
        //表格拖拽
        if (allowMove.value) {
          await initSortable();
        }
      }
      if (dataSource.value.length >= 0) {
        finished.value = true;
      }
      handleTreeData(dataSource.value);
    } catch (e: any) {
      error.value = true;
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  /**
   * 改变分组
   * @param field 分组字段
   * @constructor
   */
  const ChageGroupField = (column) => {
    defaultGroupField.value = column.key;
    columns.value = [];
    dataSource.value = [];
    fetchTableData();
    renderTable(enInst.value!);
  };
  /**
   * 独立启动修改为开关启动
   * @param entity
   */
  const handleSwitch = async (column) => {
    const flow = new FlowAdm(column.No);
    await flow.RetrieveFromDBSources();
    if (!!parseInt(column.IsCanStart)) {
      flow.IsCanStart = 0;
    } else {
      flow.IsCanStart = 1;
    }
    await flow.Update();
    columns.value = [];
    dataSource.value = [];
    await fetchTableData();
    renderTable(enInst.value!);
  };
  // 渲染表格
  const renderTable = (entity: PageBaseTreeEns) => {
    // const treeEnsColumns: DataTableColumns = entity.Columns.filter((column) => !!column.IsShow).map((col) => {
    const treeEnsColumns: DataTableColumns<RowData> = entity.Columns.filter((col) => col.IsShow != false && col.IsShowMobile !== false).map((col) => {
      const column: any = {
        title: col.name,
        key: col.id,
        align: 'left',
        width: col.width,
        resizable: true,
        render: (row) => (dtlEnsGroupFields.value.length === 0 ? h('div', { style: { fontSize: '12px' } }, row[col.id]) : h('span', { style: { fontSize: '12px' } }, row[col.id])),
      };
      // 为什么不根据类型判断要根据id判断？
      if (col.id === 'Name') {
        column.render = (row) => {
          return h(
            'span',
            {
              style: {
                color: 'blue',
                fontSize: '14px',
              },
              onClick: () => {
                if (uac.IsUpdate && typeof row.children === 'undefined') {
                  let val = row.No;
                  if (!val) val = row.MyPK;
                  if (!val) val = row.NodeID;
                  if (!val) val = row.WorkID;
                  if (!val) val = row.OID;
                  treeEnsClickEventHandler('双击行', currentActiveKey.value, val, '', row);
                } else {
                  message.warn('您没有操作权限');
                }
              },
            },
            row.Name,
          );
        };
      }
      if (col.id === 'StationName') {
        column.title = (row) => {
          return h(
            'div',
            {
              style: {
                color: 'blue',
                fontSize: '14px',
              },
              onClick: () => {
                ChageGroupField(row);
              },
            },
            { default: () => '岗位名称' },
          );
        };
      }
      if (col.id === 'EmpSta') {
        column.render = (row) => {
          return h(
            'div',
            {
              style: {
                fontSize: '12px',
              },
            },
            row.EmpSta === 0 ? '正常' : '禁止',
          );
        };
      }
      if (col.id === 'IsCanStart') {
        column.render = (row) => {
          return h(
            NSwitch,
            {
              value: parseInt(row.IsCanStart) ? true : false,
              onUpdateValue: () => {
                handleSwitch(row);
              },
            },
            // parseInt(row.IsCanStart) === 0 ? '否' : '是',
          );
        };
      }
      if (col.id === 'Ver') {
        column.render = (row) => {
          return h(
            'div',
            {
              style: {
                fontSize: '12px',
              },
            },
            row.Ver,
          );
        };
      }
      if (col.id === 'EmpAvatar') {
        //头像
        column.render = (row) => {
          // console.log(row.EmpAvatar);
          if (row?.EmpAvatar?.endsWith('.png')) {
            return h(NAvatar, {
              src: row.EmpAvatar,
              size: 'medium',
              fallbackSrc: DefaultUserIcon,
              style: {
                borderRadius: '50%',
                backgroundColor: 'transparent',
                marginTop: '8px',
              },
            });
          } else {
            return h(
              'span',
              {
                style: {
                  fontSize: '12px',
                },
              },
              row.EmpAvatar,
            );
          }
        };
      }
      return column;
    });
    columns.value = [
      {
        type: 'selection',
        fixed: 'left',
        align: 'center',
      },
      ...treeEnsColumns.filter((item: RowData) => item.key != defaultGroupField.value),
      // {
      //   title: '操作',
      //   key: 'actions',
      //   align: 'center',
      //   width: 200,
      //   render(row) {
      //     return renderTableRowActions(row);
      //   },
      // },
    ];
  };
  // TreeEns 点击事件交互
  const treeEnsClickEventHandler = async (btnName: string, selectedTreeNo: string, targetIds: string, selectedTreeOrgNo = '', record: Nullable<RowData> = null) => {
    const res = await enInst.value?.BtnClick(
      btnName.includes('设置') ? '双击行' : btnName,
      searchMode.value === 'global' ? '' : selectedTreeNo,
      targetIds,
      selectedTreeOrgNo,
      record,
    );
    baseComponent.value?.handleGPNCallback(res);
  };
  // table 搜索
  type SearchMode = 'global' | 'current';
  const tableQueryKeyword = ref<string>('');
  let inSearchMode = false;
  const searchMode = ref<SearchMode>('current');
  const dtlEnsGroupFields = ref<string[]>([]); //分组集合
  const defaultGroupField = ref('');

  // 是否显示树结构表格
  const handleTreeData = (data: Recordable[]) => {
    if (!enInst.value) return;
    const rootNo = enInst.value.TableTreeRootNo;
    if (!rootNo) return;
    const treeMap = new Map();
    const tree: Recordable[] = [];
    const parentKey = 'ParentNo';
    for (const item of data) {
      treeMap[item['No']] = item;
    }
    for (const item of data) {
      const _parent_id = item[parentKey];
      if (item['No'] == rootNo) {
        tree.push(item);
      } else {
        const parentNode = treeMap[_parent_id];
        if (parentNode) {
          if (parentNode.children) parentNode.children.push(item);
          else parentNode.children = [item];
        }
      }
    }
    dataSource.value = tree;
  };

  const queryTable = async () => {
    try {
//      debugger;
      loading.value = true;
      console.log(12312321);
      inSearchMode = true; // 打开查找模式
      dataSource.value = [];
      const mode = unref(searchMode);
      const keyword = unref(tableQueryKeyword);
      let ens: Recordable[] = [];
      if (mode === 'global') {
        ens = (await enInst.value?.SearchKeyWord(keyword)) as EntitiesNoName;
        const rows = ens?.map((en) => {
          const row = Object.fromEntries(en.Row);
          return {
            ...row,
            key: row.No,
          };
        });
        if (Array.isArray(rows) && rows.length > 0) {
          dataSource.value = rows;
        }
      } else if (mode === 'current') {
        if (keyword.trim() === '') {
          dataSource.value = originDataSource.value;
          return;
        }
        //当前搜索
        dataSource.value = originDataSource.value.filter(
          (item) =>
            item?.Name?.includes(keyword) ||
            item?.No?.includes(keyword) ||
            item?.BatchName?.includes(keyword) ||
            item?.BatchNo?.includes(keyword) ||
            item?.FrmName?.includes(keyword),
        );
      }
      if (dataSource.value.length >= 0) {
        finished.value = true;
      }
      // 如果父节点字段不为空，并且rootNo有值，则是一个树结构表格数据
      handleTreeData(dataSource.value);
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  //TreeEns流程拖拽排序
  let sortablejsRef: Nullable<Sortable> = null;
  const TreeEnsRef = shallowRef<HTMLElement>();

  // 初始化拖动事件
  const initSortable = async () => {
    setTimeout(async () => {
      const tbodyEl: any = document.querySelector('.n-data-table-tbody');
      if (!tbodyEl) {
        console.error('拖动功能初始化失败');
        return;
      }
      // 允许跨分组
      // Array.from(document.querySelectorAll('.drop-area')).forEach((element: HTMLElement) => {
      //   console.log({ element });
      //   const sortableInst = new Sortable(element, {
      //     animation: 150,
      //     group: 'drop-items',
      //     onAdd(event) {
      //       console.log(event);
      //     },
      //     onChange(evt) {
      //       console.log(evt);
      //     },
      //   });
      //   console.log({ sortableInst });
      // });
      sortablejsRef = new Sortable(tbodyEl, {
        animation: 150,
        dataIdAttr: 'data-row-id',
        group: 'drop-items',
        onStart: (_ev) => {
          tableItemInDragStatus.value = true;
        },
        onEnd: async (ev) => {
          console.log({ ev });
          tableItemInDragStatus.value = false;
          // return;
          // const sortedList = sortablejsRef?.toArray();
          // console.log(sortedList);
          // var handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
          // handler.AddPara('SourceNos', sortedList); // 流程编号.
          // const enName = enInst?.value?.DtlEns?.GetNewEntity.classID;
          // console.log({ enName });
          // handler.AddPara('EnName', enName); // 流程编号.
          // handler.DoMethodReturnString('TreeEns_ItemsMove');
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

  onUnmounted(() => {
    removeAllSortablejs();
  });

  // 处理页面更新事件
  const handlePageUpdate = async () => {
    // 如果位于查找模式
    if (inSearchMode) {
      await queryTable();
    } else {
      await fetchTableData();
    }
    checkedRowKeysRef.value = [];
    InitPage();
  };

  const allowMove: any = ref(false);
  const EnableContextMenu: any = ref(true);
  const InitPage = async () => {
    try {
   //   debugger;
      loading.value = true;
      console.log(11111111);
      const entity = await ClassFactoryOfPageBaseTreeEns.GetEn(EnName);
      entity.SetParams(props.params);
      await entity.Init();
      allowMove.value = entity.IsEnMove;
      EnableContextMenu.value = entity?.EnableContextMenu;
      isLazy.value = entity.IsLazy;
      enInst.value = entity;
      const entityPKFieldName = entity.DtlEns?.GetNewEntity?.PK || 'OID';
      if (entityPKFieldName) {
        rowPK.value = entityPKFieldName;
      }
      //分组字段集合
      const dtlEnsGroupBy = enInst.value['DtlEnsGroupBy'] || '';
      dtlEnsGroupFields.value = dtlEnsGroupBy == '' ? [] : dtlEnsGroupBy.split(',');
      if (dtlEnsGroupFields.value.length > 0) defaultGroupField.value = dtlEnsGroupFields.value[0];
      renderTree(entity);
      if (!!treeData.value && treeData.value.length > 0) defaultExpandedKeys.value.push(treeData.value[0].No as string);
      await getUAC(entity.DtlEns!);
      renderTable(entity);
      updateTitle(entity.PageTitle as string);
      renderToolbar(entity);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const handleLoad = async (node: TreeOption) => {
    // if (!ready) return Promise.resolve([]);
    // const entity = ClassFactoryOfPageBaseTreeEns.GetEn(EnName);
    await enInst.value?.Init(node.key as string);
    const treeEns = enInst.value?.TreeEns?.map((item): Recordable => {
      const row = Object.fromEntries(item.Row);
      return {
        ...row,
        key: item.No,
        label: item.Name,
        isLeaf: false,
      };
    });
    node.children = treeEns;
  };

  // 控制查询条件展开/折叠
  const toggleConditions = ref(false);
  const searchFieldsStyle = computed(() => {
    return {
      flexWrap: toggleConditions.value ? 'wrap' : '',
      overflow: toggleConditions.value ? '' : 'hidden',
    };
  });

  const getTitle = (row) => {
    return row['Name'] || row['Title'] || row['FrmName'];
  };
  const getText = (row, key) => {
    return row[key + 'T'] || row[key + 'Text'] || row[key];
  };

  // const toggle = (index) => {
  //   console.log({ index });
  //   debugger;
  //   // checkboxRefs.value[index].toggle();
  // };
  // const totalConditions = computed(() => {
  //   console.log(tableButtonsRef.value);
  //   console.log(topButtonsRef.value);
  //   let conditionCount = 0;
  //   // return tableButtonsRef.value.length;
  //   return (conditionCount += [...tableButtonsRef.value, ...topButtonsRef.value].length);
  // });
  // end
  onMounted(async () => {
    await InitPage();
    const preDefineRootNo = treeData.value?.[0]?.key as string;
    // 没有节点则不选中
    if (!preDefineRootNo) {
      return;
    }
    currentActiveKey.value = preDefineRootNo;
    treeSelectedKeys.value = [preDefineRootNo];
    await fetchTableData();
  });
  // 页面相关逻辑 end
</script>

<style lang="less" scoped>
  :deep(.n-base-selection .n-base-selection--selected) {
    margin-top: -1px !important;
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease-out;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }

  .header {
    display: flex;
    box-sizing: border-box;
    padding: 12px 20px;
    background-color: white;
    border-bottom: 2px solid #f2f5f7;
    border-radius: 12px 12px 0 0;
    .top-btn-list {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;

      .top-btn {
        margin-left: 12px;
        color: #fff;
      }
    }
  }

  .wrapper {
    width: 100%;
    height: calc(100vh - 85px);
    padding-top: 46px;
    box-sizing: border-box;
  }

  //间距
  .p-4 {
    .tree-ens-main {
      // display: flex;
      // align-items: center;
      // justify-content: flex-start;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background-color: white;
      border-radius: 0 0 12px 12px;

      .tree-panel {
        // flex: 0.2;
        // min-width: 160px;
        // width: 240px;
        transition: all 0.4s ease;
        height: 100%;
        overflow-x: auto;
        overflow-y: scroll;
        box-sizing: border-box;
        max-height: 30vh;

        .tel_flow {
          width: 100%;
          // display: flex;
          // justify-content: space-between;
          // align-items: center;
          // margin: 20px 0;
          margin-bottom: 10px;
          // margin-top: 5px;
          .n-input {
            margin-left: 12px;
            //input统一高度
            height: 30px;
          }
        }
      }
      // 不提供源代码， 我们把打包后的文件，用iframe嵌入到ry， 待办在途 ， 抽屉=> 表单 iframe -> iframe vue2 路由强制转到index
      :deep(.v-vl-visible-items) {
        overflow-x: auto;
      }
      //滚动条高度设置
      :deep(.v-vl-visible-items::-webkit-scrollbar) {
        height: 10px;
      }
      :deep(.v-vl-visible-items::-moz-scrollbar) {
        height: 10px;
      }
      //节点文本过长添加滚动条
      :deep(.n-tree .n-tree-node-wrapper) {
        white-space: nowrap;
      }

      // .collapse_btn {
      //   height: 100%;
      //   width: 10px;
      //   background-color: #f2f5f7;
      //   display: flex;
      //   align-items: center;
      //   justify-content: center;

      //   .btn_container {
      //     display: flex;
      //     align-items: center;
      //     justify-content: center;
      //     width: 12px;
      //     height: 100px;
      //     cursor: pointer;

      //     &:hover {
      //       background-color: white;
      //       border-top-left-radius: 8px;
      //       border-bottom-left-radius: 8px;
      //     }
      //   }
      // }

      .ens-panel {
        // flex: 1;
        height: 70%;

        .table-toolbar {
          display: flex;
          // align-items: center;
          justify-content: space-between;
          // margin: 20px 0;
          margin-bottom: 10px;

          .search-box {
            display: flex;
            width: 100%;
            :deep(.ant-input) {
              height: 32px;
            }
          }

          .table-toolbar-btn-list {
            display: flex;
            flex: 2;
            flex-shrink: 0;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;

            //按钮大小边框统一
            .ant-btn-round {
              height: 30px;
              border-radius: 5px;
              margin-bottom: 5px;
            }

            .column-setting {
              font-size: 17px;
              margin: 0 10px 5px;
              display: flex;
              align-items: center;
            }
            .toggle-btn {
              font-size: 12px;
              color: #459dff;
              cursor: pointer;
            }
          }
        }
      }

      // :deep(.changeBlue:active) {
      //   color: #fafafa;
      // }
      :deep(.n-data-table-th__title) {
        font-size: 14px;
        color: #000000;

        :deep(.n-data-table-th__title-wrapper) {
          min-width: 100px;
        }
      }
    }
  }
  :deep(.n-data-table-tr:hover) {
    background-color: unset !important;
  }
  :deep(.n-data-table-table .n-data-table-tbody .n-data-table-tr) {
    &:hover > td {
      background-color: inherit !important;
    }
  }

  .null-val {
    text-align: center;
  }
  .card-item {
    background-color: white;
    padding: 6px;
    border-radius: 12px;
    // margin-bottom: 16px;
    margin: 16px 0.5rem;
    &:nth-child(1) {
      margin-top: 16px;
    }

    .title {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f2f5f7;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: bold;
      span {
        margin-left: 10px;
      }
    }
    .body {
      width: 100%;
      font-size: 13px;
      padding: 10px 12px;

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .row-label {
          color: #666;
        }
        .row-val {
          text-align: right;
        }
      }
      .row + .row {
        margin-top: 8px;
      }
    }
    .footer {
      border-top: 1px solid #f2f5f7;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #1989fa;
      padding: 12px;
      .func-list {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-left: 12px;
        direction: rtl;
      }
    }
  }
</style>
