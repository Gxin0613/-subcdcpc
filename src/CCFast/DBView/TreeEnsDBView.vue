<template>
  <BaseComponent ref="baseComponent">
    <Spin :spinning="loading">
      <NConfigProvider :theme-overrides="GlobalThemeOverrides">
        <ThemeWrapper>
          <div class="wrapper">
            <div v-if="errorObj.hasError" class="ant-tag-red">
              {{ errorObj.tips }}
            </div>
            <div v-else-if="treeData" style="height: 100%">
              <div class="tree-ens-main">
                <div class="tree-panel" :style="sidebarStyle">
                  <div class="tel_flow">
                    <div class="page-title" style="font-size: 16px; font-weight: 500; flex-shrink: 0">{{ pageTitle }}</div>
                    <NInput v-model:value="treeFilterPattern" :placeholder="'关键字'" style="height: 30px; width: 100%" />
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
                </div>
                <div class="collapse_btn">
                  <div class="btn_container" @click="sidebarVisible = !sidebarVisible"><left-outlined :style="arrowStyle" /> </div>
                </div>
                <div class="ens-panel p-4" ref="TreeEnsRef" :style="contentStyle">
                  <div class="table-toolbar">
                    <InputGroup v-if="!expandCondition" compact class="search-box">
                      <Select v-model:value="searchMode" style="width: 110px">
                        <SelectOption value="global">{{ '全局搜索' }}</SelectOption>
                        <SelectOption value="current">{{ '当前搜索' }}</SelectOption>
                      </Select>
                      <InputSearch v-model:value="tableQueryKeyword" :placeholder="'请输入关键字'" style="width: 240px" :enter-button="'搜索'" @search="queryTable" />
                    </InputGroup>
                    <AntButton v-if="WebUser.No === 'admin'" type="primary" @click="designSkip" style="background-color: #f27140; border-color: #f27140">{{ '设计' }}</AntButton>
                  </div>
                  <!-- table -->
                  <NDataTable
                    :columns="columns"
                    :data="dataSource"
                    :cascade="true"
                    allow-checking-not-loaded
                    :flex-height="true"
                    style="transition: all ease 0.4s"
                    :style="tableStyle"
                    :size="columnSize"
                  />
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
  import { onMounted, reactive, ref, h, unref, computed, shallowRef } from 'vue';
  import { message, InputGroup, Select, SelectOption, InputSearch, Spin, Button as AntButton } from 'ant-design-vue';
  import { FileOutlined, LeftOutlined, MenuOutlined } from '@ant-design/icons-vue';
  import { NTree, NInput, NDataTable, TreeOption, NConfigProvider, DataTableColumns, NIcon } from 'naive-ui';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { useRoute } from 'vue-router';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { router } from '/@/router';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { Folder, FolderOpenOutline } from '@vicons/ionicons5';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { debounce } from 'lodash-es';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TreeEnsDBView } from '/@/CCFast/CCBill/DBList/TreeEnsDBView';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import WebUser from '/@/bp/web/WebUser';
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
  const { t } = useI18n();
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const treeData = ref<TreeOption[]>();
  const treeSelectedKeys = ref<string[]>([]);
  //默认展开的节点
  const defaultExpandedKeys = ref<string[]>([]);
  const expandedRowKeys = ref<string[]>([]);
  //是否异步加载
  const isLazy = ref(false);
  // 树查询变量
  const treeFilterPattern = ref('');

  // 展开条件
  const expandCondition = ref(false);

  // 处理基础组件
  const detailExtLink = ref('');
  const { loadComponent } = useComponentLoader();
  const extPanelVisible = ref(false);
  const tableStyle = computed(() => {
    return {
      height: `${extPanelVisible.value && detailExtLink.value ? 'calc(100% - 500px)' : 'calc(100% - 60px)'}`,
      border: `${extPanelVisible.value && detailExtLink.value ? '1px solid var(--system-bg-color)' : 'none'}`,
    };
  });

  const designSkip = () => {
    const frmID = props.params.FrmID;
    const url = GloComm.UrlEn('TS.CCBill.TreeEnsDBView', '&No=' + frmID + '&PKVal=' + frmID);
    baseComponent.value?.openDrawerByUrl('左树右表视图', url, '80%');
  };
  const treeFilterAction = (keyword: string, node: any) => {
    if (keyword.trim() === '') return true;
    return node.Name.includes(keyword);
  };
  // 处理左侧菜单显示隐藏
  const sidebarVisible = ref(true);
  const sidebarStyle = computed(() => {
    return {
      width: sidebarVisible.value ? '240px' : 0,
      padding: sidebarVisible.value ? '20px 8px 10px 12px' : 0,
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
      width: sidebarVisible.value ? 'calc(100% - 240px)' : '100%',
    };
  });
  // 处理右键菜单事件
  let activeTreeNode: any = null;
  let activeTreeItemId: any = null;
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
        detailExtLink.value = '';
        extPanelVisible.value = false;
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

  // 行定义

  type ColumnSize = 'small' | 'medium' | 'large';
  const columnSize = ref<ColumnSize>('large');
  // 页面相关逻辑
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

  // 渲染树
  const renderTree = async (rootNo = '0', frmID) => {
    const trees = await dbList.DoMethodReturnString('GetTrees', rootNo);
    const treeEns = trees.map((item) => {
      if (isLazy.value === true) {
        return {
          ...item,
          key: item.No,
          label: item.Name,
          isLeaf: false,
        };
      }
      return {
        ...item,
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

    treeEns?.forEach((te) => {
      te.suffix = () =>
        h(
          NIcon,
          {
            style: {
              width: '20px',
              opacity: activeTreeItemId == te.key ? '1' : '0',
            },
            onclick: (e) => {
              activeTreeNode = te;
              e.preventDefault();
            },
          },
          { default: () => h(MenuOutlined) },
        );
    });
    treeData.value = listToTree(rootNo, treeEns || [], true);
    defaultExpandedKeys.value.push(rootNo);
  };
  const fetchTableData = async (queryInfo: Recordable | undefined = undefined) => {
    try {
      loading.value = true;
      dataSource.value = [];
      originDataSource.value = [];
      let nodeID = '';
      if (!queryInfo) {
        nodeID = currentActiveKey.value;
      } else {
        nodeID = queryInfo.key;
      }
      dataSource.value = await dbList.DoMethodReturnString('GetEns', nodeID);
      originDataSource.value = dataSource.value;
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  // 渲染表格
  const renderTable = async (cols) => {
    const treeEnsColumns: DataTableColumns<RowData> = cols.split(',').map((col) => {
      const item = col.split('=');
      const column: any = {
        title: item[1],
        key: item[0],
        align: 'left',
        resizable: true,
      };
      return column;
    });
    columns.value = [
      {
        title: '#',
        key: 'key',
        width: 50,
        render: (_, index) => {
          return `${index + 1}`;
        },
      },
      ...treeEnsColumns,
    ];
  };

  // table 搜索
  type SearchMode = 'global' | 'current';
  const tableQueryKeyword = ref<string>('');
  let inSearchMode = false;
  const searchMode = ref<SearchMode>('current');
  const queryTable = async () => {
    try {
      loading.value = true;
      inSearchMode = true; // 打开查找模式
      dataSource.value = [];
      const mode = unref(searchMode);
      const keyword = unref(tableQueryKeyword);
      if (mode === 'global') {
        if (!dbView.ExpEn0) {
          message.error('没有设置实体全局搜索,请联系配置人员');
          return;
        }
        dataSource.value = await dbList.DoMethodReturnString('GetSearchEns', keyword);
      } else if (mode === 'current') {
        if (keyword.trim() === '') {
          dataSource.value = originDataSource.value;
          return;
        }
        dataSource.value = originDataSource.value.filter((item) => item?.Name?.includes(keyword) || item?.No?.includes(keyword));
      }
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };

  const EnableContextMenu: any = ref(true);
  const pageTitle = ref('');
  const dbList = new BSEntity('BP.CCBill.DBList');
  const dbView = new TreeEnsDBView();
  const InitPage = async () => {
    try {
      loading.value = true;
      const frmID = props.params.FrmID;
      dbView.No = frmID;
      await dbView.RetrieveFromDBSources();

      dbList.setPK(frmID);
      await dbList.RetrieveFromDBSources();
      pageTitle.value = dbView.Name;
      EnableContextMenu.value = false;
      isLazy.value = dbView.GetParaBoolean('IsLazy');
      await renderTree(dbView.GetParaString('RootNo', '0'), props.params.FrmID);
      if (!!treeData.value && treeData.value.length > 0) defaultExpandedKeys.value.push(treeData.value[0].No as string);
      renderTable(dbView.GetParaString('Note'));
      updateTitle(dbView.Name);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const handleLoad = async (node: TreeOption) => {
    const trees = await dbList.DoMethodReturnString('GetTrees', node.key as string);
    const treeEns = trees.map((item) => {
      return {
        ...item,
        key: item.No,
        label: item.Name,
        isLeaf: false,
      };
    });
    node.children = treeEns;
  };

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

  .search-mode {
    transition: width ease 0.2s;
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
    box-sizing: border-box;
  }
  //间距
  .tree-ens-main {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: white;
    border-radius: 0 0 12px 12px;

    .tree-panel {
      // flex: 0.2;
      // min-width: 160px;
      // width: 240px;
      transition: width 0.4s ease;
      flex-shrink: 0;
      height: 100%;
      overflow-x: auto;
      overflow-y: auto;
      box-sizing: border-box;

      .tel_flow {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
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

    .collapse_btn {
      height: 100%;
      width: 10px;
      background-color: #f2f5f7;
      display: flex;
      align-items: center;
      justify-content: center;

      .btn_container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 100px;
        cursor: pointer;
        border: 1px solid #ccc;

        &:hover {
          background-color: white;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }
      }
    }

    .ens-panel {
      // flex: 1;
      height: 100%;

      .table-toolbar {
        display: flex;
        // align-items: center;
        justify-content: space-between;
        // margin: 20px 0;
        margin-bottom: 10px;

        .search-box {
          width: 350px;
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

  .ext-panel {
    position: relative;
    z-index: 999;
    background-color: #f2f5f7;
    transition: all ease 0.6s;
    overflow: hidden auto;
    margin-top: 10px;

    .toggle-panel {
      position: sticky;
      left: 0px;
      top: 0px;
      z-index: 999;
      width: 40px;
      height: 40px;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--system-bg-color);
    }
  }

  .btn_add {
    background-color: #67c23a !important;
    border-color: #67c23a !important;
    color: #fff !important;
  }

  .btn_del {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff !important;
  }
</style>

<style>
  .tr-selected {
    background-color: var(--system-bg-color) !important;
  }
  .tr-selected td,
  .tr-selected td span {
    background-color: transparent !important;
    color: white !important;
  }
</style>
