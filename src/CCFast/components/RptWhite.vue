<template>
  <BaseComponent ref="baseComp" :close-drawer-func="InitRptWhite" :close-modal-func="InitRptWhite">
    <Spin :spinning="loading">
      <Card class="search-card" v-if="isShowToolBar">
        <div class="search-container">
          <div class="search-content">
            <!-- 关键词输入 -->
            <div v-for="kwItem in toolbarProps.keywordList" :key="kwItem.key" class="search-item">
              <Input v-model:value="kwItem.value" :placeholder="kwItem.placeholder" />
            </div>

            <!-- 第一个下拉选择 -->
            <div v-if="hasFirstSelect" class="search-item">
              <Select
                v-model:value="toolbarProps.selectList[0].value"
                :mode="toolbarProps.selectList[0].isMultiSelect ? 'multiple' : undefined"
                style="width: 100%"
                :placeholder="`请选择${toolbarProps.selectList[0].label}`"
                :disabled="toolbarProps.selectList[0].readonly"
              >
                <SelectOption v-for="item in toolbarProps.selectList[0].options" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectOption>
              </Select>
            </div>

            <!-- 日期选择器 -->
            <div v-if="hasFirstSelect" v-for="dateItem in toolbarProps.dateList" :key="dateItem.key" class="search-item date-picker">
              <RangePicker :clearable="true" v-model:value="dateItem.value" :placeholder="[dateItem.startPlaceholder!, dateItem.endPlaceholder!]" @change="dateItem.onChange" />
            </div>

            <!-- 其他选择器 -->
            <div v-for="condition in otherSelectList" :key="condition.key" class="search-item condition">
              <div v-if="condition.label" class="label">{{ condition.label }}</div>

              <!-- 单选按钮组 -->
              <RadioGroup v-if="condition.display === 'radio'" v-model:value="condition.value">
                <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">
                  {{ item.label }}
                </RadioButton>
              </RadioGroup>

              <!-- 下拉选择 -->
              <Select
                v-else-if="condition.display === 'select'"
                v-model:value="condition.value"
                :mode="condition.isMultiSelect ? 'multiple' : undefined"
                style="width: 100%"
                :allow-clear="true"
                :placeholder="`请选择${condition.label}`"
                :disabled="condition.readonly"
              >
                <SelectOption v-for="item in condition.options" :key="item.value">
                  {{ item.label }}
                </SelectOption>
              </Select>
            </div>
          </div>
          <div v-if="pageConfig.RptModel === 'RptWhite'" style="margin-right: 10px">
            <span style="margin-right: 12px; padding-left: 12px">{{ pageConfig.DTLab }}</span>
            <DatePicker v-if="isDatePicker" v-model:value="dateRef" :picker="pickerType" :format="getFormats" :locale="locale" />
            <RangePicker v-if="isRangePicker" v-model:value="dateRangeRef" :picker="pickerType" :format="getFormats" :locale="locale" />
          </div>
          <AntButton type="primary" @click="handleSearch">{{ '查询' }}</AntButton>
        </div>
      </Card>
      <div class="list-group">
        <Row type="flex" :gutter="[12, 12]" style="width: 100%; height: 100%" ref="groupRef">
          <template v-if="dataScreen.length > 0">
            <Col :span="6 * element.ColSpan" v-for="element in dataScreen" :key="element.No" :data-win-id="element.No">
              <div
                class="list-group-item"
                :style="({
              height: `calc(330px * ${element.RowSpan} + 60px)`,
            } as StyleValue)"
              >
                <div class="prop_top" v-if="!hideTitle(element.WinDocModel)">
                  <div class="icon">
                    <i :class="element.Icon"></i>
                    {{ element.Name }}
                  </div>
                  <Dropdown v-if="edit != '0'" :trigger="['click']">
                    <template #overlay>
                      <Menu @click="handleMenuClick">
                        <MenuItem key="Edit"> <EditOutlined />{{ '编辑' }}</MenuItem>
                        <!-- <MenuItem key="Power">
                        <ThunderboltOutlined />{{'权限'}}</MenuItem> -->
                        <MenuItem key="Delete"> <CloseCircleOutlined />{{ '删除' }}</MenuItem>
                        <MenuItem key="Col1"> <AppstoreOutlined />{{ '跨度1列' }}</MenuItem>
                        <MenuItem key="Col2"> <AppstoreOutlined />{{ '跨度2列' }}</MenuItem>
                        <MenuItem key="Col3"> <AppstoreOutlined />{{ '跨度3列' }}</MenuItem>
                        <MenuItem key="Col4"> <AppstoreOutlined />{{ '跨度4列' }}</MenuItem>
                      </Menu>
                    </template>
                    <Button type="primary" ghost size="small" @click="operationBtn(element.No)"> <DownOutlined />{{ '操作' }}</Button>
                  </Dropdown>
                </div>
                <div
                  class="item_body"
                  :style="({
                height: hideTitle(element.WinDocModel) ? '100%' : `calc(330px * ${element.RowSpan})`,
                overflowY: 'hidden',
              } as StyleValue)"
                  @click="OpenUrlLink(element)"
                >
                  <!-- <component v-if="element.Docs" :is="getComponentByType(element as WindowTemplate)" /> -->
                  <Empty v-if="element.hasOwnProperty('isEmpty') && element.isEmpty" />
                  <!-- Echart组件 -->
                  <ChartWindow v-else-if="isChartWindow(element.WinDocModel)" :options="element.ChartOptions" />
                  <!-- 写在前面的一段话 -->
                  <Know v-else-if="element.WinDocModel == 'Know'" />
                  <!-- 天气预报组件 -->
                  <WeatherWindow v-else-if="element.WinDocModel == 'Weather' || element.WinDocModel == 'YZ_Weather'" />
                  <!-- 流程动态组件 -->
                  <MovementFlow v-else-if="element.WinDocModel == 'MovementFlow' || element.WinDocModel == 'YZ_MovementFlow'" />
                  <!-- 待办事项 -->
                  <Self_FlowTodolist :content="element.WinDocModel" v-else-if="element.WinDocModel == 'Self_FlowDataTodolist' || element.WinDocModel == 'YZ_FlowDataTodolist'" />
                  <!-- 待办组件 -->
                  <Self_Todolist
                    :content="element.WinDocModel"
                    v-else-if="element.WinDocModel == 'Self_FlowDataTodo' || element.WinDocModel == 'Self_FlowDataTodoEmp' || element.WinDocModel == 'YZ_Todolist'"
                  />
                  <!-- 在途运行中 -->
                  <Self_Runinglist :content="element.WinDocModel" v-else-if="element.WinDocModel == 'Self_FlowDataRuning' || element.WinDocModel == 'Self_FlowDataRuningEmp'" />
                  <!-- 完成 -->
                  <Self_Completelist
                    :content="element.WinDocModel"
                    v-else-if="element.WinDocModel == 'Self_FlowDataComplete' || element.WinDocModel == 'Self_FlowDataCompleteEmp'"
                  />
                  <!-- 我发起的 -->
                  <Self_Startlist :content="element.WinDocModel" v-else-if="element.WinDocModel == 'Self_FlowDataStart' || element.WinDocModel == 'Self_FlowDataStartEmp'" />
                  <!-- 单指标 -->
                  <Self_FlowZhiBiao v-else-if="element.WinDocModel == 'Self_FlowZhiBiaoAdmin' || element.WinDocModel == 'Self_FlowZhiBiaoEmp'" />
                  <Table
                    v-else-if="element.WinDocModel == 'Table'"
                    :data-source="element.DataSource"
                    size="small"
                    :columns="element.Columns"
                    :scroll="{ x: 'max-content', y: 285 }"
                    :bordered="true"
                    :pagination="false"
                    style="width: 100%; height: 325px"
                  />
                  <div v-else-if="element.WinDocModel == 'URL'" style="width: 100%; height: 100%">
                    <iframe v-if="element.Docs" :src="element.Docs" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
                  </div>
                  <!-- 变量文本 -->
                  <div v-else-if="element.WinDocModel == 'HtmlVar'" style="width: 100%; display: flex; justify-content: space-between; flex-wrap: wrap">
                    <template v-if="Array.isArray(element.dtlData)">
                      <div
                        v-for="el in element.dtlData"
                        :key="el.MyPK"
                        style="width: 33%; display: flex; justify-content: center; align-items: center"
                        :style="({ width: element.ColSpan >= 2 ? '16.6%' : '33%' } as StyleValue)"
                      >
                        <div
                          :style="{
                            // @ts-ignore
                            color: el.FontColor.toLowerCase(),
                          }"
                          style="margin: 0 10px; font-size: 24px"
                        >
                          <i :class="el.Icon"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1; margin-bottom: 10px" class="state_value" @click="btnHandJump(el)">
                          <div style="font-size: 15px">
                            {{ el.Name }}
                          </div>
                          <div
                            :style="{
                              // @ts-ignore
                              color: el.FontColor.toLowerCase(),
                            }"
                          >
                            <CountTo v-if="isNum(parseInt(el?.Doc))" :start-val="0" :end-val="parseFloat(el.Doc) || 0" :decimals="element.Decimal" :duration="2000" />
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                  <!-- 多方块 -->
                  <div v-else-if="element.WinDocModel == 'HtmlDtls'" class="multi-box">
                    <div v-for="(el, index) in element.DBDtls" :key="index" class="box-card">
                      <!-- 标题部分 -->
                      <div class="dtlsTitle">
                        <span><i :class="el.icon" :style="{ color: el.iconColor || getRandomColor() }" style="font-size: 26px"></i></span>
                        <span style="color: #1f1f1f; font-weight: bold; font-size: 16px">{{ el.title }}</span>
                      </div>
                      <!-- 内容部分 -->
                      <div class="Contentbox">
                        <div class="Contentdocs">
                          {{ el.docs }}
                        </div>
                      </div>
                      <!-- 操作部分 -->
                      <div class="operate">
                        <div class="leftText">{{ el.leftText }}</div>
                        <div class="rightText">{{ getDate() }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="element.WinDocModel == 'SSO'" style="width: 100%; display: flex; justify-content: space-around; flex-wrap: wrap">
                    <template v-if="Array.isArray(element.dtlData)">
                      <div
                        v-for="el in element.dtlData"
                        :key="el.MyPK"
                        style="width: 33%; display: flex; justify-content: center; align-items: center"
                        :style="({ width: element.ColSpan >= 2 ? '16.6%' : '33%' } as StyleValue)"
                      >
                        <div style="padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #f0f0f0" @click="OpenUrlLink(el)">
                          <i :class="el.Icon" style="padding-right: 5px"></i>{{ el.Name }}
                        </div>
                      </div>
                    </template>
                  </div>
                  <component v-else-if="element.WinDocModel == 'VueComponent'" :is="loadComponent(element.Docs)" :key="element.No" :params="element.Params" />
                  <div v-else v-html="element.Docs"></div>
                </div>
              </div>
            </Col>
          </template>
          <Col v-if="isAdmin && !isDisabledEdit" span="6" class="add-win">
            <div class="select-guide">
              <AntButton type="primary" class="btn_style" @click="openAddDrawer('GPN_Windows', true)">{{ '新建窗体，选择向导' }}</AntButton>
              <AntButton type="primary" class="btn_style" @click="openAddDrawer('GPN_SelectFlowNo', false)">{{ '基于流程创建' }}</AntButton>
              <AntButton type="primary" class="btn_style" @click="openAddDrawer('GPN_SelectFrmID', false)">{{ '基于表单创建' }}</AntButton>
              <Divider />
              <AntButton type="primary" v-if="parentFlowInfo.id" @click="openAddDrawer('GPN_WindowFlow', true)"> 基于【{{ parentFlowInfo.title }}】流程创建 </AntButton>
              <AntButton type="primary" v-if="parentFormInfo.id" @click="openAddDrawer('GPN_WindowFrm', true)"> 基于【{{ parentFormInfo.title }}】表单创建 </AntButton>
            </div>
            <div class="switch-btn">
              <RadioGroup v-model:value="edit" button-style="solid">
                <RadioButton v-if="!gloHideHelpDoc" class="btn_radio_style" @click="onItemClick(2)">{{ '帮助' }}</RadioButton>
                <RadioButton class="btn_radio_style" :value="false" @click="onItemClick(0)">{{ '预览模式' }}</RadioButton>
                <RadioButton class="btn_radio_style" :value="true" @click="onItemClick(1)">{{ '设计模式' }}</RadioButton>
              </RadioGroup>

              <AntButton v-if="pageConfig" type="primary" ghost rounded @click="pageSetting">{{ '页面属性' }}</AntButton>
              <!-- <AntButton type="primary" ghost rounded @click="switchSta(0)">{{'预览模式'}}</AntButton>
                <AntButton type="primary" ghost rounded @click="switchSta(1)">{{'设计模式'}}</AntButton> -->
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import {
    message,
    DatePicker,
    RangePicker,
    Empty,
    MenuProps,
    Spin,
    Dropdown,
    Menu,
    MenuItem,
    Button,
    Row,
    Table,
    Button as AntButton,
    Col,
    RadioGroup,
    RadioButton,
    Divider,
    Modal,
    Input,
    Select,
    SelectOption,
    Card,
  } from 'ant-design-vue';
  import { DownOutlined, EditOutlined, CloseCircleOutlined, AppstoreOutlined } from '@ant-design/icons-vue';
  import { onMounted, ref, markRaw, StyleValue, computed, reactive, h } from 'vue';
  import { WindowTemplates, WindowTemplate } from '../Windows/Admin/WindowTemplate';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { shallowRef } from 'vue';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import Sortable from 'sortablejs';
  import Know from './Know.vue';
  import ChartWindow from './ChartWindow.vue';
  import WeatherWindow from './WeatherWindow.vue';
  import MovementFlow from './MovementFlow.vue';
  import Self_Todolist from './Self_Todolist.vue';
  import Self_FlowTodolist from './Self_FlowTodolist.vue';
  import Self_Runinglist from './Self_Runinglist.vue';
  import Self_Startlist from './Self_Startlist.vue';
  import Self_Completelist from './Self_Completelist.vue';
  import Self_FlowZhiBiao from './Self_FlowZhiBiao.vue';
  import { onUnmounted } from 'vue';
  import { WinDocModel } from '../Windows/Admin/WinDocModel';
  // import { HtmlVarDtlAttr, HtmlVarDtls } from '../Windows/HtmlVarDtl';
  import { ClassFactoryOfDataV } from '/@/WF/Comm/UIEntity/ClassFactoryOfDataV';
  import { DataVBase } from '/@/bp/UIEntity/DataVBase';
  import CountTo from '/@/components/CountTo/src/CountTo.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { windowOpen } from '/@/utils/windowOpen';
  import { RptPage } from '../Windows/RptPage/RptPage';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import WebUser from '/@/bp/web/WebUser';
  import dayjs from 'dayjs';
  import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
  import { getAppEnvConfig } from '/@/utils/env';
  import { SearchFKEnums } from '../CCBill/Admin/SearchCond/SearchFKEnum';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { ToolbarProps } from '/@/components/SearchComponent/src/types';
  import { AtPara } from '/@/bp/da/AtPara';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { DataType } from '/@/bp/en/DataType';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';

  // 处理基础组件
  const { loadComponent } = useComponentLoader();
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const route = useRoute();
  const emit = defineEmits(['update-title']);
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    edit: {
      type: [Boolean, String],
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    isDisabledEdit: {
      type: Boolean,
      default: false,
    },
  });

  const user = useUserStore();
  const userInfo = user.userInfo as unknown as Record<string, any>;
  const isAdmin = computed(() => {
    console.log(userInfo?.IsAdmin === 1);
    return userInfo?.IsAdmin === 1;
  });
  if (props.params.PageID == undefined || props.params.PageID == '') {
    // eslint-disable-next-line vue/no-mutating-props
    props.params.PageID = route.query.PageID;
  }
  const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
  const gloHideHelpDoc = ref(VITE_GLOB_HIDE_HELP_DOCS);
  const edit = ref(props.params?.edit || props.edit);
  const disabledFrmGuide = ref(true);
  const openAddDrawer = async (className, hasID) => {
    const rpt = new RptPage();
    //rpt.No = props.params.PageID;
    // await rpt.RetrieveFromDBSources();
    //debugger
    const params = {
      ...props.params,
      EnName: className,
      PageID: props.params.PageID,
      RptID: props.params.PageID,
      FrmID: parentFormInfo.id,
      FlowNo: parentFlowInfo.id,
    };
    baseComp.value?.openDrawer({
      title: '常规新建窗口',
      component: markRaw(loadComponent('/@/WF/Comm/UIEntity/GroupPageNew.vue')),
      params: hasID
        ? params
        : {
            EnName: className,
            PageID: props.params.PageID,
            RptID: props.params.PageID,
          },
      width: '1200px',
    });
  };

  const isNum = (val) => {
    return typeof val === 'number';
  };
  // 颜色池
  const colors = ref(['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#4d17e2']);
  // 判断当前是否为图表
  const isChartWindow = (type: string) =>
    ['NativeEcharts', 'ChartLine', 'ChartChina', 'ChartPie', 'ChartRate', 'ChartRing', 'ChartZZT', 'ChartRose', 'ChartLineAdv', 'ChartRadar'].includes(type);
  //数组-集合
  const dataScreen = ref<WindowTemplates>(new WindowTemplates());
  const groupRef = shallowRef<typeof Row>();

  let dataVInst: Nullable<DataVBase> = null;
  let ds = []; //数据源.
  const loading = ref(false);
  const hideTitle = (type: string) => {
    return ['Weather'].includes(type);
  };

  // 工具栏配置 start
  const pageConfig = ref();
  const userRegedit = reactive<UserRegedit>(new UserRegedit());

  const dateRef = ref();
  const dateRangeRef = ref();
  const getFormats = computed(() => {
    if (['ND', 'NDFromTo'].includes(pageConfig.value.Search)) return 'YYYY';
    if (['NY', 'NYFromTo'].includes(pageConfig.value.Search)) return 'YYYY-MM';
    if (['RQ', 'RQFromTo'].includes(pageConfig.value.Search)) return 'YYYY-MM-DD';
    return 'YYYY-MM';
  });

  const isDatePicker = computed(() => {
    return ['ND', 'NY', 'RQ'].includes(pageConfig.value.Search);
  });

  const isRangePicker = computed(() => {
    return ['NDFromTo', 'NYFromTo', 'RQFromTo'].includes(pageConfig.value.Search);
  });

  const pickerType: any = computed(() => {
    const sType = pageConfig.value.Search;
    if (sType == 'ND') return 'year'; //RQ
    if (sType == 'NY') return 'month';
    if (sType == 'RQ') return 'date';
    if (sType == 'NDFromTo') return 'year'; //RQFrom, RQTo
    if (sType == 'NYFromTo') return 'month';
    if (sType == 'RQFromTo') return 'date';
    return 'year';
  });

  const handleDateRangeStr = (dateRangeStr: string) => {
    if (!!dateRangeStr) {
      if (dateRangeStr.includes('@')) {
        const dateRange = dateRangeStr.split('@');
        return [handleDateStr(dateRange[0]), handleDateStr(dateRange[1])];
      }
      return [handleDateStr('', true), handleDateStr('')];
    }
    return [dayjs(), dayjs()];
  };
  const handleDateStr = (dateStr: string, isFirstNode = false) => {
    if (!!dateStr) {
      if (dateStr.length != getFormats.value.length) return dayjs();
      const dt = dayjs(dateStr, getFormats.value);
      if (!dt.isValid()) {
        if (isFirstNode) {
          return dayjs(Date.now() - 86400000, getFormats.value);
        }
        return dayjs(Date.now(), getFormats.value);
      }
      return dayjs(dateStr, getFormats.value);
    }
    return dayjs();
  };
  const isShowToolBar = ref(false);
  const InitRptWhite = async () => {
    // init page config
    pageConfig.value = undefined;
    const PageID = props.params?.PageID;
    if (!PageID) {
      await InitPage();
      return;
    }
    const rConfig = new RptPage(PageID);
    if (!(await rConfig.IsExits())) {
      await rConfig.Insert();
    }
    await rConfig.RetrieveFromDBSources();

    rConfig.FrmID && (parentFormInfo.id = rConfig.FrmID);
    rConfig.FrmName && (parentFormInfo.title = rConfig.FrmName);

    rConfig.FlowNo && (parentFlowInfo.id = rConfig.FlowNo);
    rConfig.FlowName && (parentFlowInfo.title = rConfig.FlowName);

    pageConfig.value = rConfig;
    // init search config
    const URPK = PageID + '_' + WebUser.No;
    userRegedit.setPKVal(URPK);
    const exist = await userRegedit.IsExits();
    if (!exist) {
      userRegedit.SearchKey = '';
      userRegedit.AtPara = '';
      userRegedit.DTFrom = '';
      userRegedit.DTTo = '';
      userRegedit.FK_Emp = WebUser.No;
      userRegedit.CfgKey = PageID;
      userRegedit.Vals = '';
      userRegedit.FK_MapData = '';
      userRegedit.OrderBy = '';
      userRegedit.OrderWay = '';
      await userRegedit.Insert();
    }
    await userRegedit.Retrieve();
    if (pageConfig.value.Search == 'None') {
      dateRef.value = dayjs();
      dateRangeRef.value = [dayjs(), dayjs()];
    }
    if (isDatePicker.value) {
      dateRef.value = handleDateStr(userRegedit.Vals);
    }
    if (isRangePicker.value) {
      dateRangeRef.value = handleDateRangeStr(userRegedit.Vals);
    }
    isShowToolBar.value = rConfig.IsShowSearchCond === 1 ? true : false;
    if (isShowToolBar.value) await SearchToolBar();
    await InitPage();
  };
  const toolbarProps = reactive<ToolbarProps>({
    dateList: [],
    selectList: [],
    buttonList: [],
    keywordList: [],
  });
  const booleanToRadioGroup = (attrName) => {
    return [
      { label: attrName, value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ];
  };
  const mapData = new MapData();
  const SearchToolBar = async () => {
    toolbarProps.dateList = [];
    toolbarProps.selectList = [];
    toolbarProps.keywordList = [];
    const rptModel = pageConfig.value.RptModel;
    //通用大屏
    if (rptModel === 'RptWhite') {
      const keySearch = pageConfig.value.KeySearch;
      if (keySearch === 'Like') {
        toolbarProps.keywordList = [
          {
            label: '关键字',
            key: 'SearchKey',
            value: userRegedit.SearchKey || '',
            placeholder: '请输入关键字',
          },
        ];
      }
      //指定字段查询
      if (keySearch === 'KeyWords') {
        const stringSearchKeys = pageConfig.value.KeyWords || '';
        if (!!stringSearchKeys) {
          const atPara = new AtPara(stringSearchKeys);
          toolbarProps.keywordList = [];
          atPara.HisHT.forEach((value, key) => {
            toolbarProps.keywordList.push({
              label: value,
              key: key,
              value: userRegedit.GetParaString(key) || '',
              placeholder: '请输入' + value,
            });
          });
        }
      }
      const searchEnums = new SearchFKEnums();
      await searchEnums.Retrieve('FrmID', pageConfig.value.No);

      for (const en of searchEnums) {
        if (en.IsEnum == 1) {
          const sysEnums = new SysEnums();
          await sysEnums.Retrieve('EnumKey', en.UIBindKey);
          console.log({ sysEnums });
          toolbarProps.selectList.push({
            display: 'select',
            options: [{ label: '' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: en.StrKey || en.IntKey }))],
            isMultiSelect: en.IsMultiSelect == 1,
            label: '',
            key: en.KeyOfEn,
            value: en.IsMultiSelect == 0 ? '' : [],
          });
        } else if (en.IsEnum == 0 && en.UIBindKey == '') {
          toolbarProps.selectList.push({
            display: 'select',
            options: [
              { label: '' + en.Name, value: '' },
              { label: '是', value: '1' },
              { label: '否', value: '0' },
            ],
            isMultiSelect: en.IsMultiSelect == 1,
            label: '',
            key: en.KeyOfEn,
            value: en.IsMultiSelect == 0 ? '' : [],
          });
        } else {
          const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
          await sfTable.Retrieve();
          const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
          toolbarProps.selectList.push({
            display: 'select',
            options: [{ label: '' + en.Name, value: '' }, ...ens.map((en) => ({ label: en.Name, value: en.No }))],
            isMultiSelect: en.IsMultiSelect == 1,
            label: '',
            key: en.KeyOfEn,
            value: en.IsMultiSelect == 0 ? '' : [],
          });
        }
      }
      return;
    }
    //高代码
    if (rptModel === 'EntityRptWhite') {
      const ens = await ClassFactory.GetEns(pageConfig.value.FrmID);
      const enInst = ens.GetNewEntity;
      const { getDDLData } = useDDLDataLoader(enInst);
      const { searchFields, searchFKEnums, attrs } = enInst?._enMap;
      const searchNormals = enInst?._enMap.searchNormals.filter((condition) => !condition.IsHidden);
      toolbarProps.keywordList = [];
      if (searchFields.length > 0) {
        for (const searchField of searchFields) {
          toolbarProps.keywordList.push({
            label: searchField.label,
            key: searchField.searchKey,
            value: userRegedit.GetParaString(searchField.searchKey) || '',
            placeholder: '请输入' + searchField.label,
          });
        }
      } else {
        toolbarProps.keywordList = [
          {
            label: '关键字',
            key: 'SearchKey',
            value: userRegedit.SearchKey || '',
            placeholder: '请输入关键字',
          },
        ];
      }
      const dtAttrs = attrs.filter((attr) => attr.MyDataType == DataType.AppDate || attr.MyDataType == DataType.AppDateTime);
      if (dtAttrs.length > 0) {
        toolbarProps.dateList = [
          {
            label: '日期范围',
            key: dtAttrs[0].Key,
            type: 'daterange',
            value: null,
            strValue: '',
            startPlaceholder: '从',
            endPlaceholder: '到',
            onChange: () => void 0,
          },
        ];
        toolbarProps.selectList = [
          {
            display: 'select',
            options: dtAttrs.map((attr) => ({ label: attr.Desc, value: attr.Key })),
            isMultiSelect: false,
            label: '日期字段',
            value: dtAttrs[0].Key,
            key: 'date-query-key',
          },
        ];
      }
      // 处理外键
      for await (const sn of searchFKEnums) {
        const attr = attrs.find((attr) => attr.Key === sn.Key);
        if (!attr) continue;
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + attr.Desc, value: '' }, ...(attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : await getDDLData(attr))],
          isMultiSelect: false,
          label: '',
          key: attr.Key,
          value: '',
        });
      }
      for await (const sn of searchNormals) {
        const attr = attrs.find((attr) => attr.Key === sn.Key);
        if (!attr) continue;
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + attr.Desc, value: '' }, ...(attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : await getDDLData(attr))],
          isMultiSelect: false,
          label: '',
          key: attr.Key,
          value: '',
        });
      }
      return;
    }
    //流程、单据、实体大屏
    const frmID = rptModel === 'FlowRptWhite' ? 'FlowRpt' + pageConfig.value.FlowNo : pageConfig.value.FrmID;
    mapData.No = frmID;
    await mapData.RetrieveFromDBSources();
    const isSearchKey = mapData.GetParaInt('IsSearchKey') || 0;
    if (isSearchKey == 1) {
      toolbarProps.keywordList = [
        {
          label: '关键字',
          key: 'SearchKey',
          value: userRegedit.SearchKey || '',
          placeholder: '请输入关键字',
        },
      ];
    }
    if (isSearchKey == 2) {
      const stringSearchKeys = mapData.GetValStringByKey('StringSearchKeys') || '';
      if (!!stringSearchKeys) {
        const stringSearchKeysT = mapData.GetValStringByKey('StringSearchKeysT') || '';
        const keys = stringSearchKeys.split(',');
        const keyNames = stringSearchKeysT.split(',');
        toolbarProps.keywordList = [];
        keys.forEach((item, idx) => {
          toolbarProps.keywordList.push({
            label: keyNames[idx],
            key: item,
            value: userRegedit.GetParaString(item) || '',
            placeholder: '请输入' + keyNames[idx],
          });
        });
      }
    }

    toolbarProps.dateList = [
      {
        label: '日期范围',
        key: 'RDT',
        type: 'daterange',
        value: null,
        strValue: '',
        startPlaceholder: '从',
        endPlaceholder: '到',
        onChange: () => void 0,
      },
    ];
    const dtSearchWay = mapData.GetParaInt('DTSearchWay') || 0;
    //按照指定字段查询
    const dtSearchKey = mapData.GetParaString('DTSearchKey') || '';

    const searchDateFrom = userRegedit.DTFrom || '';
    const searchDateTo = userRegedit.DTTo || '';
    let dateVal: any = undefined;
    if (searchDateFrom && searchDateTo) {
      dateVal = [dayjs(searchDateFrom, 'YYYY-MM-DD'), dayjs(searchDateTo, 'YYYY-MM-DD')];
    }
    const dateAttrs = new MapAttrs();
    await dateAttrs.Retrieve('FK_MapData', frmID, 'MyDataType');
    const targetDateAttrs = dateAttrs.filter((attr) => {
      if (dtSearchWay === 1) return attr.MyDataType == 7 || attr.MyDataType == 6;
      if (dtSearchWay === 2 && !!dtSearchKey) {
        return (attr.MyDataType == 7 || attr.MyDataType == 6) && dtSearchKey.split(',').includes(attr.KeyOfEn);
      }
    });
    if ((dtSearchWay === 1 || dtSearchWay === 2) && targetDateAttrs.length > 0) {
      toolbarProps.selectList = [
        {
          display: 'select',
          options: targetDateAttrs.map((attr) => ({ label: attr.Name, value: attr.KeyOfEn })),
          isMultiSelect: false,
          label: '日期字段',
          value: targetDateAttrs[0].KeyOfEn,
          key: 'date-query-key',
        },
      ];
      toolbarProps.dateList[0].key = targetDateAttrs[0].KeyOfEn;
    }
    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', frmID);

    for (const en of enums) {
      if (en.IsEnum == 1) {
        const sysEnums = new SysEnums();
        await sysEnums.Retrieve('EnumKey', en.UIBindKey);
        console.log({ sysEnums });
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: en.StrKey || en.IntKey }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else if (en.IsEnum == 0 && en.UIBindKey == '') {
        toolbarProps.selectList.push({
          display: 'select',
          options: [
            { label: '' + en.Name, value: '' },
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        toolbarProps.selectList.push({
          display: 'select',
          options: [{ label: '' + en.Name, value: '' }, ...ens.map((en) => ({ label: en.Name, value: en.No }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      }
    }
  };
  const hasFirstSelect = computed(() => Array.isArray(toolbarProps.selectList) && toolbarProps.selectList.length > 0 && toolbarProps.selectList[0].key === 'date-query-key');
  const otherSelectList = computed(() => toolbarProps.selectList.filter((item) => item.key !== 'date-query-key'));
  const handleSearch = async () => {
    if (isDatePicker.value) {
      userRegedit.Vals = `${dateRef.value.format(getFormats.value)}`;
    }
    if (isRangePicker.value) {
      userRegedit.Vals = `${dateRangeRef.value[0].format(getFormats.value)}@${dateRangeRef.value[1].format(getFormats.value)}`;
    }
    await userRegedit.Update();
    await InitPage();
  };
  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format('YYYY-MM-DD');
    }
    return '';
  };
  const SearchPara = () => {
    let paras = '';
    if (toolbarProps.keywordList.length > 0) {
      if (toolbarProps.keywordList?.[0].key === 'SearchKey') {
        paras += '@SearchKey=' + toolbarProps.keywordList?.[0]?.value || '';
      } else {
        paras += '@SearchKey=';
        if (Array.isArray(toolbarProps.keywordList)) {
          toolbarProps.keywordList.forEach((item) => {
            paras += `@${item.key}=${item.value}`;
          });
        }
      }
    }

    // 处理查询条件
    if (Array.isArray(toolbarProps.selectList)) {
      for (const condition of toolbarProps.selectList) {
        if (condition.key === 'date-query-key') {
          if (condition.value !== '') {
            const dateFrom = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[0]);
            const dateTo = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[1]);
            paras += '@RQKey=' + toolbarProps.dateList?.[0]?.key + '@RQFrom=' + dateFrom + '@RQTo=' + dateTo;
          }
          continue;
        }
        //T字段值
        const object = condition.options.find((item) => item.value === condition.value);
        if (!!object) paras += `@${condition.key}T=${object.label}`;
        else paras += `@${condition.key}T=''`;

        paras += `@${condition.key}=${condition.value}`;
      }
    }
    if (pageConfig.value.RptModel === 'RptWhite') {
      let rq = '';
      let rqRange = '';
      if (!!dateRangeRef.value) {
        rq = `${dateRangeRef.value[0].format(getFormats.value)}`;
        rqRange = `${dateRangeRef.value[1].format(getFormats.value)}`;
      } else {
        rq = `${dateRef.value.format(getFormats.value)}`;
      }
      paras += `@RQS=${rq}@RQFrom=${rq}@RQTo=${rqRange}`;
    }

    return paras;
  };
  // end

  const InitPage = async () => {
    try {
      loading.value = true;
      //高代码.
      if (props.className.trim().length > 0) {
        const dataVObj = await ClassFactoryOfDataV.GetEn(props.className);
        dataVObj.SetParams(props.params);
        await dataVObj.Init();
        dataScreen.value = dataVObj.ChartList;
        dataVInst = dataVObj;
        emit('update-title', dataVObj.PageTitle);
      } else {
        const PageID = props.params?.PageID;
        //低代码.
        if (!PageID) {
          message.error('没有传入PageID');
          return;
        }
        // await dataScreen.value.Retrieve(WindowTemplateAttr.PageID, PageID, 'Idx');
        const handler = new HttpHandler('BP.CCFast.DataV_Lowcode');
        handler.AddPara('PageID', PageID);

        if (isShowToolBar.value) {
          //handler.AddPara('Para', `@RQS=${rq}@RQFrom=${rq}@RQTo=${rqRange}`);
          handler.AddPara('Para', SearchPara());
        }
        ds = (await handler.DoMethodReturnJson('Init_LowcodePage')) || [];
        dataScreen.value = ds['Windows'];
      }
      //富文本样式修改.
      for (const win of dataScreen.value) {
        try {
          win.disabled = false;

          if (win.WinDocModel === WinDocModel.NativeEcharts) {
            win.ChartOptions = Object.freeze(JSON.parse(win.Docs));
          }
          if (win.WinDocModel === WinDocModel.SSO) {
            if (dataVInst) {
              const dtls = dataVInst.DtlList.filter((item) => item.RefPK === win.No);
              win.dtlData = dtls;
            } else {
              const dtl = ds['SSODtls' + win.No];
              //渲染文本变量样式
              win.dtlData = dtl;
            }
          }
          if (win.WinDocModel === WinDocModel.Html) {
            win.Docs = win.Docs.replace(/<li/g, "<li style='margin-top:8px;font-size:16px;'").replace(/<b/g, "<b style='font-size:16px'");
          }
          if (win.WinDocModel === WinDocModel.HtmlVar) {
            if (dataVInst) {
              const dtls = dataVInst.DtlList.filter((item) => item.RefPK === win.No);
              const results = dtls.map((en) => en.Exp0);
              await Promise.all(results);
              for (let i = 0; i < dtls.length; i++) {
                dtls[i].Doc = results[i];
              }
              for (const en of dtls) {
                en.SetValByKey('Doc', en.Exp0);
              }
              win.dtlData = dtls;
            } else {
              const dtl = ds['HtmlVarDtls' + win.No];
              //  new HtmlVarDtls();
              // await dtl.Retrieve(HtmlVarDtlAttr.RefPK, win.No);
              for (const dt of dtl) {
                dt['Doc'] = dt.Exp0;
              }
              //渲染文本变量样式
              win.dtlData = dtl;
            }
          }
          //表格
          if (win.WinDocModel === WinDocModel.Table) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            const keys = Object.keys(data[0]);

            const minWidth = 80;
            const maxWidth = 300;
            const charWidth = 10; // 假设每个字符的宽度大约为 10px
            const tag1 = win.Tag1 || '';
            const columns = tag1.split(',');
            win.Columns = keys.map((key, index) => {
              // 找到该列中最长的数据项
              const maxLength = Math.max(key.length, ...data.map((item) => (item[key] ? item[key].toString().length : 0)));

              // 计算宽度，限制在最小和最大宽度之间
              const width = Math.max(minWidth, Math.min(maxLength * charWidth, maxWidth));
              const title = !!tag1 && columns.length >= index + 1 ? columns[index] : key;
              return {
                title: title,
                dataIndex: key,
                key: key,
                width: width,
              };
            });
            if (!!win.DtlExp) {
              win.Columns.push({
                key: 'operation',
                title: '操作',
                width: 100,
                align: 'center',
                customRender: (row) =>
                  h(
                    'a',
                    {
                      onClick: () => {
                        let params = '';
                        for (const key in row.record) {
                          params += '&' + key + '=' + row.record[key];
                        }
                        //查看明细
                        const openWay = win.DtlOpenWay;

                        const url = GloComm.UrlGenerList('GL_Jump', params + '&PKVal=' + win.No);
                        //`@0=抽屉50%@1=抽屉70%@2=抽屉90%@3=弹窗打开@4=新窗口打开
                        if (openWay === 0 || openWay === 1 || openWay === 2) baseComp.value?.openDrawerByUrl('明细', url, openWay === 0 ? '50%' : openWay === 1 ? '70%' : '90%');
                        if (openWay === 3) {
                          baseComp.value?.openModalByUrl('明细', url, null, win.DtlW, win.DtlH);
                        }
                        if (openWay === 4) {
                          windowOpen('/#/WF/GenerList?EnName=GL_Jump' + params + '&PKVal=' + win.PKVal);
                        }
                      }, // 点击事件处理
                    },
                    '查看详情',
                  ),
              });
            }
            win.DataSource = data;
          }

          //  中国地图
          if (win.WinDocModel === WinDocModel.ChartChina) {
            // const data = await DBAccess.RunSQLReturnTable(win.Docs);
            win.ChartOptions = {
              backgroundColor: 'rgb(121, 145, 209)',
              geo: {
                map: 'china',
                aspectScale: 0.75, // scale地图长宽比
                zoom: 1.1,
                itemStyle: {
                  normal: {
                    areaColor: {
                      type: 'radial',
                      x: 0.5,
                      y: 0.5,
                      r: 0.8,
                      colorStops: [
                        {
                          offset: 0,
                          color: '#09132c', // 0%处的颜色
                        },
                        {
                          offset: 1,
                          color: '#274d68', // 100%处的颜色
                        },
                      ],
                      globalCoord: true,
                    },
                    shadowColor: 'rgb(58, 115, 192)',
                    shadowOffsetX: 10,
                    shadowOffsetY: 11,
                  },
                },
                regions: [
                  {
                    name: '南海诸岛',
                    itemStyle: {
                      opacity: 0,
                    },
                  },
                ],
              },
              series: [
                {
                  // 配置地图相关参数,绘制地图,这个对象是关于地图图表的相关设置
                  type: 'map',
                  label: {
                    normal: {
                      show: true,
                      textStyle: {
                        color: '#1DE9B6',
                      },
                    },
                    emphasis: {
                      textStyle: {
                        color: 'rgb(183, 185, 14)',
                      },
                    },
                  },
                  zoom: 1.1,
                  map: 'china',
                  itemStyle: {
                    normal: {
                      backgroundColor: 'rgb(147, 235, 248)',
                      borderWidth: 1,
                      areaColor: {
                        type: 'radial',
                        x: 0.5,
                        y: 0.5,
                        r: 0.8,
                        colorStops: [
                          {
                            offset: 0,
                            color: 'rgb(31, 54, 150)', // 0%处的颜色
                          },
                          {
                            offset: 1,
                            color: 'rgb(89, 128, 142)', // 100%处的颜色
                          },
                        ],
                        globalCoord: true,
                      },
                    },
                    emphasis: {
                      areaColor: 'rgb(46, 229, 206)',
                      borderWidth: 0.1,
                    },
                  },
                },
              ],
            };
          }
          //  百分比扇形图
          if (win.WinDocModel === WinDocModel.ChartRate) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            const dataRate = data.map((item, index) => {
              return {
                name: item.Name,
                value: item.Num,
                customData: { PKVal: win.No, Key: index == 0 ? 'FZ' : 'FM', DtlOpenWay: win.DtlOpenWay, IsOpen: !!win.DtlExp, DtlW: win.DtlW, DtlH: win.DtlH },
              };
            });
            win.ChartOptions = {
              tooltip: {
                show: true,
                formatter: '{a} <br/>{b} : {c} ({d}%)',
              },
              series: [
                {
                  name: '访问来源',
                  type: 'pie',
                  radius: ['10%', '50%'],
                  center: ['50%', '40%'],
                  label: {
                    narmal: {
                      show: true,
                      formatter: '{a} <br/>{b} : {c} ({d}%)',
                    },
                  },
                  roseType: 'area',
                  itemStyle: {
                    borderRadius: 8,
                  },
                  data: dataRate,
                },
              ],
            };
          }
          //  柱状图
          if (win.WinDocModel === WinDocModel.ChartZZT) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            // let docs = GloWF.DealExp(win.Docs, {});
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);

            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              try {
                dataC0Ens = JSON.parse(win.C0Ens) || [];
              } catch (e) {
                dataC0Ens = win.C0Ens || [];
              }
            }
            // 先拿到keys
            if (data.length === 0) {
              win.isEmpty = true;
              continue;
            }
            const keys = Object.keys(data[0]);
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            //获取下拉数据数组dataC0Ens，遍历dataC0Ens并替换数组data中的获取到的枚举值
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const xKey = Object.keys(data[0]).slice(0, 1);
            const dataSeries = fenxiData.map((item, index) => {
              return {
                name: item,
                type: 'bar',
                data: nonNullData.map((arr, keyIdx) => {
                  return {
                    value: arr[item],
                    customData: { PKVal: win.No, Key: nonNullData[keyIdx][xKey[index]], DtlOpenWay: win.DtlOpenWay, IsOpen: !!win.DtlExp, DtlW: win.DtlW, DtlH: win.DtlH },
                  };
                }),
              };
            });
            // 至少需要两个维度
            if (keys.length < 2) {
              return;
            }
            win.ChartOptions = {
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true,
              },
              xAxis: [
                {
                  type: 'category',
                  data: dataSource,
                  axisTick: {
                    alignWithLabel: true,
                  },
                },
              ],
              yAxis: [
                {
                  type: 'value',
                },
              ],
              series: dataSeries,
            };
          }
          //  圆环比率
          if (win.WinDocModel === WinDocModel.ChartRing) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            if (keys.length > 2) {
              continue;
            }
            let dataRing: { name: string; value: unknown }[] = [];
            if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
              dataRing = dataC0Ens.map((item) => {
                return {
                  name: item.Name,
                  value: data.find((en) => item.No === en[keys[0]])?.[keys[1]],
                  customData: {
                    PKVal: win.No,
                    Key: data.find((en) => item.No === en[keys[0]])?.[keys[0]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  },
                };
              });
            } else {
              dataRing = data.map((item) => {
                return {
                  name: item[keys[0]],
                  value: item[keys[1]],
                  customData: {
                    PKVal: win.No,
                    Key: item[keys[0]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  },
                };
              });
            }

            win.ChartOptions = {
              tooltip: {
                trigger: 'item',
              },
              legend: {
                top: '5%',
                left: 'center',
              },
              series: [
                {
                  name: '数据',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                  },
                  label: {
                    show: false,
                    position: 'center',
                  },
                  labelLine: {
                    show: false,
                  },
                  data: dataRing,
                },
              ],
            };
          }
          //  饼图
          if (win.WinDocModel === WinDocModel.ChartPie) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            if (keys.length > 2) {
              continue;
            }
            let dataPie: { name: string; value: unknown }[] = [];
            if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
              dataPie = dataC0Ens.map((item) => {
                return {
                  name: item.Name,
                  value: data.find((en) => item.No === en[keys[0]])?.[keys[1]],
                  customData: {
                    PKVal: win.No,
                    Key: data.find((en) => item.No === en[keys[0]])?.[keys[0]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  },
                };
              });
            } else {
              dataPie = data.map((item) => {
                return {
                  name: item[keys[0]],
                  value: item[keys[1]],
                  customData: { PKVal: win.No, Key: item[keys[0]], DtlOpenWay: win.DtlOpenWay, IsOpen: !!win.DtlExp, DtlW: win.DtlW, DtlH: win.DtlH },
                };
              });
            }
            win.ChartOptions = {
              title: {
                left: 'center',
              },
              tooltip: {
                trigger: 'item',
              },
              series: [
                {
                  // name: 'Access From',
                  type: 'pie',
                  radius: '50%',
                  data: dataPie,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            };
          }
          //  折线图
          if (win.WinDocModel === WinDocModel.ChartLine) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs) || [];
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            // 先拿到keys
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            //获取下拉数据数组dataC0Ens，遍历dataC0Ens并替换数组data中的获取到的枚举值
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const xKey = Object.keys(data[0]).slice(0, 1);
            const dataSeries = fenxiData.map((item, index) => {
              return {
                name: item,
                type: 'line',
                data: nonNullData.map((arr, keyIdx) => {
                  return {
                    value: arr[item],
                    customData: { PKVal: win.No, Key: nonNullData[keyIdx][xKey[index]], DtlOpenWay: win.DtlOpenWay, IsOpen: !!win.DtlExp, DtlW: win.DtlW, DtlH: win.DtlH },
                  };
                }),
              };
            });
            // 至少需要两个维度
            if (keys.length < 2) {
              continue;
            }
            win.ChartOptions = {
              xAxis: {
                type: 'category',
                data: dataSource,
              },
              yAxis: {
                type: 'value',
              },
              series: dataSeries,
              tooltip: {
                trigger: 'axis',
              },
            };
          }
          //  高级折线图
          if (win.WinDocModel === WinDocModel.ChartLineAdv) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs) || [];
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            // 先拿到keys
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            //获取下拉数据数组dataC0Ens，遍历dataC0Ens并替换数组data中的获取到的枚举值
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const xKey = Object.keys(data[0]).slice(0, 1);
            const dataSeries = fenxiData.map((item, index) => {
              return {
                name: item,
                type: 'line',
                smooth: true,
                data: nonNullData.map((arr, keyIdx) => {
                  return {
                    value: arr[item],
                    customData: { PKVal: win.No, Key: nonNullData[keyIdx][xKey[index]], DtlOpenWay: win.DtlOpenWay, IsOpen: !!win.DtlExp, DtlW: win.DtlW, DtlH: win.DtlH },
                  };
                }),
                areaStyle: {
                  // color: colors[index % colors.value.length], // 使用颜色数组中的颜色，循环使用
                  shadowColor: 'rgba(0,0,0,0.1)', // 设置区域填充颜色，这里使用了透明度
                },
              };
            });
            // 至少需要两个维度
            if (keys.length < 2) {
              continue;
            }
            win.ChartOptions = {
              xAxis: {
                type: 'category',
                data: dataSource,
              },
              yAxis: {
                type: 'value',
              },
              series: dataSeries,
              tooltip: {
                trigger: 'axis',
              },
            };
          }
          //  南丁格尔玫瑰图
          if (win.WinDocModel === WinDocModel.ChartRose) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            if (keys.length > 2) {
              continue;
            }

            let dataPie: { name: string; value: unknown }[] = [];
            if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
              dataPie = dataC0Ens.map((item) => {
                return {
                  name: item.Name,
                  value: data.find((en) => item.No === en[keys[0]])?.[keys[1]],
                  customData: {
                    PKVal: win.No,
                    Key: data.find((en) => item.No === en[keys[0]])?.[keys[0]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  },
                };
              });
            } else {
              dataPie = data.map((item) => {
                return {
                  name: item[keys[0]],
                  value: item[keys[1]],
                  customData: {
                    PKVal: win.No,
                    Key: item[keys[0]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  },
                };
              });
            }
            win.ChartOptions = {
              title: {
                left: 'center',
              },
              tooltip: {
                trigger: 'item',
              },
              series: [
                {
                  type: 'pie',
                  radius: '50%',
                  roseType: 'radius',
                  data: dataPie,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            };
          }
          //  雷达图
          if (win.WinDocModel === WinDocModel.ChartRadar) {
            if (typeof win.Docs === 'string' && win.Docs.includes('err@')) {
              Modal.error({
                title: () => h('span', win.Name + '获取信息报错'),
                content: () => h('span', win.Docs.replace('err@', '')),
              });
              continue;
            }
            const data = typeof win.Docs === 'object' ? win.Docs : JSON.parse(win.Docs);
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = JSON.parse(win.C0Ens) || [];
            }
            // 先拿到keys
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            if (keys.length > 2) {
              continue;
            }
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const xKey = Object.keys(data[0]).slice(0, 1);
            const dataSeries = fenxiData.map((item, index) => {
              return {
                value: nonNullData.map((arr) => arr[item]),
                customData: nonNullData.map((arr, keyIdx) => {
                  return {
                    PKVal: win.No,
                    Key: nonNullData[keyIdx][xKey[index]],
                    DtlOpenWay: win.DtlOpenWay,
                    IsOpen: !!win.DtlExp,
                    DtlW: win.DtlW,
                    DtlH: win.DtlH,
                  };
                }),
              };
            });
            const dataIndicator = dataSource.map((item) => {
              return {
                text: item,
              };
            });
            win.ChartOptions = {
              tooltip: {
                trigger: 'axis',
              },
              legend: {
                top: 'bottom',
                left: 'center',
              },
              radar: [
                {
                  indicator: dataIndicator,
                },
              ],
              series: [
                {
                  type: 'radar',
                  tooltip: {
                    trigger: 'item',
                  },
                  areaStyle: {},
                  data: dataSeries,
                },
              ],
            };
          }
        } catch (e) {
          win.isEmpty = true;
          continue;
        }
      }
      IsSortable();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  const IsSortable = () => {
    if (edit.value !== '0' && edit.value !== false && edit.value !== 0) {
      InitSortablejs();
    }
  };
  //跳转大屏帮助文档
  const openDocument = () => {
    window.open('https://docs.qq.com/doc/DRFBma2hJSGNMQnpI', '_blank');
  };
  const CurrentNo = ref<string>();
  const operationBtn = (No) => {
    CurrentNo.value = No;
  };
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    const en = new WindowTemplate();
    en.No = CurrentNo.value;
    await en.RetrieveFromDBSources();
    if (e.key == 'Edit') {
      let model = en.WinDocModel;
      // 新增条件判断：如果 model 以 YZ_ 开头
      if (model?.startsWith('YZ_')) {
        message.error('当前模型不可编辑！');
        return;
      }
      if (model == 'Table') {
        model = 'WinTable';
      }
      const url = GloComm.UrlEn('TS.CCFast.Windows.' + model, en.No);
      const cb = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '编辑');
      baseComp.value?.handleGPNCallback(cb);
      return;
    }
    if (e.key == 'Col1') {
      en.ColSpan = 1;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col2') {
      en.ColSpan = 2;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col3') {
      en.ColSpan = 3;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col4') {
      en.ColSpan = 4;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Delete') {
      if (window.confirm('您确定要删除吗?') == false) return;
      await en.Delete();
      await InitPage();
      return;
    }
    if (e.key == 'Power') {
      message.error('没权限！');
    }
  };
  let sortabeljsInst: Nullable<Sortable> = null;
  const InitSortablejs = () => {
    const el = groupRef.value?.$el;
    if (!el) {
      return;
    }
    sortabeljsInst = new Sortable(el, {
      animation: 200,
      ghostClass: 'ghost',
      dataIdAttr: 'data-win-id',
      onEnd: async (ev) => {
        const sortedList = sortabeljsInst?.toArray() || [];
        const targetList = sortedList.filter((item) => /^\d+$/.test(item)).join(',');
        console.log('targetList', targetList);
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_GPM_Window');
        handler.AddPara('MyPKs', targetList);
        const msg = await handler.DoMethodReturnString('Default_Mover');
        message.success(msg);
      },
    });
  };

  const handleSelfUrl = (MoreUrl: string) => {
    const urlPrefix = window.location.origin + '/#/';
    return MoreUrl.replace('self://', urlPrefix);
  };

  const MoreUrl = ref<string>('');

  //打开url链接
  const OpenUrlLink = (origin) => {
    const MoreLab = origin.MoreLab || origin.Name; //更多链接标签
    MoreUrl.value = origin.MoreUrl || origin.Url; //更多链接
    const MoreLinkModel = origin.MoreLinkModel || origin.OpenModel; //弹窗模式
    if (MoreUrl.value === '') {
      // message.info('请正确配置链接.');
      return;
    }
    if (MoreUrl.value?.startsWith('self://')) {
      MoreUrl.value = handleSelfUrl(MoreUrl.value);
    }
    switch (MoreLinkModel) {
      case 0:
      case 'NewWindow':
        // 新窗口打开
        if (MoreUrl.value?.startsWith(`http://`) || MoreUrl.value?.startsWith('https://')) {
          window.open(MoreUrl.value);
          return;
        }
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, MoreUrl.value, MoreLab));
        break;
      case 1:
        // 当前Model打开
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByModal, MoreUrl.value, MoreLab));
        break;
      case 2:
      case 'Self':
        // 覆盖当前窗口打开
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab, MoreUrl.value, MoreLab));
        break;
    }
  };
  // icon颜色随机
  const getRandomColor = () => {
    return colors.value[Math.floor(Math.random() * colors.value.length)];
  };
  //获取当前日期
  const getDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('zh-CN', options);
  };

  const pageSetting = async () => {
    const PageID = props.params.PageID || route.query.PageID;
    if (!PageID) {
      message.error('未设置PageID，请检查');
      return;
    }
    const rptModel = pageConfig.value.RptModel;
    let enName = 'TS.CCFast.Windows.RptPage';
    if (rptModel === 'FlowRptWhite') enName = 'TS.CCFast.Windows.FlowRptPage';
    if (rptModel === 'BillRptWhite' || rptModel === 'EnRptWhite' || rptModel === 'EntityRptWhite') enName = 'TS.CCFast.Windows.FrmRptPage';
    const rptSettingUrl = GloComm.UrlEn(enName, PageID);
    baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByModal, rptSettingUrl, '大屏属性'));
  };
  //切换状态
  const onItemClick = async (val) => {
    edit.value = val;
    switch (val) {
      case 0:
        if (sortabeljsInst) {
          sortabeljsInst.destroy();
          sortabeljsInst = null;
        }
        break;
      case 1:
        await IsSortable();
        break;
      case 2:
        await openDocument();
        break;
    }
  };

  const parentFlowInfo = reactive({
    id: '',
    title: '',
  });

  const parentFormInfo = reactive({
    id: '',
    title: '',
  });

  const fetchOuterInfo = async () => {
    const frmID = props.params.FrmID || route.query.FrmID || '';
    const flowNo = props.params.FlowNo || route.query.FlowNo || '';
    if (frmID) {
      const frm = new MapData(frmID);
      await frm.Retrieve();
      parentFormInfo.id = frmID;
      parentFormInfo.title = frm.Name;
    }

    if (flowNo) {
      const flow = new Flow(flowNo);
      await flow.Retrieve();
      parentFlowInfo.id = flowNo;
      parentFlowInfo.title = flow.Name;
    }
  };
  const btnHandJump = (e) => {
    const paras = `&MyPK=${e.MyPK}`;
    const url = GloComm.UrlGenerList('GL_JumpDtl', paras);
    const openWay = e.DtlOpenWay;
    if (openWay === 0 || openWay === 1 || openWay === 2) baseComp.value?.openDrawerByUrl('明细', url, openWay === 0 ? '50%' : openWay === 1 ? '70%' : '90%');
    if (openWay === 3) {
      baseComp.value?.openModalByUrl('明细', url, null, e.DtlW == 0 ? 500 : e.DtlW, e.DtlH == 0 ? 300 : e.DtlH);
    }
    if (openWay === 4) {
      const url = GloComm.IframeGenerList('GL_JumpDtl', paras);
      baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url));
    }
  };

  onUnmounted(() => {
    sortabeljsInst?.destroy();
    sortabeljsInst = null;
  });
  //页面数据
  onMounted(async () => {
    // 没有FrmID则禁止表单向导
    const hasFrmID = !!props.params?.FrmID || false;
    disabledFrmGuide.value = !hasFrmID;
    await InitRptWhite();
    await fetchOuterInfo();
  });

  // 当 flowNo, frmID存在时 点击相关的按钮，要带入当前的流程或表单的信息
  // 不存在时：让用户选择用什么流程或者表单或实体来创建
  // 总结：区别在于不存在的时候要多一步选择

  // 1.常规向导
  // 2.流程向导
  // 3.表单向导
  // // ---
  //   1. 以xxxxxxx流程未向到。
  //   2. 以xxx表单为向导.
</script>

<style lang="less" scoped>
  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    border-bottom: 2px solid #f2f5f7;
    background-color: white;
  }

  .select-guide {
    display: flex;
    flex-direction: column;
    padding: 30px;

    :deep(.ant-btn + .ant-btn) {
      width: 100%;
      margin-top: 12px;
    }

    .btn_style {
      background-color: #f27140;
      border-color: #f27140;
    }
  }

  .switch-btn {
    .btn_radio_style {
      font-size: 10px; /* 小屏幕默认值 */
      &:hover {
        border-color: #f27140;
        color: #f27140;
      }
    }

    :deep(.ant-radio-button-wrapper-checked) {
      background-color: #f27140;
      border-color: #f27140;
      color: #fff;

      &:hover {
        background-color: #f27140;
        border-color: #f27140;
        color: #fff;
      }
    }
  }

  .add-win {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    align-items: center;
    height: 390px;
    border-radius: 12px;
    background-color: #fff;

    .add-btn {
      margin-top: 50px;
      width: 80px;
      height: 80px;
      color: #f27140;
      text-align: center;
      line-height: 70px;
      cursor: pointer;
      font-size: 40px;
      // position: fixed;
      // bottom: 40px;
      // right: 30px;
      background-color: white;
      // border-radius: 50%;
      border: 2px solid #7cbaff;

      &:hover {
        border-color: #459dff;
        // color: #459dff;
      }
    }
  }

  :deep(.ant-btn.ant-btn-background-ghost) {
    font-size: 10px; /* 小屏幕默认值 */
    color: #459dff;
  }

  .list-group {
    padding: 12px;
    width: 100%;
    height: 100%;
    position: relative;
    box-sizing: border-box;
    background-color: #f2f5f7;
    font: 14px 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;

    .list-group-item {
      cursor: move;
      background-color: white;
      border: 1px solid #f2f5f7;
      border-radius: 12px;
      overflow: hidden;

      .prop_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 12px 18px;
        height: 60px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;
        font-weight: bold;

        .icon {
          white-space: nowrap;
          text-overflow: ellipsis;

          .icon_fire {
            margin-right: 8px;
            font-family: 'simple-line-icons';
            // speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
          }
        }

        .demo-dropdown-wrap :deep(.ant-dropdown-button) {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .item_body {
        height: 330px;
        overflow-x: hidden;
        overflow-y: auto;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        .fa {
          display: inline-block;
          font: normal normal normal 14px/1 FontAwesome;
          font-size: inherit;
          text-rendering: auto;
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
        }

        i {
          cursor: pointer;
        }
      }
    }

    .flip-list-move {
      transition: transform 0.5s;
    }

    .no-move {
      transition: transform 0s;
    }

    .ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }
  }

  .container {
    width: 100%;
    height: 100%;
  }

  .content {
    background-color: #fff;
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .Contentbox {
    flex: 1;
    padding: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;

    .Contentdocs {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 15px;
    }
  }

  .operate {
    flex: 0 0 40px;
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    background-color: #f7f9fc;
    border-radius: 8%;

    .leftText {
      color: #666;
      font-size: 0.9em;
      flex: 1;
      border-right: 1px solid #e8e8e8;
    }

    .rightText {
      color: #2196f3;
      font-weight: 500;
      cursor: pointer;
      flex: 1;
      text-align: right;
    }
  }

  .multi-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    height: 100%;

    .box-card {
      padding: 12px;
      border-radius: 4px;
      background: white;
      border: 1px solid #f2f5f7;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .box-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  .dtlsTitle {
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
  }

  // 变量文本样式
  .state_value {
    font-size: 20px;
    text-align: center;
    background-color: #f7f9fc;
    padding: 10px;
    border-radius: 4px;

    &:hover {
      transform: scale(1.03);
      background: #eef2f9;
    }
  }
  :deep(.ant-card-body) {
    padding: 10px;
  }
  .search-container {
    display: flex;
    /**justify-content: space-between;**/
    align-items: center;
    width: 100%;

    .search-content {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-start;

      &.auto-width {
        width: auto;
      }

      .search-item {
        margin-top: 6px;
        margin-bottom: 6px;
        margin-left: 6px;
        width: 130px;

        // 日期选择器
        &.date-picker {
          width: 20%;
          min-width: 200px;
          max-width: 240px;
        }

        // 条件选择器
        &.condition {
          // display: flex;
          // align-items: center;
          // width: 25%;
          // min-width: 200px;
          // max-width: 240px;

          .label {
            min-width: 80px;
            text-align: center;
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }
  }

  @media (min-width: 1600px) {
    .switch-btn .btn_radio_style,
    .switch-btn :deep(.ant-btn.ant-btn-background-ghost) {
      font-size: 14px; /* 大屏幕值 */
    }
  }
</style>
