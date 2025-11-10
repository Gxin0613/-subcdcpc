<template>
  <BaseComponent ref="baseComponent" :close-modal-func="InitPage" :update-func="InitPage" :close-drawer-func="InitPage">
    <div class="p-4" style="height: 100%; overflow-y: auto">
      <ThemeWrapper>
        <Spin :spinning="loading" style="background-color: white; margin: 0px; height: 100%">
          <div v-if="errorObj.hasError" class="ant-tag-red">
            {{ errorObj.tips }}
          </div>
          <div v-else>
            <Card style="border-radius: 10px; margin-bottom: 6px">
              <div class="flex">
                <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 20 }" style="width: 100%">
                  <FormItem margin-right="0" v-if="showSearckKey">
                    <Input v-model:value="searchKey" :placeholder="'关键字...'" @change="Search" allow-clear style="width: 130px">
                      <template #prefix>
                        <SearchOutlined />
                      </template>
                    </Input>
                  </FormItem>
                  <FormItem v-if="searchFKConditions.length > 0">
                    <Select v-model:value="searchFKKey" style="width: 200px" @change="(ev) => SearchByFK(ev)" :placeholder="'请选择'" :allowClear="true">
                      <SelectOption v-for="item in searchFKConditions" :key="item.value" :label="item.label" :value="item.value">{{ item.label }}</SelectOption>
                    </Select>
                  </FormItem>
                  <FormItem style="margin-right: 0" v-for="col in searchColumns" :key="col.key">
                    <Select v-model:value="col.value" style="width: 135px" @change="Search" :placeholder="'请选择' + col.title" :allowClear="true">
                      <SelectOption v-for="item in col.options" :key="item.key" :label="item.label" :value="item.value">
                        {{ item.label }}
                      </SelectOption>
                    </Select>
                  </FormItem>
                  <template v-if="showRDT">
                    <!-- <FormItem :label="dtFieldOfSearchLab"> -->
                    <RangePicker v-model:value="searchDt" :placeholder="[`${dtFieldOfSearchLab}${'从'}`, `${'到'}`]" @change="Search" style="width: 250px; margin-right: 5px" />
                    <!-- </FormItem> -->
                  </template>
                  <!-- <FormItem>
                    <Button type="primary" style="margin-left: 10px" class="btn_style" @click="Search">{{'查询'}}</Button>
                  </FormItem> -->
                  <div class="toolbar_toRight">
                    <!-- 新位置：放到右侧容器内 -->
                    <template v-for="btn in toolBars" :key="btn">
                      <Button v-if="btn !== '设计'" type="primary" :class="btn_style(btn)" @click="toolBarOper(btn)" style="margin-right: 8px; vertical-align: middle">
                        {{ btn }}
                      </Button>
                    </template>
                    <Button v-if="!!toolBars && toolBars.length > 0 && toolBars.includes('设计')" type="primary" :class="btn_style('设计')" @click="toolBarOper('设计')">
                      设计
                    </Button>
                  </div>
                  <!-- 设置风格 -->
                  <FormItem class="btn_toRight" v-if="(showModel === 2 || showModel === 0) && isGroupShow != 0">
                    <Select v-model:value="defaultStyle.getStyle" style="width: 120px" @change="handleSetStyle">
                      <SelectOption v-for="item in setStyle" :key="item.label" :value="item.value">{{ item.label }} </SelectOption>
                    </Select>
                  </FormItem>
                </Form>
                <Tooltip :title="'密度'" placement="bottom" :mouseEnterDelay="0.5" v-if="(showModel === 0 || showModel === 2) && defaultStyle.Type == 0">
                  <Dropdown :trigger="['click']">
                    <a class="ant-dropdown-link column-setting" @click.prevent>
                      <ColumnHeightOutlined />
                    </a>
                    <template #overlay>
                      <AntMenu @click="onClick">
                        <MenuItem key="middle">{{ '默认' }}</MenuItem>
                        <MenuItem key="small">{{ '紧凑' }}</MenuItem>
                      </AntMenu>
                    </template>
                  </Dropdown>
                </Tooltip>

                <div class="toolbar_toRight">
                  <!-- 表格模式显示 打印/导出 -->
                  <template v-if="showModel === 0 && defaultStyle.Type === GenerListPageShowModel.Table">
                    <Dropdown :trigger="['click']">
                      <Button type="primary" style="margin-right: 15px"><i class="icon-list"></i></Button>
                      <template #overlay>
                        <AntMenu>
                          <MenuItem
                            v-for="btn in feature.options.filter((opt) => opt.mode === defaultStyle.Type || opt.name === '打印')"
                            :key="btn.key"
                            @click="btn.onClick"
                            style="text-align: center; width: 100px"
                          >
                            <i :class="btn?.Icon || 'icon-drop'"></i>
                            {{ btn.name }}
                          </MenuItem>
                        </AntMenu>
                      </template>
                    </Dropdown>
                  </template>
                </div>
              </div>
              <!-- <div class="btn-grid">
                <Button v-for="btn in toolBars" :key="btn" type="primary" class="btn_style" @click="toolBarOper(btn)">{{ btn }}</Button>
              </div> -->
            </Card>
            <BasicTable
              v-if="(showModel === 0 || showModel === 2) && defaultStyle.Type == 0"
              @register="registerTable"
              :pagination="defalutPageSize !== 0 ? pagination : false"
              :IsShowVisibility="IsShowVisibility"
              :WebUser="WebUser"
              :getTime="getTime"
              ref="tableRef"
              :size="columnSize !== '' ? columnSize : 'middle'"
              :row-selection="enableMultiSelect ? rowSelection : null"
            >
              <template #action="{ record, column }">
                <TableAction :actions="createActions(record, column)" />
              </template>
            </BasicTable>
            <div v-else-if="showModel === 1">
              <template v-if="defaultGroupField != ''">
                <div v-for="item in tableData" style="background-color: white; padding: 10px">
                  <div class="group_title">{{ item[columns[0].key] }}</div>
                  <Row :gutter="[8, 8]">
                    <Col :span="8" v-for="child in item.children">
                      <Card>
                        <div v-for="column in columns">
                          <span>{{ column.title }}:</span>
                          <span>
                            <template v-if="column.key === linkField">
                              <Button type="link" @click="LinkFieldClick(child)">{{ child[column.key] }}</Button>
                            </template>
                            <template v-else-if="labFields.includes(column.key) && child[column.key]">
                              <template v-for="tag in GetTextTags(child[column.key])">
                                <Tag :color="tag.color" style="margin-right: 0.5em"> {{ tag.name }}</Tag>
                              </template>
                            </template>
                            <template v-else>
                              <span v-html="child[column.key]"></span>
                            </template>
                          </span>
                        </div>
                        <template #actions>
                          <template v-for="action in createActions(child, columns)">
                            <Button style="border-right: 1px solid #ccc" type="link" @click="BtnsOfRowOper(child, columns, action.label)">{{ action.label }}</Button>
                          </template>
                        </template>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </template>
              <template v-else>
                <Row :gutter="[8, 8]">
                  <Col :span="8" v-for="child in item.children">
                    <Card>
                      <div v-for="column in columns">
                        <span>{{ column.title }}:</span>
                        <span>
                          <template v-if="column.key === linkField">
                            <Button type="link" @click="LinkFieldClick(child)">{{ child[column.key] }}</Button>
                          </template>
                          <template v-else-if="labFields.includes(column.key) && child[column.key]">
                            <template v-for="tag in GetTextTags(child[column.key])">
                              <Tag :color="tag.color" style="margin-right: 0.5em"> {{ tag.name }}</Tag>
                            </template>
                          </template>
                          <template v-else-if="column.format != undefined && column.format != ''">
                            <span v-html="glEn.BindFieldFunction(column.format, child)"></span>
                          </template>
                          <template v-else>
                            <span v-html="child[column.key]" style="display: inline"></span>
                          </template>
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </template>
            </div>
            <div v-else-if="defaultStyle.Type === 4" style="height: 100%">
              <Row :gutter="[8, 12]" style="width: 100%; height: 100%">
                <Col :span="4" style="height: 100%; overflow-y: auto">
                  <Tree
                    :tree-data="treeData"
                    v-model:expandedKeys="expandedKeys"
                    v-model:selectedKeys="selectedKeys"
                    :field-names="{ key: 'key', title: 'title', children: 'children' }"
                    @select="clickNodeEvent"
                    style="margin-top: 12px; min-width: 200px"
                    :style="treeStyle"
                  />
                </Col>
                <Col :span="20" style="height: 100%; overflow-y: auto">
                  <!-- <Spin :spinning="loadingList"> -->
                  <BasicTable
                    v-if="loadingList"
                    @register="registerTable"
                    :pagination="defalutPageSize !== 0 ? pagination : false"
                    :IsShowVisibility="IsShowVisibility"
                    :WebUser="WebUser"
                    :getTime="getTime"
                    ref="tableRef"
                    :size="columnSize !== '' ? columnSize : 'middle'"
                    :row-selection="enableMultiSelect ? rowSelection : null"
                  >
                    <template #action="{ record, column }">
                      <TableAction :actions="createActions(record, column)" />
                    </template>
                  </BasicTable>
                  <!-- </Spin> -->
                </Col>
              </Row>
            </div>
            <div
              v-else-if="showModel === GenerListPageShowModel.Windows || GenerListPageShowModel.Table || showModel === 0"
              style="height: calc(100vh - 50px); overflow: hidden auto"
              class="WinPanel"
            >
              <template v-if="defaultGroupField != ''">
                <div v-if="tableData.length == 0">
                  <Empty :image="simpleImage" style="max-width: 100%; padding-top: 26px" />
                </div>
                <div v-else>
                  <Row v-if="defaultStyle.Type == 2" :gutter="[8, 8]" style="margin-bottom: 10px">
                    <Col :span="8" v-for="item in tableData" :key="item.children">
                      <Collapse expandIconPosition="end" v-model:activeKey="item[columns[0].key]">
                        <CollapsePanel :key="item[columns[0].key]" collapsible="disabled" class="ant-panel">
                          <template #header>
                            <div>
                              <i v-if="item.FlowSortIcon" :class="item.FlowSortIcon" style="margin-right: 5px"></i><span>{{ item[columns[0].key] }}</span>
                            </div>
                          </template>
                          <Row type="flex" justify="space-between" v-for="child in item.children" :key="child.No" style="padding-top: 5px">
                            <Col :span="21" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                              <Button type="link" @click="LinkFieldClick(child)" style="color: #096dd9">
                                <i v-if="!!child?.Icon" :class="child?.Icon" class="panel-icon"></i>
                                <i v-else class="icon-drop panel-icon"></i>
                                {{ child[linkField] }}</Button
                              >
                            </Col>
                            <Col :span="2">
                              <div v-if="child.Btns">
                                <template v-for="action in createActions(child, columns[0])">
                                  <Button shape="circle" size="small" @click="BtnsOfRowOper(child, columns[0], action.label)">
                                    <ToolOutlined style="color: #d3c4c4cc" />
                                  </Button>
                                </template>
                              </div>
                            </Col>
                          </Row>
                        </CollapsePanel>
                      </Collapse>
                    </Col>
                  </Row>
                  <div v-else-if="defaultStyle.Type == 1 || defaultStyle.Type == 3">
                    <Row :gutter="[24, 24]" style="margin-bottom: 10px">
                      <Col :span="24" v-for="item in tableData">
                        <div class="Start_cont">
                          <div class="Start_title"> <i v-if="item.FlowSortIcon" :class="item.FlowSortIcon" style="margin-right: 5px"></i>{{ item[columns[0].key] }}</div>
                          <div class="Start_layout">
                            <div v-for="child in item.children" class="Start_layout_cont">
                              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                                <Button type="link" @click="LinkFieldClick(child)" style="color: #096dd9; display: flex; align-items: center">
                                  <i
                                    v-if="child?.Icon?.startsWith('icon')"
                                    :class="child?.Icon"
                                    class="Start_Icon"
                                    :style="{ fontSize: defaultStyle.Type == 1 ? '13px' : defaultStyle.Type == 3 ? '25px' : '13px' }"
                                  ></i>
                                  <img v-else-if="child?.Icon?.endsWith('svg')" :src="child?.Icon" @error="defaultIcon" style="width: 40px" class="Start_Icon" />
                                  <i v-else class="icon-drop Start_Icon" :style="{ fontSize: defaultStyle.Type == 1 ? '13px' : defaultStyle.Type == 3 ? '25px' : '13px' }"></i>
                                  {{ child[linkField] }}</Button
                                >
                              </div>
                              <Popover
                                v-if="child.Btns"
                                placement="bottomRight"
                                arrow-point-at-center
                                trigger="click"
                                :visible="child.visible"
                                @visibleChange="(visible) => (child.visible = visible)"
                              >
                                <template #content>
                                  <template v-for="action in createActions(child, columns[0])" :key="action.label">
                                    <Button
                                      type="link"
                                      @click="
                                        child.visible = false;
                                        BtnsOfRowOper(child, columns[0], action.label);
                                      "
                                    >
                                      {{ action.label }}
                                    </Button>
                                    <br />
                                  </template>
                                </template>
                                <Button shape="circle" size="small" @click="child.visible = true">
                                  <ToolOutlined style="color: #d3c4c4cc" />
                                </Button>
                              </Popover>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </template>
              <template v-else></template>
            </div>
            <div v-else-if="showModel === GenerListPageShowModel.BigIcon">
              <List>
                <Row :gutter="16">
                  <Col :span="6" v-for="item in tableData">
                    <ListItem>
                      <Card :hoverable="true" class="list-card__card" @click="LinkFieldClick(item)">
                        <div class="list-card__card-title">
                          <i :class="item.Icon"></i>
                          <br />
                          {{ item[linkField] }}
                        </div>
                      </Card>
                    </ListItem>
                  </Col>
                </Row>
              </List>
            </div>

            <Modal v-model:open="modal.visible" centered :title="modal.title" width="70%" :body-style="{ height: '600px' }" :footer="null">
              <template v-if="modal.visible">
                <iframe v-if="modal.iframeURL" :src="modal.iframeURL" class="modal-iframe"> </iframe>
                <Component v-else :is="modal.component" :params="modal.params" @close-self="modalClose" />
              </template>
            </Modal>
            <!--右侧滑出-->
            <Drawer :visible="drawer.visible" :title="drawer.title" width="70%" :body-style="{ padding: 0 }" @close="drawerClose" class="header-style">
              <template v-if="drawer.visible">
                <iframe v-if="drawer.iframeURL" :src="drawer.iframeURL" class="modal-iframe"> </iframe>
                <Component v-else :is="drawer.component" :params="drawer.params" />
              </template>
            </Drawer>
          </div>
        </Spin>
      </ThemeWrapper>
    </div>
  </BaseComponent>
</template>
<script lang="tsx" setup>
  import { computed, h, nextTick, onUnmounted, reactive, ref, shallowRef, UnwrapRef, VNodeChild } from 'vue';
  import { ClassFactoryOfGenerList } from '../GenerList/ClassFactoryOfGenerList';
  import {
    Button,
    Card,
    Col,
    Collapse,
    CollapsePanel,
    Drawer,
    Dropdown,
    Empty,
    Form,
    FormItem,
    Input,
    List,
    ListItem,
    Menu as AntMenu,
    MenuItem,
    message,
    Modal,
    Popover,
    RangePicker,
    Row,
    Spin,
    Tag,
    Tooltip,
    Select,
    SelectOption,
    Progress,
    Tree,
    Table,
    Pagination,
  } from 'ant-design-vue';
  import { ActionItem, BasicColumn, BasicTable, EditRecordRow, TableAction, TableActionType, useTable } from '/@/components/Table';
  import type { Dayjs } from 'dayjs';
  import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
  import { ColumnHeightOutlined, ToolOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { usePostMessage } from '/@/hooks/message/usePostMessage';
  import { ccbpm } from '/#/ccbpm';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import WebUser from '/@/bp/web/WebUser';
  import html2canvas from 'html2canvas';
  import printJS from 'print-js';
  import { useRoute } from 'vue-router';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { setCookie, getCookie } from '/@/utils/storage';
  import { aoaToSheetXlsx } from '/@/components/Excel';
  import { Entity } from '/@/bp/en/Entity';
  import Event from '/@/utils/Events';
  // import Icon from '/@/components/Icon';
  import { GPNReturnObj } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Menu } from '/@/CCFast/GPM/CCMenu/Menu';
  import { TreeDataItem } from 'ant-design-vue/es/tree';

  const { t } = useI18n();
  type RangeValue = [Dayjs, Dayjs];
  const route = useRoute();
  const searchKey = ref('');
  const searchDt = ref<RangeValue>();

  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else if (btn.includes('设计')) {
        return 'btn_design';
      } else {
        return 'btn_style';
      }
    };
  });

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  // end
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const loading = ref(false);

  //实体类
  const glEn = ref(); // Proxy => .value 才是实际的对象，不加.value 是Proxy是代理对象
  //实体类对应的EnName
  const enName = ref<UnwrapRef<string>>('');
  const innerColumns = ref<any[]>([]);
  // 处理搜索
  type SearchColumns = Array<{ key: string; value: any; title: string; options: Array<{ label: string; value: string }> }>;
  const searchColumns = ref<SearchColumns>([]);
  const innerData = ref<Recordable[]>([]); //查询的结果数据集合
  const parseData = ref<Recordable[]>([]); //处理后的数据结果集合

  //左树右表数据
  const treeData = ref<TreeDataItem[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);

  const loadingList = ref<boolean>(false);

  //table集合的定义
  let columns: BasicColumn[] = []; //对应的列名

  const tableData = ref<Recordable[]>([]); //数据集合
  const labFields = ref(''); //标签显示
  let progressFields = ''; //进度条显示
  const defalutPageSize = ref(0);
  const tableHeight = ref(0);

  //GL嵌入页面滚动条高度处理
  const tableHeightScr = computed(() => {
    const hashUrl = window.location.hash;
    if (hashUrl.includes('/WF/Port') || hashUrl.includes('/FEForward')) {
      return document.body.clientHeight - 180;
    } else {
      // return document.body.clientHeight - 267;
      return document.body.clientHeight - 245;
    }
  });

  const treeStyle = computed(() => {
    const hashUrl = window.location.hash;
    let height;
    if (hashUrl.includes('/WF/Port') || hashUrl.includes('/FEForward')) {
      height = document.body.clientHeight - 95;
    } else {
      height = document.body.clientHeight - 160;
    }
    return {
      height: `${height}px`,
      overflow: 'auto',
    };
  });
  //查询条件
  const showRDT = ref(false); // 是否显示时间字段的查询条件
  const dtFieldOfSearchLab = ref(''); //时间查询lab
  const dtFieldOfSearch = ref(''); //时间查询字段名

  //是否显示序号列
  const showIndex = ref(false);

  //分组
  const groupFields = ref<string[]>([]); //分组集合
  const defaultGroupField = ref(''); //默认的分组字段

  //操作
  const linkField = ref(''); //点击超链接处理的字段
  const btnsOfRow = ref<string[]>([]);

  let showModel = ref(0);
  //工具栏操作
  const toolBars = ref();
  //弹窗信息定义
  const modal = reactive({
    visible: false,
    component: {},
    params: {},
    title: '',
    iframeURL: '',
  });
  const drawer = reactive({
    visible: false,
    component: {},
    params: {},
    title: '',
    iframeURL: '',
  });

  const modalClose = async (type = false) => {
    if (type) {
      await InitPage();
    }
    modal.visible = false;
  };

  const tableRef = ref<Nullable<TableActionType>>();
  //分页信息
  let pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    defalutPageSize: 10,
    pageSizeOptions: ['10', '15', '20', '50'],
    showSizeChanger: true,
    showQuickJumper: false,
    onChange: (current, size) => {
      pagination.current = current;
      pagination.pageSize = size;
      tableData.value = [];
      tableParseData();
      tableRef?.value?.setTableData(tableData.value);
      if (groupFields.value.length > 0) onExpandAll();
    },
    onShowSizeChange: (_current, pageSize) => {
      pagination.current = 1;
      pagination.pageSize = pageSize;
      tableData.value = [];
      tableParseData();
      tableRef?.value?.setTableData(tableData.value);
      if (groupFields.value.length > 0) onExpandAll();
    },
  });
  //控制表格列高
  interface MenuInfo {
    key: string;
    keyPath: string[];
    item: VNodeChild;
    domEvent: MouseEvent;
  }
  const columnSize = ref('');
  const onClick = ({ key }: MenuInfo) => {
    console.log(`Click on item ${key}`);
    columnSize.value = key;
    // console.log(columnSize.value);
  };
  //打印
  const IsShowVisibility = ref<boolean>(false);
  const handlePrint = () => {
    const printBox = document.querySelector('#printBox') as HTMLElement;
    IsShowVisibility.value = true;
    nextTick(() => {
      html2canvas(printBox, {
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const imageSrc = canvas.toDataURL('image/png');
        printJS({
          printable: imageSrc,
          type: 'image',
          imageStyle: 'width:100%',
          onLoadingEnd: () => {
            IsShowVisibility.value = false;
          },
        });
      });
    });
  };
  // 显示当前时间
  const getTimeFun = (date) => {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = date.getDate();
    d = d < 10 ? '0' + d : d;
    let h = date.getHours();
    h = h < 10 ? '0' + h : h;
    let minute = date.getMinutes();
    minute = minute < 10 ? '0' + minute : minute;
    let second = date.getSeconds();
    second = second < 10 ? '0' + second : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  };
  const getTime = getTimeFun(new Date());
  const { setTitle } = useTabs();
  //导出
  const deriveFlow = () => {
    const dataGather = innerColumns.value.filter((column) => column.IsShow == true);
    //获取列Name
    const header = dataGather.map((head) => head.Name);
    //获取列Key值
    const key = dataGather.map((key) => key.Key);
    //使用reduce和Key数组处理数据
    const data: any = tableData.value.reduce((acc, item) => {
      // 添加节点标题
      if (item.Title) acc.push([item.Title]);
      else if (item.Name) acc.push([item.Name]);
      if (item.children) {
        item.children.forEach((child) => {
          const row = key.map((k) => (child[k] ? child[k] : '')); // 提取指定key的属性值
          acc.push(row);
        });
      } else {
        const row = key.map((k) => (item[k] ? item[k] : '')); // 提取指定key的属性值
        acc.push(row);
      }
      return acc;
    }, []);
    aoaToSheetXlsx({ data, header, filename: glEn.value.PageTitle + '.xlsx' });
  };

  const feature = reactive({
    options: [
      {
        key: 0,
        name: '打印',
        Icon: 'icon-printer',
        onClick: () => {
          handlePrint();
        },
      },
      {
        key: 1,
        name: '导出',
        Icon: 'icon-share-alt',
        mode: GenerListPageShowModel.Table,
        onClick: () => {
          deriveFlow();
        },
      },
    ],
  });

  //设置风格
  const defaultStyle = reactive({ getStyle: '表格模式', Type: showModel.value });
  const setStyle = ref([
    {
      value: 0,
      label: '表格模式',
    },
    {
      value: 1,
      label: '分组图标',
    },
    {
      value: 2,
      label: '窗口分组',
    },
    {
      value: 3,
      label: '大图标',
    },
    {
      value: 4,
      label: '左树右表',
    },
  ]);

  //没有发起Icon图片时获取默认图片
  const defaultIcon = (e) => {
    const img = e.srcElement;
    img.src = DefaultSvgIcon;
    img.onerror = null;
  };

  //通过分组字段判断是否显示表格类型选择
  const isGroupShow = ref<number>(0);
  const GetEnName = ref('');
  const handleSetStyle = async (value: any, key: string) => {
    defaultStyle.Type = value;
    GetEnName.value = props.params?.EnName || route.query.EnName;
    if (!!GetEnName.value && GetEnName.value !== '') {
      localStorage.setItem(WebUser.No + '_' + GetEnName.value, defaultStyle.Type.toString());
      localStorage.setItem(WebUser.No + '_' + GetEnName.value + '_Type', key?.key);
    }
    await InitPage();
  };

  // 启用多选
  const enableMultiSelect = ref(false);

  const searchFKKey = ref(''); // 外部数据源查询条件
  const searchFKConditions = ref<Array<{ label: string; value: string }>>([]);

  const renderGLTable = async (entity: PageBaseGenerList) => {
    innerColumns.value = entity.Columns;
    // 搜索列
    searchColumns.value = entity.Columns.filter((item) => !!item.enableSearch).map((item) => {
      return {
        value: undefined,
        key: item.Key,
        title: item.Name,
        options: item.options,
      };
    });
    // end
    glEn.value = entity;
    if (!!route.query.No) {
      const menu = new Menu();
      menu.No = route.query.No || '';
      await menu.Retrieve();
      document.title = menu.Name;
      await setTitle(menu.Name || '');
    } else {
      document.title = glEn.value.PageTitle;
      await setTitle(entity.PageTitle || '');
    }

    showModel.value = entity.HisGLShowModel;
    const Type = setStyle.value.find((item) => item.value === showModel.value);
    defaultStyle.getStyle = Type ? Type.label : '';
    defaultStyle.Type = showModel.value;

    //初始化值
    dtFieldOfSearchLab.value = glEn.value.DTFieldOfLabel;
    dtFieldOfSearch.value = glEn.value.DTFieldOfSearch;

    //是否显示序号列
    showIndex.value = glEn.value.ShowIdx;
    //分组字段集合
    const gfs = glEn.value.GroupFields || '';
    groupFields.value = gfs == '' ? [] : gfs.split(',');
    isGroupShow.value = groupFields.value.length;
    //默认分组字段
    defaultGroupField.value = glEn.value.GroupFieldDefault || '';
    if (defaultGroupField.value == '' && groupFields.value.length > 0) defaultGroupField.value = groupFields.value[0];

    linkField.value = glEn.value.LinkField;
    console.log('linkField.value', linkField.value);
    let opers = glEn.value.BtnsOfRow || '';
    opers = opers.replace(/，/g, ',');
    btnsOfRow.value = opers == '' ? [] : opers.split(',');
    labFields.value = glEn.value.LabFields || '';
    progressFields = glEn.value.ProgressFields || '';

    toolBars.value = glEn.value.BtnOfToolbar == '' ? [] : glEn.value.BtnOfToolbar.split(',');

    innerData.value = glEn.value.Data;
    Event.emit('innerData', innerData.value);
    parseData.value = innerData.value || [];
    defalutPageSize.value = glEn.value.PageSize;
    pagination.pageSize = defalutPageSize.value;

    //获取Cookie
    GetEnName.value = props.params?.EnName == undefined ? route.query.EnName : props.params?.EnName;
    const getStyleType = parseInt(localStorage.getItem(WebUser.No + '_' + GetEnName.value) || '0') || defaultStyle.Type;
    const getStyle = localStorage.getItem(WebUser.No + '_' + GetEnName.value + '_Type') || defaultStyle.getStyle;
    if (!isNaN(getStyleType)) {
      defaultStyle.Type = getStyleType;
      defaultStyle.getStyle = getStyle;
    }

    tableParseColumns();
    tableParseData();
    if (glEn.value.HisGLShowModel == GenerListPageShowModel.Table) {
      tableRef.value?.setPagination(pagination);
    }

    if (getStyleType === 4) {
      expandedKeys.value = [String(treeData.value[0]?.key)];
      selectedKeys.value = [String(treeData.value[0]?.key)];
    }
  };
  const showSearckKey = ref(true);
  const InitPage = async () => {
    try {
      loading.value = true;
      loadingList.value = false;
      enName.value = props.params?.EnName || (route.query.EnName as string) || '';
      //获得实体.
      const entity = await ClassFactoryOfGenerList.GetEn(enName.value);
      entity.setParams({ ...route.query, ...props.params });
      const cb = await entity.Init(); //获得数据.
      if (cb && cb instanceof GPNReturnObj) {
        baseComponent.value?.handleGPNCallback(cb);
        return;
      }
      showSearckKey.value = entity.ShowSearchKey;
      searchFKConditions.value = entity.FKConditions;
      enableMultiSelect.value = entity.ShowCheckBox; // 启用多选
      tableData.value = [];
      treeData.value = [];
      await renderGLTable(entity);
      entity.setReloadFunc(renderGLTable);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
      loadingList.value = true;
    }
  };

  // 多选
  let _selectedRowKeys = [];
  const rowSelection = reactive({
    //获取选择框对应行数据
    onChange: (selectedRowKeys, selectedRows) => {
      const pk = innerColumns.value?.[0].Key;
      if (pk) {
        _selectedRowKeys = selectedRows.map((row) => row[pk]).filter((key) => !!key);
      }
      rowSelection.selectedRowKeys = selectedRowKeys;
    },
    selectedRowKeys: [],
    checkStrictly: false,
  });
  // end

  function covertItemWidthToPercent() {
    const data = columns;
    for (const item of data) {
      if (typeof item.width === 'string' && item.width.includes('%')) {
        return;
      }
      if (typeof item.width !== 'number') {
        item.width = 150;
      }
    }
    const totalWidth = data.reduce((prev: any, curr: any) => prev.width + curr.width, 0);
    for (const item of data) {
      item.width = (item.width || 0 / totalWidth) + '%';
    }
    columns = data;
  }

  //处理显示的列
  function tableParseColumns() {
    let index = 0;
    // let firstKey = '';
    innerColumns.value.forEach((item) => {
      //存在时间查询条件，且字段在查询列中
      if (dtFieldOfSearch.value != '' && item.Key === dtFieldOfSearch.value) showRDT.value = true;
      const isShow = item.IsShow == undefined ? true : item.IsShow;
      if (isShow) {
        // if (index == 0)
        //   firstKey = item.Key;
        //渲染列表时过滤
        if (item.Key != defaultGroupField.value && !columns.some((i) => i.key == item.Key)) {
          //判断是否属于分组的
          const isBoolean = groupFields.value.some((gf) => gf == item.Key);
          const getAlign = () => {
            if (item.align) return item.align;
            return index == 0 && groupFields.value.length != 0 ? 'left' : 'center';
          };
          const getStyleType = parseInt(localStorage.getItem(WebUser.No + '_' + GetEnName.value) || '0');
          console.log('getStyleType', getStyleType);
          if (isBoolean && getStyleType !== 4) {
            columns.push({
              title: item.Name,
              dataIndex: item.Key,
              key: item.Key,
              align: getAlign(),
              width: item.width == undefined ? 100 : item.width,
              format: item.RefFunc || '',
              ...(item.fixed !== undefined ? { fixed: item.fixed } : {}),
              customHeaderCell: (column) => {
                return {
                  style: {
                    color: '#0960bd',
                    cursor: 'pointer',
                  },
                  onClick: () => {
                    ChageGroupField(column);
                  },
                };
              },
            });
            index++;
          } else {
            columns.push({
              title: item.Name,
              dataIndex: item.Key,
              key: item.Key,
              //ellipsis:true,
              align: getAlign(),
              width: item.width == undefined ? 100 : item.width,
              ...(item.fixed !== undefined ? { fixed: item.fixed } : {}),
              customCell: (record, _rowIndex, column): any => {
                if (record.children == undefined) return { colSpan: 1 };
                if (record.children != undefined) {
                  if (column && column.key === columns[0].key) return { colSpan: columns.length };
                  else return { colSpan: 0 };
                }
              },
              customRender: ({ text, record, column }: Recordable) => {
                //标题增加已读未读，超链接
                if ((column.key == 'Title' || column.key == 'EmailTitle') && record.children == undefined && text != undefined && text != '') {
                  //1、渲染标签的第一个字
                  //2、当渲染的退回逾期这种的时候，就不渲染icon
                  const tags: TagExt[] = GetTextTags(record.WFState || record.MsgType || record.WFSta);
                  let tagElements;
                  //处理归档显示
                  const tagName = tags?.[0]?.name || '';
                  const displayText = tagName === '归档' || tagName === '作废' ? tagName.slice(1) : tagName.slice(0, 1);
                  if (tags.length === 1) {
                    tagElements = (
                      <Tooltip placement="top" title={tags[0].name}>
                        <Tag color={tags[0].color} style={{ marginRight: '0.5em' }}>
                          {record.WFState ? displayText : record.MsgType || record.WFSta ? tags[0].name : ''}
                        </Tag>
                      </Tooltip>
                    );
                  } else if (tags.length === 2) {
                    tagElements = (
                      <span style={{ display: 'flex', marginRight: '0.5em' }}>
                        <Tooltip placement="top" title={tags[0].name + '-' + tags[1].name}>
                          <span style={{ display: 'flex' }}>
                            <Tag color={tags[0].color} style={{ marginRight: '0.5em' }}>
                              {record.WFState ? tags[0].name[0] : record.MsgType || record.WFSta ? tags[0].name : ''}
                            </Tag>
                            <Tag color={tags[1].color}>{record.WFState ? tags[1].name[0] : record.MsgType || record.WFSta ? tags[1].name : ''}</Tag>
                          </span>
                        </Tooltip>
                      </span>
                    );
                  } else {
                    tagElements = text;
                  }
                  if (column.key == linkField.value) {
                    if (record.IsRead == 1)
                      return (
                        <span style="display: flex;align-items: center;">
                          <span>
                            {tags.length === 2 && record.PRI == '#ffde72' ? (
                              <span>{tagElements}</span>
                            ) : (
                              <span style="display: flex;">
                                {/* {tagElements} */}
                                {/* <i class="glyphicon glyphicon-bookmark" style={{ marginRight: '6px', fontSize: '18px', color: record.PRI || '#ffde72' }}></i> */}
                              </span>
                            )}
                          </span>
                          <a onClick={LinkFieldClick.bind(null, record)}>
                            {/* <Icon icon="mingcute:mail-open-line" style="margin-right: 12px;font-size:18px" /> */}
                            {record[linkField.value]}
                          </a>
                        </span>
                      );
                    else
                      return (
                        <span style="display: flex;align-items: center;">
                          <span>
                            {tags.length === 2 && record.PRI == '#ffde72' ? (
                              <span>{tagElements}</span>
                            ) : (
                              <span style="display: flex;">
                                {/* {tagElements} */}
                                {/* <i class="glyphicon glyphicon-bookmark" style={{ marginRight: '6px', fontSize: '18px', color: record.PRI || '#ffde72' }}></i> */}
                              </span>
                            )}
                          </span>
                          {/* <Icon icon="mingcute:mail-fill" style="margin-right: 12px;font-size:18px" /> */}
                          <a onClick={LinkFieldClick.bind(null, record)} style="font-weight:700">
                            {record[linkField.value]}
                          </a>
                        </span>
                      );
                  }
                  if (record.IsRead == 1)
                    return (
                      // <span>
                      //   <Icon icon="mingcute:mail-open-line" style="margin-right: 12px;font-size:18px" />
                      //   {record[linkField.value]}
                      // </span>
                      <span style="display: flex;align-items: center;">
                        <span>
                          {tags.length === 2 && record.PRI == '#ffde72' ? (
                            <span>{tagElements}</span>
                          ) : (
                            <span style="display: flex;">
                              {tagElements}
                              <i class="glyphicon glyphicon-bookmark" style={{ marginRight: '6px', fontSize: '18px', color: record.PRI || '#ffde72' }}></i>
                            </span>
                          )}
                        </span>
                        <span>{record[linkField.value]}</span>
                      </span>
                    );
                  if (record.IsRead == 0)
                    return (
                      // <span>
                      //   <Icon icon="mingcute:mail-fill" style="margin-right: 12px;font-size:18px" />
                      //   {record[linkField.value]}
                      // </span>
                      <span style="display: flex;align-items: center;">
                        <span>
                          {tags.length === 2 && record.PRI == '#ffde72' ? (
                            <span>{tagElements}</span>
                          ) : (
                            <span style="display: flex;">
                              {tagElements}
                              <i class="glyphicon glyphicon-bookmark" style={{ marginRight: '12px', fontSize: '18px', color: record.PRI || '#ffde72' }}></i>
                            </span>
                          )}
                        </span>
                        <span style="font-weight:700">{record[linkField.value]}</span>
                      </span>
                    );
                  if (record.IsRead == undefined)
                    return (
                      <span>
                        <span>{tags.length === 2 && record.PRI == '#ffde72' ? <span>{tagElements}</span> : <span>{tagElements}</span>}</span>
                      </span>
                    );
                }
                //超链接
                else if (column.key == linkField.value && record.children == undefined) {
                  return <a onClick={LinkFieldClick.bind(this, record)}>{record[linkField.value]}</a>;
                }
                //获取标签的值对应的数组集合
                else if (text != undefined && labFields.value.includes(column?.key) == true && record.children == undefined) {
                  const tags: TagExt[] = GetTextTags(text);
                  if (tags.length == 0) return text;
                  if (tags.length == 1) return h(Tag, { color: tags[0].color }, () => tags[0].name);
                  if (tags.length == 2)
                    return (
                      <span>
                        <Tag color={tags[0].color} style="margin-right:0.5em">
                          {' '}
                          {tags[0].name}
                        </Tag>
                        <Tag color={tags[1].color}> {tags[1].name}</Tag>
                      </span>
                    );
                } else if (progressFields.includes(column.key)) {
                  const val = parseFloat(text) * 100;
                  return <Progress percent={val} max="100"></Progress>;
                } else if (typeof text == 'string') {
                  return <span v-html={text}></span>;
                } else return text;
              },
            });
            index++;
          }
        }
      }
    });

    if (groupFields.value.length == 0 && showIndex.value) {
      //序号列判断,如果存在就不再插入
      const hasIndexColumn = columns.some((col) => col.key === '$$index$$');
      // 不分组 添加序号列
      if (!hasIndexColumn) {
        columns.unshift({
          title: '＃',
          key: '$$index$$',
          dataIndex: '$$index$$',
          width: 50,
          align: 'center',
          fixed: 'left' as const,
          customRender: ({ index: rowIndex }: { index: number }) => {
            return (pagination.current - 1) * pagination.pageSize + rowIndex + 1;
          },
          customCell: (record: any) => {
            if (record?.children) {
              return { colSpan: columns.length };
            }
            return {};
          },
        });
      }
    }
    covertItemWidthToPercent();
  }

  //处理数据Data
  const tableParseData = () => {
    const startIdx = ref(0);
    const endIdx = ref(0);
    const curretPageData = ref();
    if (defalutPageSize.value != 0) {
      pagination.total = parseData.value.length;
      //处理前台逻辑分页问题
      startIdx.value = (pagination.current - 1) * pagination.pageSize;
      endIdx.value = pagination.current * pagination.pageSize;
      if (parseData.value.length < endIdx.value) endIdx.value = parseData.value.length;
      if (parseData.value.length === 0) curretPageData.value = [];
      else curretPageData.value = parseData.value.slice(startIdx.value, endIdx.value);
    } else {
      curretPageData.value = parseData.value;
    }
    curretPageData.value = curretPageData.value.map((item) => {
      if (item instanceof Entity) {
        return {
          visible: false,
          ...Object.fromEntries(item.Row),
        };
      }
      return {
        visible: false,
        ...item,
      };
    });
    //不存在分组直接显示数据
    if (groupFields.value.length == 0) {
      tableData.value = curretPageData.value;
      if (glEn.value.HisGLShowModel == GenerListPageShowModel.Table) tableRef.value?.setTableData(tableData.value);
    } else {
      //获取分组的集合
      const map = new Map();

      const getStyleType = parseInt(localStorage.getItem(WebUser.No + '_' + GetEnName.value) || '0');
      console.log('getStyleType', getStyleType);
      if (getStyleType === 4 || defaultStyle.Type === 4) {
        tableData.value = curretPageData.value;
        parseData.value.forEach((item) => {
          if (!map.has(item.FK_Flow)) {
            // 创建全新的独立对象
            const treeNode = {
              FK_Flow: String(item.FK_Flow || ''),
              FlowName: String(item.FlowName || ''),
              key: String(item.FK_Flow || ''),
              title: String(item.FlowName || ''),
            };
            map.set(item.FK_Flow, treeNode);
          }
        });
        // 从 Map 中获取唯一值
        const originMap = Array.from(map.values());
        treeData.value = [
          {
            title: '全部数据',
            key: 'all',
            children: [...originMap],
          },
        ];
        console.log('treeData.value', treeData.value);
      } else {
        curretPageData.value.forEach((item, _index, arr) => {
          if (!map.has(item[defaultGroupField.value])) {
            map.set(
              item[defaultGroupField.value],
              arr.filter((a) => a[defaultGroupField.value] == item[defaultGroupField.value]),
            );
          }
        });
        const data = Array.from(map).map((item) => [...item[1]]);
        let dataItem: Record<string, any> = {};
        const treeKey = columns[0]?.key || 'Title';
        data.forEach((item) => {
          dataItem = {};
          dataItem[treeKey] = item[0][defaultGroupField.value];
          if (defaultGroupField.value && item[0]['FlowSortIcon']) {
            dataItem['FlowSortIcon'] = item[0]['FlowSortIcon'];
          }
          dataItem['children'] = item;
          tableData.value.push(dataItem as never);
        });
      }
      if (groupFields.value.length > 0) onExpandAll();
    }
  };

  /**
   * TreeNodeclickEvent
   * @param e
   * @param info
   */
  const clickNodeEvent = async (e: any, info) => {
    try {
      loadingList.value = false;
      const { key } = info.node.dataRef?.key;
      const fk_flow = e;
      if (fk_flow == 'all') {
        await InitPage();
        selectedKeys.value = [key];
      } else {
        await InitPage();
        selectedKeys.value = [key];
        tableData.value = innerData.value.filter((item) => item.FK_Flow == fk_flow);
        pagination.total = tableData.value.length;
      }
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = true;
    }
  };

  InitPage();

  const [registerTable] = useTable({
    title: '',
    indentSize: 0,
    isTreeTable: true,
    columns: columns,
    dataSource: tableData,
    showIndexColumn: false,
    showTableSetting: false,
    canResize: true,
    tableSetting: { fullScreen: false },
    defaultExpandAllRows: true,
    expandRowByClick: true,
    scroll: { y: tableHeightScr },
    striped: true,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      ifShow: () => {
        if (innerColumns.value.filter((item) => item.Key === 'Btns').length > 0) return true; // 根据业务控制是否显示
        return false;
      },
    },
  });

  console.log('columns', columns);

  function onExpandAll() {
    // 演示默认展开所有表项
    nextTick(tableRef.value?.expandAll);
  }

  function createActions(record: EditRecordRow, column: BasicColumn): ActionItem[] {
    const items: Record<string, any>[] = [];
    let opers = record['Btns'];
    if (typeof opers === 'undefined' || opers === '') return [];
    opers = opers.replace(/，/g, ',');
    const btns = opers.split(',');
    btns.forEach((item) => {
      if (item != '') {
        const IsDel = item === '删除';
        items.push({
          label: item,
          ifShow: (_action) => {
            return record.children == undefined;
          },
          danger: IsDel,
          onClick: BtnsOfRowOper.bind(null, record, column, item),
        });
      }
    });
    return items;

    // if (btnsOfRow.value.length == 0)
    //   return [];
    // else {
    //   btnsOfRow.value.forEach(item => {
    //     items.value.push({
    //       label: item,
    //       ifShow: (_action) => {
    //         return record.children == undefined;
    //       },
    //       onClick: BtnsOfRowOper.bind(null, record, column, item),
    //     })
    //   })
    //   return items.value;
    // }
  }

  /**
   * 行按钮操作
   * @param record
   * @param column
   * @param name
   * @constructor
   */
  const LinkTitle = ref('');
  const emit = defineEmits(['modalIsShow', 'LinkTitle']);
  async function BtnsOfRowOper(record, _column, name) {
    try {
      loading.value = true;
      if (name == '选择') {
        if (enName.value === 'GL_LinkRefFlow') LinkTitle.value = '@Title=' + record.Title + ',FlowNo=' + record.FK_Flow + ',WorkID=' + record.WorkID;
        else LinkTitle.value = '@Title=' + record.Title;
        emit('modalIsShow', false, LinkTitle.value);
      }
      const result = await glEn.value.BtnClick(name, record);
      if (name === '回滚到此') {
        emit('modalIsShow', false);
        return;
      }
      if (!!result) afterOper(name, result);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 100);
    }
  }

  /**
   * 工具栏操作
   * @param name
   */
  async function toolBarOper(name) {
    try {
      loading.value = true;
      const result = await glEn.value.BtnClick(name, null, _selectedRowKeys.join(','));
      if (!!result) afterOper(name, result);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 100);
    }
  }

  /**
   * 执行点击超链接事件
   * @param record
   * @constructor
   */
  const LinkFieldClick = async (record) => {
    try {
      loading.value = true;
      const result = await glEn.value.LinkFieldClick(record);
      let tabName = '';
      if (record.FlowName && record.WorkID) {
        // tabName = `${record.FlowName}-${record.WorkID}`;
        tabName = `${record.FlowName}`;
      } else {
        tabName = record[linkField.value];
      }
      if (!!result) await afterOper(tabName, result);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 100);
    }
  };

  //执行完的操作
  async function afterOper(btnName, result) {
    baseComponent.value?.handleGPNCallback(result, result.title || btnName);
  }

  const drawerClose = () => {
    drawer.visible = false;
  };
  /**
   * 改变分组
   * @param field 分组字段
   * @constructor
   */
  const ChageGroupField = (column) => {
    defaultGroupField.value = column.key;
    columns = [];
    tableData.value = [];
    tableParseColumns();
    tableParseData();
    tableRef.value?.setColumns(columns);
    tableRef.value?.setTableData(tableData.value);
    if (groupFields.value.length > 0) onExpandAll();
  };

  const SearchByFK = async (val: string) => {
    await glEn.value.SearchByFK(val);
    await renderGLTable(glEn.value);
  };
  //执行查询
  const Search = () => {
    tableData.value = [];
    parseData.value = [];
    console.log('Search');
    //匹配关键字段值
    const list = ref<Recordable[]>([]);
    if (searchKey.value) {
      const ar = JSON.parse(JSON.stringify(innerData.value));
      // const str = new RegExp(searchKey.value, 'i');
      ar.forEach((item) => {
        for (const key in item) {
          //数字不可转小写,先转字符串
          let val = item[key]?.toString();
          if (val?.toLowerCase().includes(searchKey.value?.toLowerCase())) {
            list.value.push(item);
            break;
          }
        }
      });
    } else {
      list.value = innerData.value || [];
    }
    // 选项搜索
    for (const col of searchColumns.value) {
      if (!!col.value) {
        console.log({ col });
        list.value = list.value.filter((item) => item[col.key] === col.value);
      }
    }
    // end
    const dtFrom = searchDt.value?.[0].startOf('day') || '';
    const dtTo = searchDt.value?.[1].endOf('day') || '';
    if (showRDT.value == true) {
      //开始时间和结束时间同时有值时
      if (dtFrom != '' && dtTo != '') {
        //+new Date()目的是将数据类型转换为Number类型
        list.value.forEach((item) => {
          if (+new Date(item[dtFieldOfSearch.value]) >= +dtFrom.toDate() && +new Date(item[dtFieldOfSearch.value]) <= +dtTo.toDate()) {
            console.log(+dtFrom.toDate());
            parseData.value.push(item);
          }
        });
      } else if (dtFrom != '') {
        list.value.forEach((item) => {
          if (+new Date(item[dtFieldOfSearch.value]) >= +dtFrom.toDate()) {
            parseData.value.push(item);
          }
        });
      } else if (dtTo != '') {
        list.value.forEach((item) => {
          if (+new Date(item[dtFieldOfSearch.value]) <= +dtTo.toDate()) {
            parseData.value.push(item);
          }
        });
      } else {
        parseData.value = list.value;
      }
    } else {
      parseData.value = list.value;
    }
    pagination.current = 1;
    tableParseData();
    if (glEn.value.HisGLShowModel == GenerListPageShowModel.Table) {
      tableRef.value?.setTableData(tableData.value);
      tableRef.value?.setPagination(pagination);
    }

    if (groupFields.value.length > 0) onExpandAll();
  };

  /**
   * 获取标签表示的内容
   * @param text
   * @constructor
   */
  interface TagExt {
    name: string;
    color: string;
  }

  function GetTextTags(text) {
    if (typeof text == 'string') {
      const tags = ref<TagExt[]>([]);
      splitAtString(text).forEach((item) => {
        tags.value.push({
          name: item.split('=')[0],
          color: item.split('=')[1],
        });
      });
      return tags.value;
    } else return [];
  }

  const { refreshPage } = useTabs();
  const messageHandler = (evt) => {
    const data = evt.data as ccbpm.PostMessageInfo;
    console.log(data);
    if (data.type === MessageTypeEnum.ReloadPage) {
      if (window.location.hash.includes('/Middle/GenerList')) {
        drawer.visible = false;
        modal.visible = false;
        tableData.value = [];
        parseData.value = [];
        columns = [];
        InitPage();
      } else {
        loading.value = true;
        refreshPage();
      }
    }
  };
  //FlowOpenModel==3 新网页打开,流程关闭后，刷新opener窗口
  window.addEventListener('message', function (event) {
    if (event.data.type == 'loadPage') {
      InitPage();
    }
  });
  onUnmounted(() => {
    window.removeEventListener('message', function (event) {
      if (event.data.type == 'loadPage') {
        InitPage();
      }
    });
  });
  usePostMessage(messageHandler);

  defineExpose({
    InitPage,
  });
</script>
<style lang="less" scoped>
  .p-4 {
    padding: 0.5rem 1rem 1rem;
  }

  .btn_toRight {
    // margin-left: auto;
  }

  .column-setting {
    font-size: 17px;
    margin: 0 10px;
    display: flex;
    align-items: center;
  }

  //按钮风格统一
  .btn_style {
    height: 31px;
    border-radius: 5px;
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
  .btn_design {
    background-color: #f27140 !important;
    border-color: #f27140 !important;
  }
  .title_box {
    padding-left: 50px;
    height: 45px;
    line-height: 45px;
    font-size: 18px;
  }

  // :deep(tr.unIsread td:first-child) {
  // }

  :deep(.ant-table-thead > tr > th:nth-child(1)) {
    text-align: center !important;
  }

  .modal-iframe {
    width: 100%;
    height: 100%;
  }

  .group_title {
    line-height: 38px;
    height: 38px;
    font-size: 15px;
  }

  :deep(.ant-card-body) {
    padding: 6px 12px !important;
  }

  //折叠面板标题隐藏
  :deep(.ant-collapse-content) {
    border: none;
  }

  //设置下边框
  :deep(.ant-collapse) {
    border: none;
    margin: 0 10px;
    // border-bottom: 1px solid gray;
  }

  //设置图标背景色
  :deep(.ant-btn-default:hover, .ant-btn-default:focus, .ant-btn-default:active) {
    background-color: #096dd9;
  }

  :deep(.ant-btn:active) {
    background-color: #096dd9;
  }

  :deep(.ant-collapse > .ant-collapse-item .ant-collapse-header-collapsible-only) {
    display: none;
  }

  .hide_box :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0;
  }

  .openAll :deep(.ant-collapse-content > .ant-collapse-content-box) {
    display: none;
  }

  .openAll :deep(.ant-collapse-header) {
    justify-content: center;
    color: #096dd9;
  }

  .list-card {
    &__card {
      width: 100%;
      height: 200px;

      .ant-card-body {
        padding: 16px;
      }

      &-title {
        text-align: center;
        padding-top: 30px;
        font-weight: 500;

        i {
          margin-top: -5px;
          margin-right: 10px;
          font-size: 38px !important;
        }
      }
    }
  }

  // toolbar按钮
  .btn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 160px);
    margin-top: 12px;
    gap: 12px;
  }

  .ant-panel {
    background-color: #f8f8f8;

    :deep(.ant-collapse-header) {
      color: #000000d9;
    }

    .panel-icon {
      margin-right: 5px;
      font-size: 13px;
    }
  }

  .toolbar_toRight {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-left: auto;
  }

  .Start_cont {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
  }

  .Start_title {
    padding: 10px 0 0 15px;
  }

  .Start_layout {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    justify-content: center;
    margin: 5px 10px;
  }

  .Start_layout_cont {
    padding-top: 5px;
    display: flex;
    align-items: center;
  }

  .Start_Icon {
    margin-right: 5px;
  }

  .Start_title::before {
    content: '';
    // margin-left: 10px;
    margin-right: 5px;
    height: 30px;
    border-left: 5px solid var(--system-bg-color);
  }

  :deep(.ant-card-body) {
    height: 100%;
  }

  :deep(.ant-pagination.mini .ant-pagination-item-active) {
    background-color: #0960bd !important;
  }

  //表格分组表头加粗显示斑马纹
  /*  :deep(.ant-table-row-level-0) {
    background-color: #fafafa;
  }*/

  :deep(.ant-table-pagination.ant-pagination) {
    margin: 6px 0;
  }

  /*  //表格分组内容不显示斑马纹
  :deep(.vben-basic-table-row__striped td) {
    background-color: #fff;
    overflow: hidden;
  }*/

  .WinPanel {
    scrollbar-width: none;
  }
</style>
