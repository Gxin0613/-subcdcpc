<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <template v-else>
          <search-table :loading="loading" :remote="false" :config="tableConfigs" :totalWidth="totalWidth" />
        </template>
      </Spin>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, shallowRef } from 'vue';
  import { SearchTable } from '/@/components/SearchComponent/index';
  import { NEllipsis } from 'naive-ui/es/ellipsis';
  import { Spin, message } from 'ant-design-vue';
  import type { TableConfig } from '/@/components/SearchComponent/src/types';
  import { DataTableColumn } from 'naive-ui/es/data-table';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { MapAttr, MapAttrs } from '../Admin/FrmLogic/MapAttrs/MapAttr';
  import { NIcon } from 'naive-ui';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import { IosLink } from '@vicons/ionicons4';

  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const TableSource = ref();
  const query = async () => {
    try {
      loading.value = true; //获得数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnJson('ContrastDtlFlow_Init');
      TableSource.value = data || [];
      console.log(TableSource.value);
      await InitMapAttrs();
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const currentPageIndex = ref(0);
  //设置table列数据和数据源
  const tableConfigs = reactive<TableConfig>({
    columns: [],
    dataSource: [],
    checkedItems: [],
    onUpdateCheckedItems: (items: any[]) => {
      tableConfigs.checkedItems = items;
    },
    primaryKey: 'OID',
    page: 1,
    pageSize: 10,
    onPageNumberChange: (pageNum: number) => {
      tableConfigs.page = pageNum;
      currentPageIndex.value = pageNum - 1;
      query();
    },
    onPageSizeChange: (pageSize: number) => {
      tableConfigs.pageSize = pageSize;
      query();
    },
    onRowClick: (row: Recordable) => {
      const args = {
        WorkID: row.OID,
        PKVal: row.OID,
        FlowNo: props.params.FlowNo,
      };
      // ...props.params,
      const query = Object.entries(args)
        .map(([key, val]) => {
          return `${key}=${val}`;
        })
        .join('&');
      const url = '/#/WF/MyView?' + query;
      wrapperRef.value?.openIframe({
        title: row.Title,
        width: '90%',
        src: url,
        showFooter: false,
      });
    },
  });

  const { isTextArea, isDDL, isEnumSingle } = useFieldType();
  // 滚动条宽度
  const totalWidth = ref();
  //显示列
  const InitMapAttrs = async () => {
    const flowNo = props.params.FlowNo;
    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', 'FlowRpt' + flowNo, 'Idx');
    console.log(mapAttrs);
    const getColumns = () => {
      return mapAttrs
        .map((attr: MapAttr) => {
          if (attr.UIVisible === 0) {
            return null;
          }
          if (attr.KeyOfEn.toLowerCase() === 'title') {
            attr.UIWidth = 300;
          }
          // 标题，状态，单号，发起人，发起日期，
          attr.UIHeight = attr.TextModel === 3 ? 50 : 23;
          attr.MyFieldType = 0;
          const cellData: DataTableColumn = {
            width: attr.UIWidth || 100,
            key: attr.KeyOfEn,
            title: attr.Name,
            align: 'left',
          };
          if (isTextArea(attr)) {
            cellData.render = (row: Recordable) => {
              return h(NEllipsis, { style: { minWidth: attr.UIWidth + 'px' } }, { default: () => row[attr.KeyOfEn] });
            };
          }
          if (isDDL(attr) || isEnumSingle(attr)) {
            cellData.render = (row: Recordable) => {
              return h(NEllipsis, { style: { minWidth: attr.UIWidth + 'px' } }, { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] });
            };
          }
          if (attr.KeyOfEn.toLowerCase() === 'title') {
            cellData.render = (row: Recordable) => {
              return h(
                'div',
                {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'start' },
                  onClick: () => {
                    tableConfigs?.onRowClick?.(row);
                  },
                },
                [
                  h(NIcon, { size: '16', color: 'var(--system-hover-bg-color)', style: { marginRight: '8px' } }, { default: () => h(IosLink) }),
                  h(
                    'a',
                    {
                      style: {
                        color: 'var(--system-hover-bg-color)',
                      },
                    },
                    row[attr.KeyOfEn],
                  ),
                ],
              );
            };
          }
          if (attr.KeyOfEn === 'WFState') {
            cellData.render = (row: Recordable) => {
              let color = '';
              let text = '';
              if (row[attr.KeyOfEn] == 2) {
                color = 'green';
                text = '新工作';
              } else if (row[attr.KeyOfEn] == 3) {
                color = 'blue';
                text = '归档';
              } else if (row[attr.KeyOfEn] == 5) {
                color = 'red';
                text = '退回';
              } else if (row[attr.KeyOfEn] == 1) {
                color = 'red';
                text = '草稿';
              } else if (row[attr.KeyOfEn] == 6) {
                color = 'red';
                text = '移交';
              } else if (row[attr.KeyOfEn] == 8) {
                color = 'red';
                text = '加签';
              } else {
                color = '#000';
                text = '空白';
              }
              return h(
                'div',
                {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'start' },
                },
                [
                  h(
                    'span',
                    {
                      style: { color: color, border: '1px solid ' + color, borderRadius: '3px', width: '50px', fontSize: '13px', textAlign: 'center' },
                    },
                    text,
                  ),
                ],
              );
            };
          }
          return cellData;
        })
        .filter((item) => item !== null);
    };
    tableConfigs.columns = [
      {
        title: '#',
        key: 'Index',
        width: 50,
        align: 'start',
        render: (_, rowIndex) => {
          const realIndex = currentPageIndex.value * tableConfigs.pageSize + rowIndex + 1;
          return `${realIndex}`;
        },
      },
    ].concat(getColumns() as any) as any;
    console.log(tableConfigs);
    //动态添加列时，根据列宽设置滚动条宽度
    totalWidth.value = tableConfigs.columns.reduce((acc: any, cur: any) => {
      return parseInt(acc) + parseInt(cur.width);
    }, 0);
    tableConfigs.dataSource = TableSource.value || [];
  };
  const InitSearch = async () => {
    await query();
    await InitMapAttrs();
  };
  InitSearch();
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
    background-color: #fff;
  }
  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }
  .card-of-table {
    border-radius: 0;
  }

  .search-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .search-keys {
      // flex: 3;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .search-key {
        align-items: center;
        margin: 6px 6px;
        display: flex;
      }
    }

    .search-buttons {
      // flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    }
  }
  .select-group-label {
    color: #1890ff;
    border-bottom: 1px solid #1890ff;
    font-size: 14px;
    padding-bottom: 12px;
    font-weight: 600;
  }
</style>
