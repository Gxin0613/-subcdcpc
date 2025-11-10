<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch" style="padding-top: 46px; background-color: #f2f5f7">
    <Tabs v-model:active="activeTab" sticky :offset-top="46" @change="onTableChange">
      <Tab v-for="tab in flowStatus.options" :title="tab.label" :key="tab.value" :name="tab.value">
        <VantCheckGroup v-model="tableConfigs.checkedItems" style="background-color: #f2f5f7">
          <VanLoading v-if="loading" vertical size="24px" />
          <VantEmpty
            v-else-if="tableConfigs.dataSource.length === 0"
            :description="'暂无数据'"
            style="height: calc(-200px + var(--viewport-height)); padding: 10px 10px; background-color: white"
          >
          </VantEmpty>
          <VantCellGroup inset style="background-color: #f2f5f7">
            <div style="height: calc(var(--viewport-height) - 150px); overflow-y: auto">
              <div v-for="(item, index) in tableConfigs.dataSource" class="card-item" center :key="item['OID']" clickable @click="toggle(index)">
                <div class="title">
                  <VantCheckbox :name="item['OID']" :ref="(el) => (checkboxRefs[index] = el)" @click.stop />
                  <span style="flex: 4">{{ getTitle(item) }}</span>
                  <div style="color: #1890fa; flex: 1; text-align: right" @click.stop="tableConfigs.onRowClick?.(item)">{{ '详情' }}</div>
                </div>
                <div class="body">
                  <div class="row" v-for="col in tableConfigs.columns" :key="col.key">
                    <span class="row-label">{{ col.title }}</span
                    >{{ getText(item, col.key) }}</div
                  >
                </div>
              </div>
            </div>
          </VantCellGroup>
        </VantCheckGroup>
      </Tab>
    </Tabs>
    <!-- filter -->
    <VanPopup v-model:show="filterVisible" round position="bottom" :style="{ height: '400px', padding: '0 12px' }">
      <div class="van-h5">{{ '筛选' }}</div>
      <Field v-model="keyword" name="keyword" :label="'关键字'" :placeholder="'输入关键字'" />
      <Field
        v-model="flowRange.label"
        is-link
        readonly
        name="picker"
        :label="'参与范围'"
        :placeholder="'选择参与范围'"
        @click="flowRange.pickerVisible = true"
      />
      <VanPopup v-model:show="flowRange.pickerVisible" position="bottom">
        <Picker
          :columns="flowRange.options"
          @confirm="
            ($events) => {
              flowRange.value = $events.selectedOptions[0]?.value;
              flowRange.label = $events.selectedOptions[0]?.text;
              flowRange.pickerVisible = false;
            }
          "
          @cancel="flowRange.pickerVisible = false"
        />
      </VanPopup>

      <Field
        v-model="flowStatus.label"
        is-link
        readonly
        name="picker"
        :label="'流程状态'"
        :placeholder="'选择流程状态'"
        @click="flowStatus.pickerVisible = true"
      />
      <VanPopup v-model:show="flowStatus.pickerVisible" position="bottom">
        <Picker
          :columns="flowStatus.options"
          @confirm="
            ($events) => {
              flowStatus.value = $events.selectedOptions[0]?.value;
              flowStatus.label = $events.selectedOptions[0]?.text;
              flowStatus.pickerVisible = false;
            }
          "
          @cancel="flowStatus.pickerVisible = false"
        />
      </VanPopup>
      <Field
        v-model="dateRangeLabel"
        is-link
        readonly
        name="calendar"
        clearable
        :label="'发起日期'"
        :placeholder="'点击选择日期范围'"
        @click="showCalendar = true"
      />
      <Calendar v-model:show="showCalendar" :min-date="minDate" type="range" @confirm="selectDate" />
      <VantButton
        type="primary"
        size="small"
        block
        round
        @click="
          () => {
            query();
            filterVisible = false;
          }
        "
        style="margin-top: 10px"
        >查询</VantButton
      >
    </VanPopup>
    <!-- more action -->
    <VanPopup v-model:show="moreActionVisible" round position="bottom" :style="{ height: '300px', padding: '0 12px' }">
      <div class="van-h5">{{ '基础方法' }}</div>
      <div class="extend-func">
        <div class="func-item" @click="BatchPackUp"> <DownloadOutlined style="font-size: 18px; margin-bottom: 12px" />{{ '打包下载' }}</div>
      </div>
      <div class="van-h5" v-if="feature.options.length > 0">扩展方法</div>
      <div class="extend-func" @click="moreActionVisible = false">
        <div class="func-item" v-for="func in feature.options" :key="func.key" @click="func.onClick">
          <FunctionOutlined style="font-size: 18px; margin-bottom: 12px" />
          {{ func.name }}
        </div>
      </div>
    </VanPopup>
    <div class="tab-buttons">
      <VantSearch v-model="keyword" :placeholder="'请输入关键字'" @search="query()" style="width: 80%" />
      <VantIcon name="filter-o" size="22" @click="filterVisible = true" color="#459dff" />
      <VantIcon name="arrow-up" size="22" @click="moreActionVisible = true" color="#459dff" />
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, shallowRef, onBeforeUpdate } from 'vue';
  import { DownloadOutlined } from '@ant-design/icons-vue';
  import { NEllipsis } from 'naive-ui/es/ellipsis';
  import { message } from 'ant-design-vue';
  import type { TableConfig } from '/@/components/SearchComponent/src/types';
  import { DataTableColumn } from 'naive-ui/es/data-table';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { NIcon } from 'naive-ui';
  import dayjs, { Dayjs } from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { IosLink } from '@vicons/ionicons4';
  import WebUser from '/@/bp/web/WebUser';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { aoaToSheetXlsx } from '/@/components/Excel';
  import {
    Loading as VanLoading,
    Tabs,
    Field,
    Picker,
    Button as VantButton,
    CheckboxGroup as VantCheckGroup,
    Checkbox as VantCheckbox,
    Search as VantSearch,
    Tab,
    Icon as VantIcon,
    Popup as VanPopup,
    CellGroup as VantCellGroup,
    Calendar,
    Empty as VantEmpty,
  } from 'vant';
  import { FunctionOutlined } from '@ant-design/icons-vue';
  type RangeValue = [Dayjs, Dayjs];
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const keyword = ref('');
  //参与范围
  const flowRange = reactive({
    value: 0,
    pickerVisible: false,
    label: '我参与的',
    options: [
      {
        label: '我参与的',
        value: 0,
        text: '我参与的',
      },
      {
        label: '我发起的',
        value: 1,
        text: '我发起的',
      },
      {
        label: '全部范围',
        value: 2,
        text: '全部范围',
      },
    ],
  });
  const activeTab = ref(0);
  //流程状态
  const flowStatus = reactive({
    // WebUser.IsAdmin ? 2 :
    value: 0,
    label: '新工作',
    pickerVisible: false,
    options: [
      {
        label: '新工作',
        text: '新工作',
        value: 0,
      },
      {
        label: '归档',
        text: '归档',
        value: 1,
      },
      {
        label: '其他',
        text: '其他',
        value: 2,
      },
      {
        label: '全部状态',
        text: '全部状态',
        value: 3,
      },
    ],
  });

  const moreActionVisible = ref(false);
  //参与范围
  const feature = reactive({
    options: [
      {
        key: 0,
        name: '发起',
        icon: 'icon-paper-plane',
        onClick: () => {
          createNewFlow();
        },
      },
      // {
      //   key: 1,
      //   name: '分析',
      //   icon: 'icon-chart',
      //   onClick: () => {
      //     analyzeFlow();
      //   },
      // },
      // {
      //   key: 2,
      //   name: '设计',
      //   icon: 'icon-settings',
      //   onClick: () => {
      //     Design();
      //   },
      // },
      {
        key: 3,
        name: '导出',
        icon: 'icon-logout',
        onClick: () => {
          deriveFlow();
        },
      },
    ],
  });

  // 获取本月初时间
  const flowNo = ref(props.params.FlowNo);
  // const startOfMonth = dayjs().startOf('month');
  // 获取本月末时间
  // const endOfMonth = dayjs().endOf('month');
  const dateRange = ref<RangeValue>();
  const dateRangeLabel = ref('');
  const showCalendar = ref(false);
  const formatDT = (dt: string) => {
    return dt ? dayjs(dt).format('YYYY-MM-DD') : '';
  };
  const minDate = dayjs().subtract(30, 'day').toDate();
  const selectDate = (date) => {
    dateRange.value = [dayjs(date[0]), dayjs(date[1])];
    dateRangeLabel.value = `${formatDT(date[0])} ~ ${formatDT(date[1])}`;
    showCalendar.value = false;
  };
  // 日期选择
  const createNewFlow = async () => {
    //#穿透页面url地址
    const url = `${location.pathname}#/CCMobile/MyFlow?FlowNo=${flowNo.value}`;
    window.location.href = url;
    // wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.Replace, url));
  };
  //跳转分析
  // const analyzeFlow = () => {
  //   const url = `/src/WF/Rpt/GroupFlow.vue?FlowNo=${flowNo.value}`;
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.Replace, url));
  // };

  const filterVisible = ref(false);

  let mapAttrsInst: Nullable<MapAttrs> = null;
  //导出
  const deriveFlow = async () => {
    if (!mapAttrsInst) return;
    const mapAttrs = mapAttrsInst.filter((attr) => attr.UIVisible == 1);
    const allFields = mapAttrs.map((attr) => attr.KeyOfEn);
    const header = mapAttrs.map((attr) => attr.Name);
    const data = tableConfigs.dataSource.map((item) => {
      return mapAttrs.map((attr) => {
        if (allFields.includes(attr.KeyOfEn + 'T') || allFields.includes(attr.KeyOfEn + 'Text')) {
          return item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn + 'Text'];
        }
        if (attr.KeyOfEn === 'WFState') {
          return WFStateMap.get(parseInt(item[attr.KeyOfEn]))?.text;
        }
        return item[attr.KeyOfEn];
      });
    });
    aoaToSheetXlsx({ data, header, filename: props.params?.FlowName || props.params?.FlowNo + '.xlsx' });
  };
  const TableSource = ref();
  // const Design = async () => {
  //   const url = `/src/WF/Comm/GroupPageNew?EnName=GPN_FlowRptSelectFields&PKVal=${flowNo.value}`;
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  // };
  const checkboxRefs = ref<any>([]);
  const toggle = (index) => {
    checkboxRefs.value[index].toggle();
  };

  onBeforeUpdate(() => {
    checkboxRefs.value = [];
  });

  const getTitle = (row) => {
    return row['Name'] || row['Title'] || row['No'];
  };
  const getText = (row, key) => {
    return row[key + 'Text'] || row[key + 'T'] || row[key];
  };
  const onTableChange = () => {
    flowStatus.value = activeTab.value;
    query();
  };
  const query = async () => {
    try {
      const DTFrom = dateRange.value?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      const DTTo = dateRange.value?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      loading.value = true; //获得数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo.value);
      handler.AddPara('KeyWords', keyword.value);
      handler.AddPara('DTFrom', DTFrom);
      handler.AddPara('DTTo', DTTo);
      handler.AddPara('SearchType', flowRange.value);
      handler.AddPara('WFSta', flowStatus.value);
      const data = await handler.DoMethodReturnJson('SearchFlow_Init');
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
    pageCount: 1,
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
      if (WebUser.IsAdmin) {
        const url = `/src/CCMobile/Comm/En.vue?EnName=TS.FlowData.GenerWorkFlowView&${query}`;
        // wrapperRef.value?.openDrawerByUrl('BPM软件', url, '50%');
        wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer100, url, '流程信息'));
      } else {
        const url = '/#/WF/MyView?' + query;
        wrapperRef.value?.openIframe({
          title: row.Title,
          width: '100%',
          src: url,
          showFooter: false,
        });
      }
    },
    ready: false,
  });

  const { isTextArea, isDDL, isEnumSingle } = useFieldType();
  // 滚动条宽度
  const totalWidth = ref();

  // 状态map
  const WFStateMap = new Map([
    [1, { text: '草稿', color: 'red' }],
    [2, { text: '新工作', color: 'green' }],
    [3, { text: '归档', color: 'blue' }],
    [5, { text: '退回', color: 'red' }],
    [6, { text: '移交', color: 'red' }],
    [7, { text: '作废', color: 'red' }],
    [8, { text: '加签', color: 'red' }],
  ]);
  //显示列
  const InitMapAttrs = async () => {
    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', 'FlowRpt' + flowNo.value, 'Idx');
    mapAttrsInst = mapAttrs;
    const getColumns = () => {
      return mapAttrs
        .map((attr: any) => {
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
              const state = WFStateMap.get(parseInt(row[attr.KeyOfEn]));
              let color = '',
                text = '';
              if (!state) {
                color: '#000';
                text: '空白';
              } else {
                color = state.color;
                text = state.text;
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
          //设置排序
          if (attr.KeyOfEn === 'FlowStartRDT') {
            cellData.sortOrder = false;
            cellData.defaultSortOrder = 'descend';
            cellData.sorter = (a: any, b: any) => {
              const ts1 = new Date(a?.FlowStartRDT?.replace(/-/g, '/')).getTime();
              const ts2 = new Date(b?.FlowStartRDT?.replace(/-/g, '/')).getTime();
              return ts1 - ts2;
            };
          }
          return cellData;
        })
        .filter((item) => item !== null);
    };
    tableConfigs.columns = getColumns() as any;
    //动态添加列时，根据列宽设置滚动条宽度
    totalWidth.value = tableConfigs.columns.reduce((acc: any, cur: any) => {
      return parseInt(acc) + parseInt(cur.width);
    }, 0);
    tableConfigs.dataSource = TableSource.value || [];
  };
  //批量打印OID
  const PackUps = ref();
  const PackUpUrl = ref();
  const BatchPackUp = async () => {
    try {
      if (!!tableConfigs.checkedItems) {
        //获取OID字符串
        PackUps.value = tableConfigs.checkedItems.join(',');
        //接口调用并返回zip目录链接
        if (PackUps.value.length == 0) {
          message.info('请选择您需要打包下载的内容.');
          return;
        }
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('FlowNo', flowNo.value);
        handler.AddPara('workids', PackUps.value);
        const data: any = await handler.DoMethodReturnJson('BatchPdfPackup');
        PackUpUrl.value = data[0].Name;
        //a链接跳转打包
        if (!!PackUpUrl.value) window.location.href = PackUpUrl.value;
      }
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  const InitSearch = async () => {
    await query();
    await InitMapAttrs();
  };
  InitSearch();
</script>

<style lang="less" scoped>
  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  .card-item {
    background-color: white;
    padding: 6px;
    border-radius: 12px;
    margin-bottom: 16px;
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
      }
      .row + .row {
        margin-top: 8px;
      }
    }
  }
  .van-h5 {
    position: relative;
    padding: 15px 24px;
    margin-bottom: 0;
    color: #000;
    font-size: 15px;
    font-weight: 700;
    &::before {
      content: '';
      position: absolute;
      top: 30%;
      left: 0px;
      width: 5px;
      height: 18px;
      border-radius: 10px;
      background-color: #1989fa;
    }
  }

  .tab-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 60px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    z-index: 20;
    background-color: white;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e8e8e8;
    align-items: center;
  }
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
  .extend-func {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    .func-item {
      height: 80px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #1989fa;
      background-color: #1989fa;
      color: white;
      font-size: 12px;
      flex-direction: column;
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
