<template>
  <Spin :spinning="!config.ready">
    <div class="subtable-area" style="width: 100%; height: 100%">
      <NDataTable
        v-if="config.ready"
        :columns="config.columns"
        :data="config?.dataSource"
        :row-key="rowKey"
        :checked-row-keys="config.checkedItems"
        :pagination="paginationReactive"
        @update:checked-row-keys="config.onUpdateCheckedItems"
        :row-props="rowProps"
        flex-height
        :scroll-x="fitParent ? undefined : Math.max(tbWidth, 1000)"
        size="small"
        :striped="true"
        :bordered="false"
        :single-line="false"
        :theme-overrides="tableTheme"
        :style="tableStyle"
      />
      <Modal v-model:open="modalInfo.visible" :width="1200" :title="'附件信息'" :footer="null">
        <Ath v-if="modalInfo.visible" :params="modalInfo.params" :-p-k-value="modalInfo.params.RefOID" :ath-info="modalInfo.athInfo" is-readonly />
      </Modal>
    </div>
  </Spin>
</template>

<script setup lang="ts">
  import { reactive, onMounted, h, ref, toRaw, computed } from 'vue';
  import { NDataTable, NEllipsis } from 'naive-ui';
  import { Spin, message, Modal } from 'ant-design-vue';
  import { DataTableColumn } from 'naive-ui/es/data-table';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { TableConfig } from '/@/components/SearchComponent/src/types';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { Attr } from '/@/bp/en/Map/Attr';
  import Ath from '/@/WF/CCForm/Ath.vue';
  const props = defineProps({
    // 流程id
    workId: {
      type: Number,
      required: true,
    },
    // 从表id
    dtlId: {
      type: String,
      required: true,
    },
    // 表单id
    frmId: {
      type: String,
      required: true,
    },
    // 使表格宽度自适应父容器，并取消横向滚动
    fitParent: {
      type: Boolean,
      default: false,
    },
    // 表格高度（如 '100%' 或 '520px'），不传则使用默认高度
    height: {
      type: String,
      default: '',
    },
    // 紧凑显示
    compact: {
      type: Boolean,
      default: true,
    },
  });

  const config = reactive<TableConfig>({
    dataSource: [],
    columns: [],
    pageSize: 10,
    pageCount: 1,
    onPageSizeChange: () => {},
    onPageNumberChange: () => {},
    primaryKey: '',
    checkedItems: [],
    onUpdateCheckedItems: () => {},
    onRowClick: () => {},
    ready: false,
    page: 0,
  });
  const rowKey = (rowData: RowData) => rowData[config.primaryKey || ''];

  const paginationReactive = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 15, 20, 50],
    itemCount: 10,
    pageCount: 1,
    showQuickJumper: true,
    prefix: () => {
      return h('span', { style: 'color: #646a73; font-size: 12px; margin-right: 8px' }, `共 ${config.dataSource.length || 0} 条`);
    },
    suffix: () => {
      return h('span', { style: 'color: #646a73; font-size: 12px' }, `页`);
    },
    onChange: (page: number) => {
      paginationReactive.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
    },
  });

  type SubTableInfo = {
    DBDtl: Recordable[]; // 数据
    Sys_MapAttr: MergedColumn[]; // 字段
    Sys_FrmAttachment: Recordable[]; // 附件
  };

  type MergedColumn = Attr & {
    KeyOfEn: string;
    Name: string;
    Width: number;
  };

  type ModalArgs = {
    visible: boolean;
    params: Recordable;
    athInfo: Recordable;
  };
  const modalInfo = reactive<ModalArgs>({
    visible: false,
    params: {},
    athInfo: {},
  });

  const loadAth = async (athKey: string, ref_oid: number) => {
    modalInfo.athInfo = {
      FK_MapData: props.frmId,
      MyPK: athKey,
    };
    modalInfo.params = {
      RefOID: ref_oid,
      FrmID: props.frmId,
      RefPKVal: props.workId,
      EnsName: props.dtlId,
      WorkID: props.workId,
    };
    console.log({ modalInfo });
    modalInfo.visible = true;
  };

  let dtlAthList: Recordable[] = [];

  const tbWidth = ref(0);
  const loadTableInfo = async () => {
    const { isBoolean, isTextArea, isDDL, isEnumSingle } = useFieldType();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('PKVal', props.frmId);
    handler.AddPara('RefPKVal', props.workId);
    handler.AddPara('OID', props.workId);
    handler.AddPara('FrmID', props.frmId);
    handler.AddPara('EnsName', props.dtlId);
    const data = await handler.DoMethodReturnJson<SubTableInfo>('Dtl_Init');
    // create columns
    // hide attrs when 'UIVisible' attribute is false
    let UIWidth = 0;
    config.columns = data.Sys_MapAttr.filter((attr: MergedColumn) => attr.UIVisible == 1).map((attr: MergedColumn) => {
      UIWidth += Number(toRaw(attr.UIWidth));
      const cellData: DataTableColumn = {
        key: attr.KeyOfEn,
        title: attr.Name,
        width: Math.max(attr.UIWidth, 120),
        align: 'left',
        ellipsis: {
          tooltip: true
        },
      };
      if (isBoolean(attr)) {
        cellData.render = (row: Recordable) => {
          return h(
            NEllipsis,
            {},
            {
              default: () => (row[attr.KeyOfEn] == 1 ? '是' : '否'),
            },
          );
        };
      }
      if (isTextArea(attr)) {
        cellData.render = (row: Recordable) => {
          return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => row[attr.KeyOfEn] });
        };
      }
      if (isDDL(attr) || isEnumSingle(attr)) {
        cellData.render = (row: Recordable) => {
          return h(NEllipsis, { style: { maxWidth: attr.Width + 'px' } }, { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] });
        };
      }
      if (attr.UIContralType == 6) {
        cellData.render = (row: Recordable) => {
          return h(
            'div',
            {
              style: { color: '#459dff', cursor: 'pointer' },
              onClick: () => {
                const ath = dtlAthList.find((ath) => ath.NoOfObj === attr.KeyOfEn);
                if (!ath) {
                  message.error('未找到附件信息');
                  return;
                }
                loadAth(ath.MyPK, row.OID);
              },
            },
            '查看',
          );
        };
      }
      return cellData;
    });

    //插入序号列
    config.columns.unshift({
      title: '#',
      key: '_sys_default_idx',
      width: 50,
      align: 'center',
      fixed: 'left', // 固定在最左侧
      render: (row, index) => {
        const num = (paginationReactive.page - 1) * paginationReactive.pageSize + index + 1;
        return h('span', { style: 'color: #8f959e; font-weight: 500; font-size: 13px' }, num);
      },
    });

    tbWidth.value = UIWidth;
    // load ath list

    // fill data
    config.dataSource = data.DBDtl;

    dtlAthList = data.Sys_FrmAttachment;

    // calc total page by per page
    config.itemCount = data.DBDtl.length;
    config.pageCount = Math.ceil(config.itemCount / config.pageSize);
    // ready
    config.ready = true;
  };

  //计算表格列宽
  const tableStyle = computed(() => {
    const h = props.height && props.height.length > 0 ? props.height : '360px';
    const w = props.fitParent ? '100%' : `${Math.max(tbWidth.value + 50, 1050)}px`;
    return { height: h, width: w } as any;
  });

  const tableTheme = computed(() => {
    return {
      DataTable: {
        // 表头样式
        thPaddingSmall: '12px 16px',
        thPaddingMedium: '14px 16px',
        thFontWeight: '600',
        thColor: '#1f2329',
        thColorHover: '#1f2329',
        thTextColor: '#1f2329',
        thBgColor: 'linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%)',
        // 单元格样式
        tdPaddingSmall: '10px 16px',
        tdPaddingMedium: '12px 16px',
        tdColor: '#ffffff',
        tdColorHover: '#f0f7ff',
        tdColorStriped: '#fafbfc',
        tdColorStripedHover: '#f0f7ff',
        // 边框颜色
        borderColor: '#e8eaed',
        borderRadius: '8px',
        // 分页器样式
        paginationMargin: '8px 0 0 0',
        paginationItemSize: '24px',
        paginationItemFontSize: '12px',
        paginationItemBorderRadius: '4px',
        paginationItemColorHover: '#f0f7ff',
        paginationItemColorActive: '#1890ff',
        paginationItemTextColorActive: '#ffffff',
        paginationItemBgColorActive: '#1890ff',
        // 滚动条
        scrollbarWidth: '8px',
        scrollbarHeight: '8px',
        scrollbarBorderRadius: '4px',
        // 字体
        fontSizeSmall: '13px',
        fontSizeMedium: '14px',
      },
      Pagination: {
        itemSize: '24px',
        itemFontSize: '12px',
        itemBorderRadius: '4px',
        itemTextColor: '#646a73',
        itemTextColorHover: '#1890ff',
        itemTextColorPressed: '#096dd9',
        itemTextColorActive: '#ffffff',
        itemColor: '#ffffff',
        itemColorHover: '#f0f7ff',
        itemColorPressed: '#e6f4ff',
        itemColorActive: '#1890ff',
        itemColorActiveHover: '#40a9ff',
        itemBorder: '1px solid #e8eaed',
        itemBorderHover: '1px solid #1890ff',
        itemBorderPressed: '1px solid #096dd9',
        itemBorderActive: '1px solid #1890ff',
        buttonBgColorHover: '#f0f7ff',
        buttonBgColorPressed: '#e6f4ff',
      },
    } as any;
  });

  onMounted(async () => {
    await loadTableInfo();
    if (config.dataSource.length > 0) {
      emit('row-click', config.dataSource[0]);
    }
  });

  // emit row click for parent listeners
  const emit = defineEmits<{
    (e: 'row-click', row: Recordable): void;
  }>();

  // 暴露刷新方法给父组件使用
  defineExpose({
    loadTableInfo,
  });

  const rowProps = (row: Recordable) => {
    return {
      style: 'cursor: pointer',
      onClick: () => emit('row-click', row),
    } as any;
  };
</script>

<style scoped lang="less">
  .subtable-area {
    padding: 8px;
    background: #fff;
    border-radius: 8px;

    :deep(.n-data-table) {
      .n-data-table-wrapper {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }

      // 表头样式
      .n-data-table-th {
        background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
        border-color: #e8eaed !important;
        font-weight: 600;
        color: #1f2329;
        white-space: nowrap;

        &:first-child {
          border-left: none;
        }

        &:last-child {
          border-right: none;
        }
      }

      // 表格行样式
      .n-data-table-tr {
        transition: all 0.2s ease;

        &:hover {
          background-color: #f0f7ff !important;

          .n-data-table-td {
            background-color: transparent !important;
          }
        }

        &:nth-child(even) {
          .n-data-table-td {
            background-color: #fafbfc;
          }
        }
      }

      // 单元格样式
      .n-data-table-td {
        border-color: #e8eaed !important;
        color: #1f2329;
        font-size: 14px;
        transition: background-color 0.2s ease;

        &:first-child {
          border-left: none;
          font-weight: 500;
          color: #8f959e;
        }

        &:last-child {
          border-right: none;
        }
      }

      // 序号列特殊样式
      .n-data-table-td[data-col-key="_sys_default_idx"] {
        background: linear-gradient(180deg, #fafbfc 0%, #f8f9fa 100%);
        font-weight: 600;
      }

      // 滚动条样式
      .n-scrollbar {
        .n-scrollbar-rail {
          background: #f0f2f5;
          border-radius: 4px;

          .n-scrollbar-rail__scrollbar {
            background: #c1c7d0;
            border-radius: 4px;
            opacity: 0.6;
            transition: opacity 0.2s, background-color 0.2s;

            &:hover {
              opacity: 1;
              background: #8f959e;
            }
          }
        }
      }
    }

    // 分页器样式
    :deep(.n-pagination) {
      margin-top: 8px;
      padding: 4px 8px;
      background: linear-gradient(90deg, #fafbfc 0%, #ffffff 100%);
      border-radius: 6px;
      border: 1px solid #e8eaed;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;

      .n-pagination-item {
        min-width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid #e8eaed;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        background: #fff;

        &:hover:not(.n-pagination-item--active):not(.n-pagination-item--disabled) {
          background: #f0f7ff;
          border-color: #40a9ff;
          color: #1890ff;
        }

        &.n-pagination-item--active {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          border-color: #1890ff;
          color: #fff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
        }

        &.n-pagination-item--disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &__arrow,
        &__more {
          color: #8f959e;
        }
      }

      // 分页大小选择器
      .n-pagination-size-picker {
        .n-select {
          width: 80px;

          .n-base-selection {
            height: 24px;
            border-radius: 4px;
            border: 1px solid #e8eaed;
            background: #fff;
            transition: all 0.2s ease;
            font-size: 12px;

            &:hover {
              border-color: #40a9ff;
            }

            &--focused {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
            }
          }
        }
      }

      // 快速跳转
      .n-pagination-quick-jumper {
        .n-input {
          width: 50px;

          .n-input-wrapper {
            height: 24px;
            border-radius: 4px;

            .n-input__input-el {
              height: 24px;
              line-height: 24px;
              font-size: 12px;
            }
          }
        }
      }

      // 前缀后缀文字
      .n-pagination-prefix,
      .n-pagination-suffix {
        color: #646a73;
        font-size: 12px;
      }
    }
  }
</style>
