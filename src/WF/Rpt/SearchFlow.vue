<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <template v-else>
          <Card class="card-of-head" style="background-color: #f9f9f9">
            <div class="search-container">
              <div class="search-keys">
                <div class="search-key" style="max-width: 150px">
                  <Input v-model:value="keyword" :placeholder="'请输入'">
                    <template #prefix>
                      <SearchOutlined />
                    </template>
                  </Input>
                </div>
                <div class="search-key" style="max-width: 150px">
                  <Select v-model:value="flowRange.value" style="width: 100%" :allow-clear="true" :placeholder="'选择范围'">
                    <SelectOption v-for="item in flowRange.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" style="max-width: 150px">
                  <Select v-model:value="flowStatus.value" style="width: 100%" :allow-clear="true" :placeholder="'选择状态'">
                    <SelectOption v-for="item in flowStatus.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" v-for="condition in customQueryCondition" :key="condition.key">
                  <div class="label" v-if="condition.label">{{ condition.label }}</div>
                  <RadioGroup v-if="condition.display === 'radio'" v-model:value="condition.value">
                    <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">{{ item.label }}</RadioButton>
                  </RadioGroup>
                  <Select
                    v-else-if="condition.display === 'select'"
                    v-model:value="condition.value"
                    :mode="condition.isMultiSelect ? 'multiple' : undefined"
                    style="width: 120px"
                    :allow-clear="true"
                    :placeholder="'请选择' + condition.label"
                  >
                    <SelectOption v-for="item in condition.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" style="max-width: 215px">
                  <RangePicker v-model:value="dateRange" :placeholder="[`发起日期从`, `到`]" :clearable="true" />
                </div>
                <div class="search-key" style="max-width: 350px">
                  <AntButton type="primary" @click="query"> <SearchOutlined />{{ '查询' }}</AntButton>
                  &nbsp;
                  <AntButton type="primary" @click="analyzeFlow"> <BarChartOutlined />{{ '分析' }}</AntButton>
                </div>
              </div>
              <div class="search-buttons">
                <div v-if="isCanStartFlow" class="search-key" style="min-width: 120px; margin-right: 3px">
                  <AntButton type="primary" @click="createNewFlow" style="margin-right: 5px"
                    ><i class="icon-paper-plane" style="margin-right: 1px">{{ '发起流程' }}</i></AntButton
                  >
                  <AntButton type="primary" v-for="btn of btnList" @click="btn.onClick!" style="margin-right: 5px"
                    ><i class="icon-drop" style="margin-right: 1px">{{ btn.name }}</i></AntButton
                  >
                </div>

                <div v-if="isAdmin" class="search-key" style="max-width: 300px; margin-right: 3px">
                  <Dropdown>
                    <AntButton type="primary" style="background-color: #f27140; border-color: #f27140"
                      ><i class="icon-settings" style="margin-right: 3px">{{ '设计' }}</i></AntButton
                    >
                    <template #overlay>
                      <Menu>
                        <MenuItem key="FlowRpt" @click="FlowRpt" style="text-align: center; width: 120px">
                          <i class="icon-magnifier" style="margin-right: 10px">{{ '列表设置' }}</i>
                        </MenuItem>
                        <MenuItem key="EditFlow" @click="EditFlow" style="text-align: center; width: 120px">
                          <i class="icon-settings" style="margin-right: 10px">{{ '流程设计' }}</i>
                        </MenuItem>
                      </Menu>
                    </template>
                  </Dropdown>
                </div>
                <Dropdown>
                  <AntButton type="primary" style="margin-right: 15px">{{ '更多' }}</AntButton>
                  <template #overlay>
                    <Menu>
                      <MenuItem v-for="btn in feature.options" :key="btn.key" @click="btn.onClick" style="text-align: left; width: 100px">
                        <Icon :icon="btn.icon" />
                        {{ btn.name }}
                      </MenuItem>
                    </Menu>
                  </template>
                </Dropdown>
              </div>
            </div>
          </Card>
          <search-table :loading="loading" :config="tableConfigs" :totalWidth="totalWidth" :remote="false" @update-sort="updateSort" />
        </template>
      </Spin>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, shallowRef, computed } from 'vue';
  import { SearchTable } from '/@/components/SearchComponent/index';
  // import FrmVsto from '/@/WF/FrmVsto.vue';
  import { SearchOutlined, BarChartOutlined } from '@ant-design/icons-vue';
  import { NEllipsis } from 'naive-ui/es/ellipsis';
  import { Spin, message, Card, Dropdown, Menu, MenuItem, RadioGroup, RadioButton, Tag, Tooltip } from 'ant-design-vue';
  import type { TableConfig } from '/@/components/SearchComponent/src/types';
  import { DataTableColumn } from 'naive-ui/es/data-table';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import { MapAttrs } from '../Admin/FrmLogic/MapAttrs/MapAttr';
  import { Button as AntButton, RangePicker, Input, Select, SelectOption } from 'ant-design-vue';
  import { Dayjs } from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { aoaToSheetXlsx } from '/@/components/Excel';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { AtPara } from '/@/bp/da/AtPara';
  import { debounce } from 'lodash-es';
  import Icon from '/@/components/Icon';
  import { useUserStore } from '/@/store/modules/user';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useRoute } from 'vue-router';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { DataType } from '/@/bp/en/DataType';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { FlowRptSetting } from '../Admin/AttrFlow/Rpt/FlowRptSetting';
  import { WaiGuaBaseFlow } from '/@/bp/UIEntity/WaiGuaBaseFlow';
  import { ClassFactoryOfWaiGuaFlow } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaFlow';
  // import { MapData } from '../Admin/FrmLogic/MapData';
  // const stableRef = shallowRef<InstanceType<typeof SearchTable>>();
  type RangeValue = [Dayjs, Dayjs];
  const userStore = useUserStore();
  const userInfo = userStore.getUserInfo as User;

  const FLOW_DEFAULT_ATTRS = ['billno', 'no'];
  const FLOW_TITLE_WIDTH = 320;
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const route = useRoute();
  const queryParams = route.query;
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
  const keyword = ref('');
  //参与范围
  const flowRange = reactive({
    value: 0,
    options: [
      {
        label: '我参与的',
        value: 0,
      },
      {
        label: '我发起的',
        value: 1,
      },
      {
        label: '全部范围',
        value: 2,
      },
    ],
  });
  //流程状态
  const flowStatus = reactive({
    // WebUser.IsAdmin ? 2 :
    value: 0,
    options: [
      {
        label: '新工作',
        value: 0,
      },
      {
        label: '归档',
        value: 1,
      },
      {
        label: '其他',
        value: 2,
      },
      {
        label: '全部状态',
        value: 3,
      },
    ],
  });

  // 自定义查询条件
  type CustomCondition = Array<{ label: string; key: any; display: 'select' | 'radio'; options: Array<{ label: string; value: string }>; value: any; isMultiSelect: boolean }>;
  const customQueryCondition = ref<CustomCondition>([]);
  //参与范围
  const feature = reactive({
    options: [
      // {
      //   key: 0,
      //   name: '发起',
      //   icon: 'icon-paper-plane',
      //   onClick: () => {
      //     createNewFlow();
      //   },
      // },
      // {
      //   key: 1,
      //   name: '设计表单',
      //   icon: 'icon-chart',
      //   onClick: () => {
      //     DFrm();
      //   },
      // },
      // {
      //   key: 2,
      //   name: '列表设置',
      //   icon: 'icon-settings',
      //   onClick: () => {
      //     Design();
      //   },
      // },
      // {
      //   key: 3,
      //   name: '查询条件',
      //   icon: 'icon-settings',
      //   onClick: () => {
      //     Design();
      //   },
      // },
      // {
      //   key: 3,
      //   name: '设计流程',
      //   icon: 'icon-settings',
      //   onClick: () => {
      //     DFlow();
      //   },
      // },
      {
        key: 4,
        name: '打包下载',
        icon: 'octicon:download-16',
        onClick: () => {
          BatchPackUp();
        },
      },
      {
        key: 5,
        name: '导出',
        icon: 'octicon:link-external-16',
        onClick: () => {
          deriveFlow();
        },
      },
    ],
  });

  // const changeFeature = (value) => {
  //   getOptionLabel(value);
  //   switch (getOptionLabel(value)) {
  //     case '发起':
  //       createNewFlow();
  //       break;
  //     case '分析':
  //       analyzeFlow();
  //       break;
  //     case '设计':
  //       Design();
  //       break;
  //     case '导出':
  //       deriveFlow();
  //       break;
  //   }
  // };
  // const getOptionLabel = (value) => {
  //   const option = feature.options.find((option) => option.value === value);
  //   return option ? option.label : null;
  // };
  // 获取本月初时间
  const flowNo = ref(props.params.FlowNo || props.params.PKVal?.replace('FlowRpt', ''));
  // const startOfMonth = dayjs().startOf('month');
  // 获取本月末时间
  // const endOfMonth = dayjs().endOf('month');
  const dateRange = ref<RangeValue>();
  //设计流程
  // const DFlow = async () => {
  //   //#穿透页面url地址
  //   const url = `/#/WF/Designer/EditFlow?FlowNo=${flowNo.value}`;
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  // };
  // //设计表单
  // const DFrm = async () => {
  //   //#穿透页面url地址
  //   const md = new MapData(frmID);
  //   md.No = frmID;
  //   await md.Retrieve();
  //   const url = md.UrlDesigner();
  //   //const url = `/#/WF/Designer/EditFlow?FlowNo=${flowNo.value}`;
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  // };

  const createNewFlow = async () => {
    //#穿透页面url地址
    const url = `/#/WF/MyFlow?FlowNo=${flowNo.value}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  };
  //跳转分析
  const analyzeFlow = () => {
    const url = `/src/WF/Rpt/GroupFlow.vue?FlowNo=${flowNo.value}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
  };

  const onColWidthResize = debounce(async (attrKey: string, width: number) => {
    const attr = mapAttrsInst?.find((attr) => attr.KeyOfEn == attrKey);
    if (!attr) return;
    attr.UIWidth = parseInt(width);
    await attr.Update();
  }, 200);

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
    aoaToSheetXlsx({ data, header, filename: !!props.params.FlowName ? props.params.FlowName + '.xlsx' : flow.Name + '.xlsx' });
  };
  const TableSource = ref();
  // const Design = async () => {
  //   // const url = `/src/WF/Comm/GroupPageNew?EnName=GPN_FlowRptSelectFields&PKVal=${flowNo.value}`;
  //   // const url = GloComm
  //   const url = GloComm.UrlGPN('GPN_FlowRptSelectFields', `&PKVal=${flowNo.value}`);
  //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  // };
  const frmID = 'FlowRpt' + flowNo.value;
  const PKVal = WebUser.No + frmID + '_SearchAttrs';
  const userRegedit = reactive(new UserRegedit());
  const createUserRegedit = async () => {
    userRegedit.MyPK = PKVal;
    userRegedit.SearchKey = '';
    userRegedit.AtPara = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    userRegedit.FK_Emp = WebUser.No;
    userRegedit.CfgKey = 'SearchAttrs';
    userRegedit.Vals = '';
    userRegedit.FK_MapData = '';
    userRegedit.OrderBy = '';
    userRegedit.OrderWay = '';
    await userRegedit.Insert();
  };
  const InitUserRegedit = async () => {
    userRegedit.setPKVal(PKVal);
    const code = await userRegedit.RetrieveFromDBSources();
    if (code == 0) {
      await createUserRegedit();
    } else {
      tableConfigs.itemCount = userRegedit.GetParaInt('RecCount');
      tableConfigs.pageCount = Math.ceil(tableConfigs.itemCount / tableConfigs.pageSize);
    }
  };
  const updateUR = async () => {
    let queryArgs = '';
    for (const condition of customQueryCondition.value) {
      if (condition.value) {
        queryArgs += `@${condition.key}=${condition.value}`;
      }
    }
    userRegedit.Vals = queryArgs;
    await userRegedit.Update();
    await userRegedit.RetrieveFromDBSources();
  };
  const query = async () => {
    try {
      //flowRange.value = parseInt(props?.params?.FlowRange || queryParams?.FlowRange || 0);
      //flowStatus.value = parseInt(props?.params?.FlowStatus || queryParams?.FlowStatus || 0);
      const nodeID = parseInt(queryParams?.NodeID || props?.params?.NodeID || 0);
      console.log(props?.params?.NodeID, queryParams?.NodeID);
      await updateUR();
      const DTFrom = dateRange.value?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      const DTTo = dateRange.value?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';

      loading.value = true; //获得数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo.value);
      handler.AddPara('KeyWords', keyword.value);
      handler.AddPara('DTFrom', DTFrom);
      handler.AddPara('DTTo', DTTo);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('SearchType', flowRange.value);
      handler.AddPara('WFSta', flowStatus.value);
      handler.AddPara('NodeID', nodeID);
      const data = await handler.DoMethodReturnJson('SearchFlow_Init');
      TableSource.value = data || [];
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
    pageCount: 1,
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
        FK_Flow: props.params.FlowNo,
        //IsReadonly: 1,
      };
      // ...props.params,
      const query = Object.entries(args)
        .map(([key, val]) => {
          return `${key}=${val}`;
        })
        .join('&');
      // if (WebUser.IsAdmin) {
      //   const url = `/src/WF/Comm/En.vue?EnName=TS.FlowData.GenerWorkFlowView&${query}`;
      //   console.log({ url });
      //   // wrapperRef.value?.openDrawerByUrl('BPM软件', url, '50%');
      //   wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url, '流程'));
      // } else {
      //   const url = `${location.pathname}#/WF/MyView?` + query;
      //   wrapperRef.value?.openIframe({
      //     title: row.Title,
      //     width: '60%',
      //     src: url,
      //     showFooter: false,
      //   });
      // }
      const url = `${location.pathname}#/WF/MyView?` + query;
      wrapperRef.value?.openIframe({
        title: row.Title,
        width: '85%',
        src: url,
        showFooter: false,
      });
    },
    ready: false,
  });

  type NaiveUITableSorter = {
    columnKey: string;
    order: string;
  };
  const updateSort = (sorter: NaiveUITableSorter) => {
    loading.value = true;
    tableConfigs?.columns.forEach((column) => {
      if (column.sortOrder === undefined) return;
      if (!sorter) {
        column.sortOrder = false;
        return;
      }
      if (column.key === sorter.columnKey) {
        column.sortOrder = sorter.order;
      } else {
        column.sortOrder = false;
      }
    });
    loading.value = false;
  };
  const { isDDL, isEnumSingle } = useFieldType();
  // 滚动条宽度
  const totalWidth = ref();
  // 状态map
  const WFStateMap = new Map([
    [0, { text: '空白', color: '#fff' }],
    [1, { text: '草稿', color: 'orange' }],
    [2, { text: '行进中', color: 'green' }],
    [3, { text: '归档', color: 'blue' }],
    [4, { text: '挂起', color: 'yellow' }],
    [5, { text: '退回', color: 'red' }],
    [6, { text: '移交', color: 'red' }],
    [7, { text: '删除', color: 'red' }],
    [8, { text: '加签', color: 'green' }],
  ]);
  const PRIMap = new Map([
    [0, { color: '#80a22e' }],
    [1, { color: '#ffde72' }],
    [2, { color: '#db382e' }],
  ]);

  const isAdmin = computed(() => {
    return userInfo?.IsAdmin === 1;
  });
  //显示列
  const InitMapAttrs = async () => {
    const mapAttrs = new MapAttrs();
    const flowKey = 'FlowRpt' + flowNo.value;
    await mapAttrs.Retrieve('FK_MapData', flowKey, 'Idx');
    const flowRpt = new FlowRptSetting(flowKey);
    await flowRpt.Retrieve();
    mapAttrsInst = mapAttrs;
    const hiddenColumns = ['OID', 'FlowEmps', 'WFState'];
    if (flowRpt.HideTitle) {
      hiddenColumns.push('Title');
    }
    const getColumns = () => {
      return mapAttrs
        .filter((attr) => !hiddenColumns.includes(attr.KeyOfEn))
        .filter((attr) => attr.UIVisible != 0)
        .map((attr: any) => {
          // 标题，状态，单号，发起人，发起日期，
          attr.UIHeight = attr.TextModel === 3 ? 50 : 23;
          attr.MyFieldType = 0;
          const cellData: DataTableColumn = {
            width: attr.UIWidth || 100,
            key: attr.KeyOfEn,
            title: attr.Name,
            align: 'center',
          };
          if (attr.MyDataType === DataType.AppString && attr.MyFieldType === FieldType.Normal && attr.UIContralType === UIContralType.TB) {
            cellData.width = attr.UIWidth + 20;
            cellData.render = (row: Recordable) => {
              return h(NEllipsis, { style: { minWidth: attr.UIWidth + 'px' } }, { default: () => row[`${attr.KeyOfEn}T`] || row[attr.KeyOfEn] });
            };
          }

          if (isDDL(attr) || isEnumSingle(attr)) {
            cellData.width = attr.UIWidth + 20;
            cellData.render = (row: Recordable) => {
              return h(NEllipsis, { style: { minWidth: attr.UIWidth + 'px' } }, { default: () => row[`${attr.KeyOfEn}Text`] || row[`${attr.KeyOfEn}T`] });
            };
          }
          if (FLOW_DEFAULT_ATTRS.includes(attr.KeyOfEn.toLowerCase())) {
            cellData.width = attr.UIWidth;
            cellData.render = (row: Recordable) => {
              return h(NEllipsis, { style: { minWidth: attr.UIWidth + 'px' } }, { default: () => row[attr.KeyOfEn] });
            };
          }
          if ('title' == attr.KeyOfEn.toLowerCase()) {
            cellData.width = FLOW_TITLE_WIDTH;
            cellData.align = 'left';
            cellData.render = (row: Recordable) => {
              return h(
                NEllipsis,
                {
                  style: {
                    minWidth: FLOW_TITLE_WIDTH - 20 + 'px',
                  },
                },
                {
                  default: () => {
                    return [
                      h(Tooltip, { placement: 'top', title: WFStateMap.get(parseInt(row['WFState']))?.text }, [
                        h(
                          Tag,
                          { color: WFStateMap.get(parseInt(row['WFState']))?.color, style: { marginRight: '5px' } },
                          {
                            default: () => {
                              if (row['WFState'] == 3) return WFStateMap.get(parseInt(row['WFState']))?.text[1];
                              else return WFStateMap.get(parseInt(row['WFState']))?.text[0];
                            },
                          },
                        ),
                      ]),
                      h('i', {
                        size: '16',
                        class: 'glyphicon glyphicon-bookmark',
                        style: { marginRight: '8px', color: PRIMap.get(parseInt(row['PRI']))?.color || '#ffde72' },
                      }),
                      h(
                        'a',
                        {
                          onClick: () => {
                            tableConfigs?.onRowClick?.(row);
                          },
                        },
                        row[attr.KeyOfEn],
                      ),
                    ];
                  },
                },
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
          if (attr.KeyOfEn.toLowerCase().endsWith('rdt')) {
            cellData.width = 200;
            return cellData;
          }
          cellData.resizable = true;
          // cellData.minWidth = 100;
          cellData.maxWidth = 500;
          cellData['onResize'] = (width: number) => onColWidthResize(attr.KeyOfEn, width);
          return cellData;
        });
    };
    tableConfigs.columns = [
      {
        type: 'selection',
      },
      {
        title: '#',
        key: 'Index',
        width: 40,
        align: 'center',
        render: (_, rowIndex) => {
          const realIndex = currentPageIndex.value * tableConfigs.pageSize + rowIndex + 1;
          return `${realIndex}`;
        },
      },
      // {
      //   title: '状态',
      //   key: '_sys_default_flow_status',
      //   width: 100,
      //   align: 'center',
      //   render: (row) => {
      //     return h(
      //       Tag,
      //       { color: WFStateMap.get(parseInt(row['WFState']))?.color, style: { marginRight: '5px' } },
      //       { default: () => WFStateMap.get(parseInt(row['WFState']))?.text },
      //     );
      //   },
      // },
    ].concat(getColumns() as any) as any;
    if (entityRef.value != null) {
      const btns = entityRef.value.SearchFlowRowBtns;
      if (!!btns) {
        tableConfigs.columns.push({
          key: 'operation',
          title: '操作',
          width: 100,
          align: 'center',
          render: (row) => {
            type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);
            const children: RawChildren = [];
            btns.split(',').forEach((item) => {
              children.push(
                h(
                  AntButton,
                  {
                    type: 'primary',
                    size: 'small',
                    round: true,
                    onClick: async () => {
                      //执行自定义的方法
                      const result = await entityRef.value?.BtnClick('SearchOpt', item, '', row);
                      if (!!result && result?.hasOwnProperty?.('ReturnType')) {
                        wrapperRef.value?.handleGPNCallback(result, item);
                      }
                    },
                  } as any,
                  () => item as string,
                ) as any,
              );
            });
            return h(
              'div',
              {
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                },
              },
              children,
            );
          },
        });
      }
    }

    //动态添加列时，根据列宽设置滚动条宽度
    totalWidth.value = tableConfigs.columns.reduce((acc: any, cur: any) => {
      return parseInt(acc) + parseInt(cur.width);
    }, 0);
    tableConfigs.dataSource = TableSource.value || [];
  };
  //批量打印OID
  const PackUps = ref();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
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
        let fileName = data[0].Name;
        if (!!fileName) {
          fileName = fileName.substring(fileName.indexOf('DataUser'));
          window.location.href = basePath + fileName;
        }
      }
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  //流程二开
  const FlowRpt = () => {
    const pkval = 'FlowRpt' + flowNo.value;
    const url = GloComm.UrlEn('TS.WF.FlowRptSetting', pkval);
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url, '流程二开'));
  };
  //流程设计
  const EditFlow = () => {
    const itemIDs = flowNo.value;
    const { VITE_PUBLIC_PATH } = getAppEnvConfig();
    const path = VITE_PUBLIC_PATH;
    // const { VITE_GLOB_WFPlant } = getAppEnvConfig();
    // if (VITE_GLOB_WFPlant == 'Flowable') {
    //   const url = '/#/WF/Designer/EditFlow?FlowNo=' + itemIDs;
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    // }
    const url = path + `#/WF/Comm/Entity?EnName=TS.WF.FD.FlowJiJian&FlowNo=${itemIDs}&PKVal=${itemIDs}`;
    window.open(url);
  };
  // 初始化自定义查询条件
  const initCustomQC = async () => {
    const frmID = 'FlowRpt' + flowNo.value;
    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', frmID);
    for (const en of enums) {
      if (customQueryCondition.value.find((cqc) => cqc.key == en.KeyOfEn)) {
        continue;
      }
      if (en.IsEnum == 1) {
        const sysEnums = new SysEnums();
        await sysEnums.Retrieve('EnumKey', en.KeyOfEn);
        customQueryCondition.value.push({
          display: 'select',
          options: [{ label: '全部' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: (en.StrKey || en.IntKey) + '' }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        customQueryCondition.value.push({
          display: 'select',
          options: [{ label: '全部' + en.Name, value: '' }, ...ens.map((en) => ({ label: en.Name, value: en.No + '' }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      }
    }
    const atPara = new AtPara(userRegedit.Vals);
    for (const cqc of customQueryCondition.value) {
      const storedVal = atPara.GetValStrByKey(cqc.key);
      if (storedVal) {
        cqc.isMultiSelect ? (cqc.value = [storedVal]) : (cqc.value = storedVal);
      }
    }
  };
  const isCanStartFlow = ref(false);
  //外挂
  export interface ToolbarButton {
    no: string;
    name: string;
    onClick?: Function;
  }
  const entityRef = ref<WaiGuaBaseFlow>(null);
  const btnList = ref<ToolbarButton[]>([]);
  const flow = new Flow();
  const InitSearch = async () => {
    flow.No = flowNo.value;
    await flow.Retrieve();
    isCanStartFlow.value = flow.IsCanStart == 1;
    const enName = 'WGFlow_' + flowNo.value;
    const entity = await ClassFactoryOfWaiGuaFlow.GetEn(enName as string);
    if (entity != null) {
      entityRef.value = entity;
      entityRef.value.params = props.params;
      entity.Init();
      const btns = entity.ToolbarSearchFlow;
      if (!!btns) {
        btnList.value = [];
        btns.split(',').forEach((item) => {
          btnList.value.push({
            no: item,
            name: item,
            onClick: async () => {
              const result = await entityRef.value?.BtnClick('SearchToolBar', item, tableConfigs.checkedItems.join(','), null);
              if (!!result && result?.hasOwnProperty?.('ReturnType')) {
                wrapperRef.value?.handleGPNCallback(result, item);
                return;
              }
              message.info(result);
            },
          });
        });
      }
    }

    await InitUserRegedit();
    await initCustomQC();
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
