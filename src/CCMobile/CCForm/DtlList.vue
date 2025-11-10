<template>
  <BaseComponent ref="baseComponent">
    <div class="p-1">
      <Spin :spinning="loading" style="background-color: white">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div v-else class="content" ref="contentRef">
          <div style="margin-bottom: 5px">
            <div class="van-h5">
              <span>{{ groupField['Name' + sysLang] || groupField.Lab }}</span>
            </div>
          </div>
          <div>
            <Button v-if="isInsert" @click="AddRow" type="primary">{{ '新增' }}</Button>
            <Popconfirm v-if="isDelete" :title="'确定要删除选择的行吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteRows()">
              <Button danger>{{ '删除' }}</Button>
            </Popconfirm>
            <Popconfirm v-if="isDelete && isPageSize" :title="'确定要删除所有行数据吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteAllRows()">
              <Button danger><CloseOutlined />{{ '删除全部' }}</Button>
            </Popconfirm>
            <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled" type="primary">{{ '保存' }}</Button>
            <template v-for="item in btnList" :key="item">
              <Button @click="BtnClick(item)" type="primary">{{ item }}</Button>
            </template>
            <Button v-if="parseInt(mapDtl.IsImp) === 1" @click="ExpDtl" type="primary">{{ '导出' }}</Button>
            <template v-if="(isImp || isExcelImp) && isSave">
              <Button v-if="isImp && isExcelImp === false" @click="ImpDtl(-1)" type="primary">{{ '导入' }}</Button>
              <Button v-else-if="isImp === false && isExcelImp" @click="ImpDtl(2)" type="primary">{{ '导入' }}</Button>
              <template v-else>
                <Dropdown placement="bottomLeft" arrow>
                  <Button type="primary">{{ '导入' }}</Button>
                  <template #overlay>
                    <Menu>
                      <MenuItem @click="ImpDtl(-1)">{{ impName }}</MenuItem>
                      <MenuItem @click="ImpDtl(2)">{{ 'Excel导入' }}</MenuItem>
                    </Menu>
                  </template>
                </Dropdown>
              </template>
            </template>

            <template v-if="isInvoice && isSave">
              <Button v-if="isImp === false && isInvoice" @click="ImpInvoice()" type="primary">{{ '导入发票' }}</Button>
              <template v-else>
                <Dropdown placement="bottomLeft" arrow>
                  <Button type="primary">{{ '导入发票' }}</Button>
                  <template #overlay>
                    <Menu>
                      <MenuItem @click="ImpInvoice()">{{ '导入发票' }}</MenuItem>
                    </Menu>
                  </template>
                </Dropdown>
              </template>
            </template>

            <Button v-if="GetPara(mapDtl.AtPara, 'IsFullShow') === '1'" @click="fullScreen" type="primary">
              <FullscreenOutlined />
            </Button>
          </div>

          <ConfigProvider :getPopupContainer="getPopupContainer">
            <div ref="tableRef" class="table-container" :style="groupField.IsZDPC == 1 ? { minHeight: '0', height: '0', overflow: 'hidden' } : ''">
              <Card v-if="isFullScreen" class="card-of-head" style="background-color: #f9f9f9">
                <div class="search-container flex">
                  <slot name="title"></slot>
                  <div class="search-keys">
                    <div class="select-key flex" v-for="kwItem in toolbarProps.keywordList" :key="kwItem.key">
                      <Input v-model:value="kwItem.value" :placeholder="kwItem.placeholder" />
                    </div>
                    <div class="search-key flex" v-for="dateItem in toolbarProps.dateList" :key="dateItem.key">
                      <div class="label">{{ dateItem.label }}</div>
                      <NDatePicker
                        :type="dateItem.type"
                        :clearable="true"
                        :start-placeholder="dateItem.startPlaceholder"
                        :end-placeholder="dateItem.endPlaceholder"
                        :placeholder="dateItem.placeholder"
                        v-model:value="dateItem.value"
                        @update-value="dateItem.onChange"
                        :update-value-on-close="true"
                        :actions="null"
                      />
                    </div>
                    <div class="select-key flex" v-for="condition in toolbarProps.selectList.filter((item) => item.key !== 'date-query-key')" :key="condition.key">
                      <div class="label" v-if="condition.label">{{ condition.label }}</div>
                      <RadioGroup v-if="condition.display === 'radio'" v-model:value="condition.value">
                        <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">{{ item.label }}</RadioButton>
                      </RadioGroup>
                      <Select
                        v-else-if="condition.display === 'select'"
                        v-model:value="condition.value"
                        :mode="condition.isMultiSelect ? 'multiple' : undefined"
                        style="width: 100%"
                        :allow-clear="true"
                        :placeholder="'请选择' + condition.label"
                      >
                        <SelectOption v-for="item in condition.options" :key="item.value"> {{ item.label }}</SelectOption>
                      </Select>
                    </div>
                    <div class="select-key flex" :style="{ width: '130px' }">
                      <Button type="primary" shape="default" isGhost @click="Search()">{{ '查询' }}</Button>
                    </div>
                  </div>
                </div>
              </Card>
              <Table
                v-if="parseInt(mapDtl.ListShowModel) === 0"
                :row-selection="isDelete === true || isBatchUpdate === true ? { selectedRowKeys: tableSelectedRowKeys, fixed: true, onChange: onSelectChange } : null"
                :columns="columns"
                :data-source="tableData"
                bordered
                size="small"
                :rowKey="(record, index) => index"
                :key="tempData"
                :pagination="isPageSize ? pagination : false"
                :scroll="getScroll"
                :row-class-name="getRowClass"
                @resizeColumn="handleResizeColumn"
                @change="ChangePageIdx"
                class="custom-table"
              >
                <template #headerCell="{ column }">
                  <template v-if="column.attr !== undefined && column.attr.UIIsInput">
                    <span class="must-input">*</span><span>{{ column.title }}</span>
                  </template>
                </template>
                <template #bodyCell="{ column, index, record }">
                  <template v-if="!!column.attr && (column.attr.UIIsEnable === 0 || column.edit == false) && column.attr.UIContralType != 6">
                    <template v-if="column.attr.UIContralType === UIContralType.HandWriting">
                      <img :src="GetImgSrc(column.attr, record[column.key])" onerror="this.style.dispaly='none'" :style="{ width: '100%', height: '32px' }" />
                    </template>
                    <template v-else>
                      <template v-if="columnKeys.includes(',' + column.key + 'T,') || columnKeys.includes(',' + column.key + 'Text,')">
                        {{ record[column.key] }}
                      </template>
                      <template v-else-if="column.attr.MyDataType === DataType.AppBoolean">
                        {{ record[column.key] ? GetPara(column.attr.AtPara, 'checkedTips') || '是' : GetPara(column.attr.AtPara, 'unCheckedTips') || '否' }}
                      </template>
                      <template v-else>
                        {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                      </template>
                    </template>
                  </template>
                  <template v-if="column.key != '_sys_default_idx' && !!column.attr && (column.edit == true || column.attr.UIContralType === 6)">
                    <OneMapAttr
                      :mapAttr="GetMapAttr(column.attr, index)"
                      :mainData="record"
                      :data="props.mainData"
                      :params="props.params"
                      :frmData="frmData"
                      :refPKVal="parseInt(record.OID) === 0 ? params.WorkID + '_' + index : '' + parseInt(record.OID)"
                      :isReadonly="!column.edit"
                      ref="TabbasicData"
                      @ChangeDtlData="ChangeDtlData"
                      @TextBoxChange="TextBoxChange"
                      @text-box-blur="TextBoxBlur"
                      :isDtl="true"
                      :rowIdx="index"
                      @update-row="(key, val, index) => updateRow(key, val, index)"
                    />
                  </template>

                  <template v-if="column.key === 'Oper'">
                    <Button v-if="parseInt(mapDtl.EditModel) != 0" type="link" @click="EditOrViewRow(index)"><EditOutlined /></Button>
                    <template v-if="isDelete">
                      <Popconfirm
                        v-if="record.OID && record.OID !== 0"
                        :title="'确定要删除该行数据吗?'"
                        :ok-text="'确定'"
                        :cancel-text="'取消'"
                        @confirm="DeleteRow(index, record)"
                      >
                        <a href="#"><CloseCircleOutlined :style="{ color: 'red' }" /></a>
                      </Popconfirm>
                      <Popconfirm v-else :title="'确定要删除该行数据吗?'" :ok-text="'确定'" :cancel-text="'取消'" @confirm="DeleteRow(index, record)">
                        <a href="#"><MinusCircleOutlined :style="{ color: 'red' }" /></a>
                      </Popconfirm>
                    </template>

                    <template v-if="isInsert && parseInt(mapDtl.EditModel) == 0 && isPageSize == false">
                      <Divider type="vertical" />
                      <Button type="link" @click="InsertRow(index)" style="padding: 0px"><PlusCircleOutlined /></Button>
                    </template>
                    <template v-if="isCopyThisData && isPageSize == false">
                      <Divider type="vertical" />
                      <Button type="link" @click="CopyRow(index)" style="padding: 0px"><CopyOutlined /></Button>
                    </template>
                    <template v-if="mapDtl.IsEnableLink && !!mapDtl.LinkUrl">
                      <Divider type="vertical" />
                      <Button type="link" @click="OpenLink(1, record)" style="padding: 0px">{{ mapDtl.LinkLabel }}</Button>
                    </template>
                    <template v-if="mapDtl.IsEnableLink2 && !!mapDtl.LinkUrl2">
                      <Divider type="vertical" />
                      <Button type="link" @click="OpenLink(2, record)" style="padding: 0px">{{ mapDtl.LinkLabel }}</Button>
                    </template>
                  </template>
                </template>
                <template v-if="isHaveSummary && tableData.length != 0" #summary>
                  <TableSummaryRow>
                    <TableSummaryCell v-if="parseInt(mapDtl.IsShowIdx) === 1" style="text-align: center">{{ '总计' }}</TableSummaryCell>
                    <TableSummaryCell v-if="isDelete === true || isBatchUpdate === true" style="text-align: center">-</TableSummaryCell>
                    <TableSummaryCell v-for="item in mapAttrs" :key="item.MyPK" style="text-align: center">
                      <TypographyText v-if="!!totals.arr[item.KeyOfEn]">{{ totals.arr[item.KeyOfEn] }}</TypographyText>
                      <TypographyText v-else>-</TypographyText>
                    </TableSummaryCell>
                  </TableSummaryRow>
                </template>
              </Table>
            </div>
          </ConfigProvider>
        </div>
      </Spin>
    </div>
    <Popup v-model:show="popModal.visible" position="right" :style="{ width: '100%', height: '100%', zIndex: 3000 }">
      <NavBar :title="popModal.title" :fixed="true" left-arrow @click-left="PopModalOK" class="fixed" />
      <GroupPageNew v-if="popModal.visible === true && popModal.modalType === 'ImpInvoice'" :params="popModal.params" />
      <GroupPageNew v-if="popModal.visible === true && popModal.modalType === 'dtlExcelImp'" :params="entityParams" />
      <DtlImp
        v-if="popModal.visible === true && popModal.modalType === 'dtlImp'"
        ref="dtlImp"
        :mainData="mainData"
        :refPKVal="props.params.WorkID"
        :cond-sql="popModal.mapExt.Tag1"
        :list-sql="popModal.mapExt.Tag2"
        :field-text="popModal.mapExt.Tag"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
        :mypk="popModal.mapExt.MyPK"
      />
      <DtlImpSimple
        v-if="popModal.visible === true && popModal.modalType === 'dtlImpSimple'"
        ref="dtlImpSimple"
        :mainData="mainData"
        :refPKVal="props.params.WorkID"
        :init-sql="popModal.mapExt.Tag1"
        :list-sql="popModal.mapExt.Tag2"
        :field-text="popModal.mapExt.Tag"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
        :mypk="popModal.mapExt.MyPK"
      />
      <DtlTreeEns
        v-if="popModal.visible === true && popModal.modalType === 'dtlTreeEns'"
        ref="dtlTreeEns"
        :mainData="mainData"
        :column-tag="popModal.mapExt.Tag"
        :list-sql="popModal.mapExt.Tag3"
        :tree-sql="popModal.mapExt.Tag2"
        :parent-no="popModal.mapExt.Doc"
        :mapExt="popModal.mapExt"
        :refPKVal="props.params.WorkID || props.params.RefPKVal"
        :rowData="props.rowData"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
      />
      <!--自定义URL导入-->
      <template v-if="popModal.visible === true && popModal.modalType === 'dtlImpBySelfUrl'">
        <component v-if="popModal.type === 'component'" :is="popModal.component" ref="selfComponent" :params="popModal.params" />
        <iframe v-if="popModal.type === 'iframe'" :src="popModal.url" ref="iframeRef" style="width: 100%; height: 100%; border: none"></iframe>
      </template>
    </Popup>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import {
    Spin,
    Button,
    ConfigProvider,
    Table,
    message,
    TableSummaryRow,
    TableSummaryCell,
    TypographyText,
    Popconfirm,
    Divider,
    Modal,
    Dropdown,
    Menu,
    MenuItem,
    Card,
    Input,
    RadioGroup,
    RadioButton,
    Select,
    SelectOption,
  } from 'ant-design-vue';
  import { CloseCircleOutlined, EditOutlined, PlusCircleOutlined, MinusCircleOutlined, FullscreenOutlined, CopyOutlined } from '@ant-design/icons-vue';
  import { NDatePicker } from 'naive-ui';
  import { NavBar, Popup } from 'vant';
  // 父组件传过来的属性
  import { computed, provide, reactive, ref, shallowRef, watch, onMounted, markRaw } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import OneMapAttr from './OneMapAttr.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { ddlInfo, GetMapExtsGroup, MapAttrExt, useKeyOfEnType, userConvertData } from '/@/WF/CCForm/FrmEnd';
  import dayjs from 'dayjs';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
  import DtlImp from '/@/WF/CCForm/DtlImp.vue';
  import DtlImpSimple from '/@/WF/CCForm/DtlImpSimple.vue';
  import DtlBatchFrm from '/@/WF/CCForm/DtlBatchFrm.vue';
  import DtlTreeEns from '/@/WF/CCForm/DtlTreeEns.vue';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { cloneDeep } from 'lodash-es';
  import { FrmDtlBtnClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnClick';
  import { FrmDtlTextBoxChange } from '/@/DataUser/OverrideFiles/FrmDtlTextBoxChange';
  import { FrmDtlBtnRowClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnRowClick';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { AtPara } from '/@/bp/da/AtPara';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { windowOpen } from '/@/utils/windowOpen';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { aoaToSheetXlsx } from '/@/components/Excel';
  import { SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import { ToolbarProps } from '/@/components/SearchComponent/src/types';
  const sysLang = WebUser.SysLang || 'CH';
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    dtlInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
    groupField: {
      type: Object,
      default: () => {
        return {};
      },
    },
    frmStyleContent: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainMapExts: {
      type: Array,
      default: () => {
        return [];
      },
    },
    isShowGF: {
      type: Boolean,
      default: false,
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
  });

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const { getComponentParamsByUrl } = useComponentLoader();
  const mainData = ref(props.mainData);
  type Key = number;
  const loading = ref(false);
  const query = ref(props.params);
  const btnDisabled = ref(false);
  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const tempData = ref(0);
  const columnKeys = ref(',');

  //从表属性信息
  const mapDtl = ref<Record<string, any>>({});
  const mapAttrs = ref<MapAttr[]>([]);
  const rowMapAttrs = ref<[MapAttr[]]>([[]]);
  const orginMapAttrs = ref<MapAttrExt[]>([]);
  //从表操作
  const isInsert = ref(true);
  const isDelete = ref(true);
  const isSave = ref(true);
  const isBatchUpdate = ref(false);
  const isCopyThisData = ref(false);
  const dtlParams = ref({});
  const tableSelectedRowKeys = ref<Key[]>([]); //选择的行数
  //从表导入问题
  const isImp = ref(false);
  const impExt = ref<Record<string, string>>({});
  const cacheSelectedData = ref<string[]>([]);
  const tableRef = shallowRef<HTMLElement>();
  const contentRef = shallowRef<HTMLElement>();
  //从表是否有合计行，列
  const isHaveSummary = ref(false);
  const summaryMapExts = ref<any[]>([]);

  // 从表的每一列属性
  const subTableAttrList = ref<Recordable[]>([]);
  //从表附件
  const aths = ref<FrmAttachment[]>([]);
  //从表增加的头部按钮
  const btnList = ref<string[]>([]);
  const popKeys = ref<string[]>([]);
  const frmData = ref();

  //从表列不能重复的字段
  const dtlIsRepeats = ref<string[]>([]);

  const { isInt, isFloat, isMoney, isTextPop, isTextChoiceSearch } = useKeyOfEnType(props.isReadonly);
  const componentKey = ref(0);
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const entityParams = reactive<Recordable>({
    EnName: 'GPN_DtlImpExcel',
    query: {},
    dtlInfo: {},
    mainData: props.mainData,
  });

  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: 'dtlImp',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: {},
    itemNames: '',
    refOID: 0,
    mapAttrs: [],
    isReadonly: false,
    footer: null,
    component: {},
    params: {},
    type: '',
    url: '',
  });
  const pagination = ref({
    current: 1,
    defaultPageSize: parseInt(GetPara(props.dtlInfo.AtPara, 'PageSize') || '0'),
    total: 0,
    showLessItems: true,
    pageSizeOptions: [parseInt(GetPara(props.dtlInfo.AtPara, 'PageSize') || '0')],
    showTotal: () => `共 ${0} 条`,
  });
  const ChangePageIdx = async (page) => {
    try {
      pagination.value.current = page.current;
      await SaveAll(true);
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      query.value.EnsName = props.dtlInfo['No'];
      query.value.FrmID = props.dtlInfo.FK_MapData;
      let refPKVal = props.params.WorkID;
      if (refPKVal == null || !refPKVal) refPKVal = props.params.No;
      query.value.RefPKVal = refPKVal;

      handler.AddJson(query.value);
      handler.AddPara('PageIdx', page.current);
      if (isFullScreen.value) {
        const paras = GetSearchCondtion();
        handler.AddPara('paras', encodeURIComponent(paras));
      }
      const data = await handler.DoMethodReturnString('Dtl_DataOfPage');
      //变更tableData中的值\
      const dtlData: any[] = data['DT'] as any[];
      //const exts = frmData.value['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'ActiveDDL' && mapExt?.DoWay != 0);
      for (let i = 0; i < dtlData.length; i++) {
        let item = dtlData[i];
        item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
        dtlData[i] = item;
        rowMapAttrs.value[i] = cloneDeep(mapAttrs.value);
        /*if (exts.length != 0 && isSave.value)
        for (const mapExt of exts) {
          const refPKVal = parseInt(item.OID) === 0 ? props.params.WorkID + '_' + i : '' + parseInt(item.OID);
          const val = item[mapExt.AttrOfOper];
          if (typeof val === 'undefined' || val == undefined) continue;
          const data = await GetActionDLLData(val, mapExt, 'Doc', refPKVal, item, 'Dtl');
          dtlData[i] = await ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, i, item);
        }*/
      }
      tableData.value = dtlData; //从表数据集合
    } catch (e) {
      message.error(e as string);
    }
  };
  /**
   * 打开超链接
   * @param type
   * @param rowData
   * @constructor
   */
  const OpenLink = async (type, rowData) => {
    let linkUrl = '';
    //执行类型
    const excType = type === 1 ? mapDtl.value.ExcType : mapDtl.value.ExcType2;
    if (excType == 1) {
      await FrmDtlBtnClick.LinkUrlClick(mapDtl.value, props.params, rowData, props.mainData);
      return;
    }
    if (type === 1) linkUrl = mapDtl.value.LinkUrl;
    if (type === 2) linkUrl = mapDtl.value.LinkUrl2;
    linkUrl = DealExp(linkUrl, rowData, false);
    if (linkUrl.includes('@')) linkUrl = DealExp(linkUrl, props.mainData, false);
    if (linkUrl.includes('@')) linkUrl = DealExp(linkUrl, props.params);
    let linkTarget = '';
    if (type === 1) linkTarget = mapDtl.value.LinkTarget;
    if (type === 2) linkTarget = mapDtl.value.LinkTarget2;
    if (linkTarget === '_blank') {
      if (linkUrl.includes('http:') == false && linkUrl.includes('https:') == false) {
        linkUrl = window.location.protocol + '://' + window.location.host + linkUrl;
      }
      windowOpen(linkUrl, type === 1 ? mapDtl.value.LinkLabel : mapDtl.value.LinkLabel2);
      return;
    }
    if (linkUrl.includes('.vue') == false) {
      if (linkUrl.includes('http:') == false && linkUrl.includes('https:') == false) {
        linkUrl = window.location.protocol + '://' + window.location.host + linkUrl;
      }
      const args = {
        title: type === 1 ? mapDtl.value.LinkLabel : mapDtl.value.LinkLabel2,
        width: '950px',
        src: linkUrl,
        openType: 0,
      };
      baseComponent.value?.openIframe(args);
      return;
    }
    baseComponent.value?.openModalByUrl1(type === 1 ? mapDtl.value.LinkLabel : mapDtl.value.LinkLabel2, linkUrl, '950px');
  };
  const updateRow = (key: string, val: string, index: number) => {
    tableData.value[index][key] = val;
    //判断是否插入重复
    if (dtlIsRepeats.value.length != 0 && dtlIsRepeats.value.includes(key)) {
      let arr: any[] = [];
      for (let rowData of tableData.value) {
        if (arr.includes(rowData[key]) == false) arr.push(rowData[key]);
        else {
   //       debugger;
          message.warn((tableData.value[index][key + 'T'] || tableData.value[index][key + 'Text']) + '已经选择');
          tableData.value[index][key] = '';
          tableData.value[index][key + 'T'] = '';
          break;
        }
      }
    }
  };
  const onSelectChange = (selectedRowKeys: Key[]) => {
    tableSelectedRowKeys.value = selectedRowKeys;
  };

  const getRowClass = (record: Recordable) => {
    if (!record.AtPara) return;
    const atPara = new AtPara(record.AtPara);
    const color = atPara.GetValStrByKey('BGColor');
    if (color) return 'bg-' + color;
  };

  const isFullScreen = ref(false);
  const getScroll = computed(() => {
    if (isFullScreen.value) {
      return { y: isPageSize.value ? 400 : '100vh', x: 300 };
    }
    return { y: parseInt(mapDtl.value.H) < 300 ? 300 : parseInt(mapDtl.value.H) - 50, x: 300 };
  });

  const GetImgSrc = (mapAttr, value) => {
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    if (value == null || value == undefined || value == '') return prefix + '/DataUser/Siganture/UnName.jpg';
    return prefix + value.substring(value.indexOf('/DataUser'));
  };
  const fullScreen = async () => {
    setTimeout(async () => {
      const status = document.fullscreenElement;
      if (!status) {
        await contentRef.value?.requestFullscreen();
        dtlHeight.value = '100%';
        isFullScreen.value = true;
      } else {
        document.exitFullscreen();
        isFullScreen.value = false;
      }
      if (isPageSize.value) {
        pagination.value.current = 1;
        await SearchData();
      }
    }, 50);
  };

  const getPopupContainer = (triggerNode, dialogContext) => {
    if (!!tableRef.value) return tableRef.value.parentNode;
    if (dialogContext) {
      return dialogContext.getDialogWrap();
    } else {
      return document.body;
    }
  };

  const { GetActionDLLData } = mapExtParse();
  const isExcelImp = ref(false);
  const isInvoice = ref(false);
  const impName = ref('');
  const dtlHeight = ref('150px');
  const isPageSize = ref(false);
  const toolbarProps = reactive<ToolbarProps>({
    dateList: [],
    buttonList: [],
    selectList: [],
    keywordList: [],
  });
  const SearchCond = async () => {
    const isSearchKey = parseInt(GetPara(mapDtl.value.AtPara, 'IsSearchKey'));
    if (isSearchKey === 1) {
      toolbarProps.keywordList = [
        {
          label: '关键字',
          key: 'SearchKey',
          value: '',
          placeholder: '请输入关键字',
        },
      ];
    }
    if (isSearchKey === 2) {
      const stringSearchKeys = GetPara(mapDtl.value.AtPara, 'StringSearchKeys') || '';
      if (!!stringSearchKeys) {
        const stringSearchKeysT = GetPara(mapDtl.value.AtPara, 'StringSearchKeysT') || '';
        const keys = stringSearchKeys.split(',');
        const keyNames = stringSearchKeysT.split(',');
        toolbarProps.keywordList = [];
        keys.forEach((item, idx) => {
          toolbarProps.keywordList.push({
            label: keyNames[idx],
            key: item,
            value: '',
            placeholder: '请输入' + keyNames[idx],
          });
        });
      }
    }
    const dtSearchWay = GetPara(mapDtl.value.AtPara, 'DTSearchWay') || '0';
    const dtSearchKey = GetPara(mapDtl.value.AtPara, 'DTSearchKey') || '';
    if (dtSearchWay != '0' && !!dtSearchKey) {
      const dtSearchKeyT = GetPara(mapDtl.value.AtPara, 'DTSearchKeyT') || '';
      toolbarProps.dateList = [
        {
          label: dtSearchKeyT,
          key: dtSearchKey,
          type: 'daterange',
          value: null,
          startPlaceholder: '从',
          endPlaceholder: '到',
          onChange: () => void 0,
        },
      ];
    }

    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', mapDtl.value.No);

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
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.UIBindKey);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        console.log({ ens });
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
  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format('YYYY-MM-DD');
    }
    return '';
  };
  const GetSearchCondtion = () => {
    const paras: Record<string, any> = {};
    const isSearchKey = parseInt(GetPara(mapDtl.value.AtPara, 'IsSearchKey') || '1');
    if (isSearchKey === 1) paras.SearchKey = toolbarProps.keywordList?.[0].value;
    if (isSearchKey === 2) {
      paras.SearchKey = '';
      if (Array.isArray(toolbarProps.keywordList)) {
        toolbarProps.keywordList.forEach((item) => {
          paras[item.key] = item.value;
        });
      }
    }
    if (Array.isArray(toolbarProps.dateList) && toolbarProps.dateList.length != 0) {
      const dateFrom = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[0]);
      const dateTo = handleTimestamp(toolbarProps.dateList?.[0]?.value?.[1]);
      if (!dateFrom || !dateTo) {
      } else {
        paras['DTFrom'] = dateFrom;
        paras['DTTo'] = dateTo;
        paras['DTSearchKey'] = toolbarProps.dateList?.[0].key;
      }
    }
    // 处理查询条件
    if (Array.isArray(toolbarProps.selectList)) {
      for (const condition of toolbarProps.selectList) {
        paras[condition.key] = condition.value;
      }
    }
    return JSON.stringify(paras);
  };
  const Search = async () => {
    pagination.value.current = 1;
    await SearchData();
  };
  const SearchData = async () => {
    await SaveAll(true);
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddJson(query.value);
    handler.AddPara('PageIdx', pagination.value.current);
    if (isFullScreen.value) {
      const paras = GetSearchCondtion();
      handler.AddPara('paras', encodeURIComponent(paras));
    }
    const data = await handler.DoMethodReturnString('Dtl_DataOfPage');
    //变更tableData中的值\
    const dtlData: any[] = data['DT'] as any[];
    const exts = frmData.value['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'ActiveDDL' && mapExt?.DoWay != 0);
    for (let i = 0; i < dtlData.length; i++) {
      let item = dtlData[i];
      item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
      dtlData[i] = item;
      rowMapAttrs.value[i] = cloneDeep(mapAttrs.value);
      /*if (exts.length != 0 && isSave.value)
      for (const mapExt of exts) {
        const refPKVal = parseInt(item.OID) === 0 ? props.params.WorkID + '_' + i : '' + parseInt(item.OID);
        const val = item[mapExt.AttrOfOper];
        if (typeof val === 'undefined' || val == undefined) continue;
        const data = await GetActionDLLData(val, mapExt, 'Doc', refPKVal, item, 'Dtl');
        dtlData[i] = await ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, i, item);
      }*/
    }
    tableData.value = dtlData; //从表数据集合
    //获取总数
    if (isPageSize.value) {
      if (pagination.value.defaultPageSize > tableData.value.length) pagination.value.total = tableData.value.length;
      else {
        //获取总条数
        const pageCount = data['Count'][0]['Number']; // await handler.DoMethodReturnString('Dtl_InitCount');
        pagination.value.total = parseInt(pageCount);
        pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
      }
    }
  };
  //初始化页面
  const InitPage = async (isLoad = true) => {
    try {
      loading.value = true;
      //columns.value = [];
      tableData.value = [];
      //参数
      //console.log(JSON.parse(JSON.stringify(props)));
      query.value = props.params;
      query.value.EnsName = props.dtlInfo['No'];
      query.value.FrmID = props.dtlInfo.FK_MapData;

      let refPKVal = props.params.WorkID;
      if (refPKVal == null || !refPKVal) refPKVal = props.params.No;

      query.value.RefPKVal = refPKVal;
      entityParams.query = query.value;
      entityParams.dtlInfo = props.dtlInfo;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('Dtl_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        return;
      }
      frmData.value = data;
      mapDtl.value = data['Sys_MapDtl'][0] || {};
      orginMapAttrs.value = data['Sys_MapAttr'];
      aths.value = data['Sys_FrmAttachment'];

      dtlHeight.value = parseInt(mapDtl.value.H) < 150 ? '150px' : parseInt(mapDtl.value.H) - 50 + 'px';
      //是否启用Excel导入
      isExcelImp.value = (mapDtl.value.AtPara || '').includes('IsExcelExp=1') ? true : false;

      //是否启用Excel导入
      isInvoice.value = (mapDtl.value.AtPara || '').includes('IsInvoice=1') ? true : false;

      const mapExts = GetMapExtsGroup(data['Sys_MapExt']);
      if (isLoad == false) {
        columns.value = [];
        tableData.value = [];
        tempData.value++;
        let btns = mapDtl.value.Btns || '';
        btns = btns.replace('，', ',');
        btnList.value = btns === '' ? [] : btns.split(',');
        //从表列总结栏
        summaryMapExts.value = data['Sys_MapExt']?.filter((mapExt) => mapExt.ExtModel === 'NumFiledSumAvg' && mapExt?.DoWay != 0) || [];
        if (summaryMapExts.value.length > 0) isHaveSummary.value = true;

        //是否启用导入功能
        const impexts = data['Sys_MapExt']?.filter((mapExt) => mapExt.ExtModel === 'DtlImp' && mapExt?.DoWay != 0) || [];
        impExt.value = impexts.length > 0 ? impexts[0] : {};
        isImp.value = impexts.length > 0;
        if (isImp.value) {
          switch (parseInt(impExt.value.DoWay)) {
            case 1:
              impName.value = '表格简单模式导入';
              break;
            case 3:
              impName.value = '表格模式导入';
              break;
            case 4:
              impName.value = '左树右表导入';
              break;
            case 5:
              impName.value = '自定义模式导入';
              break;
            default:
              message.error(impExt.value.DoWay) + '未解析';
              break;
          }
        }
        //处理mapAttr的信息
        //处理字段的下拉框
        orginMapAttrs.value.forEach((mapAttr) => {
          if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
            mapAttr.ddl = GetDDLOption(mapAttr as any, data);
            mapAttr['mode'] = '';
            mapAttr['ShowType'] = mapAttr['ddl'].length != 0 && mapAttr['ddl'][0].hasOwnProperty('ParentNo') ? 'Tree' : '';
            if ((mapAttr.AtPara || '').includes('@DtlIsRepeat=1') == true) {
              dtlIsRepeats.value.push(mapAttr.KeyOfEn);
            }
          }
          //日期、日期时间类型
          if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
            mapAttr.format = GetDateTimeOption(mapAttr as any);
          }
          if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney)
            mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
          //字段附件，获取对应的附件信息
          if (mapAttr.UIContralType === UIContralType.AthShow) {
            const result = aths.value.filter((ath) => ath.MyPK === mapAttr.MyPK);
            if (result.length == 0) {
              mapAttr.ath = null;
            }
            mapAttr.ath = result[0];
          }
          mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;
          //后置说明
          mapAttr.suffix = GetPara(mapAttr.AtPara, 'suffix') || '';
          //mapExt的集合
          mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
          //判断是否有对从表列求和字段
          const mainMapExts = props.mainMapExts.length === 0 ? [] : (props.mainMapExts as MapExt[]);
          const exts = mainMapExts.filter((mapExt) => mapExt.Tag1 === mapAttr.KeyOfEn);
          if (exts.length > 0) mapAttr.mapExts = mapAttr.mapExts.concat(exts);
          if (isTextPop(mapAttr) || isTextChoiceSearch(mapAttr)) popKeys.value.push(mapAttr.KeyOfEn);
          mapAttr['eleDBs'] = [];
        });
        mapAttrs.value = orginMapAttrs.value.filter((attr) => attr.UIVisible == 1);

        isInsert.value = mapDtl.value.IsInsert === '1' && props.isReadonly == false && parseInt(mapDtl.value.IsReadonly) == 0;
        isDelete.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1') && props.isReadonly == false && parseInt(mapDtl.value.IsReadonly) == 0;
        isSave.value =
          (parseInt(mapDtl.value.IsDelete) === 1 || parseInt(mapDtl.value.IsInsert) === 1 || parseInt(mapDtl.value.IsUpdate) == 1) &&
          parseInt(mapDtl.value.IsReadonly) == 0 &&
          props.isReadonly == false;
        isBatchUpdate.value = parseInt(mapDtl.value.IsBatchUpdate) === 1 && props.isReadonly == false && isSave.value == true;
        isCopyThisData.value = isSave.value === true && parseInt(mapDtl.value.IsCopyThisData) === 1;

        //如果没有pageSize === 0 就不分页
        pagination.value.defaultPageSize = parseInt(GetPara(mapDtl.value.AtPara, 'PageSize') || '0');
    //    debugger;
        if (pagination.value.defaultPageSize != 0) {
          isPageSize.value = true;
        }

        //增加序号
        if (parseInt(mapDtl.value.IsShowIdx) === 1)
          columns.value.push({
            title: '序号',
            key: '_sys_default_idx',
            width: 50,
            align: 'center',
            className: 'my-handle',
            customRender: ({ index }) => {
              if (isPageSize.value == false) return `${index + 1}`;
              return ((pagination.value.current < 1 ? 1 : pagination.value.current) - 1) * pagination.value.defaultPageSize + index + 1;
            },
          });

        //初始化从表表头信息
        InitColumn();
        //增加操作按钮
        if (isInsert.value || isDelete.value || isSave.value || !!parseInt(mapDtl.value.IsEnableLink) || !!parseInt(mapDtl.value.IsEnableLink2)) {
          columns.value.push({
            title: '操作',
            key: 'Oper',
            width: 80,
            align: 'center',
            fixed: 'right',
          });
        }
      }

      rowMapAttrs.value = [[]];
      // 用于处理传统模式主表和从表的计算
      subTableAttrList.value = mapAttrs.value;
      //变更tableData中的值\
      const dtlData = data['DBDtl'];
      const exts = data['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'ActiveDDL' && mapExt?.DoWay != 0);
      for (let i = 0; i < dtlData.length; i++) {
        let item = dtlData[i];
        item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
        dtlData[i] = item;
        rowMapAttrs.value[i] = cloneDeep(mapAttrs.value);

        if (exts.length != 0 && isSave.value)
          for (const mapExt of exts) {
            const refPKVal = parseInt(item.OID) === 0 ? props.params.WorkID + '_' + i : '' + parseInt(item.OID);
            const val = item[mapExt.AttrOfOper];
            if (typeof val === 'undefined' || val == undefined) continue;
            const data = await GetActionDLLData(val, mapExt, 'Doc', refPKVal, item, 'Dtl');
            dtlData[i] = await ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, i, mapExt.AtPara, item);
          }
      }
      tableData.value = dtlData; //从表数据集合
      //移动
      if (isPageSize.value) {
        if (pagination.value.defaultPageSize > tableData.value.length) {
          pagination.value.total = tableData.value.length;
          pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
        } else {
          //获取总条数
          const pageCount = await handler.DoMethodReturnString('Dtl_InitCount');
          pagination.value.total = parseInt(pageCount);
          pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
        }
      }
      SearchCond();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
      triggerSummary();
    }
  };
  function handleResizeColumn(w, col) {
    col.width = w;
  }

  const emit = defineEmits(['update-prop-data']);
  const ChangeDtlData = (args) => {
    const isCompute = parseInt(GetPara(mapDtl.value.AtPara, 'PageSize') || '0') === 0 ? true : false;
    if (isCompute == false) return;
    //获取主表值的小数位数
    const mainVal = mainData.value[args.mainKey];
    if (typeof mainVal === 'undefined') {
      message.error('在主表单没有找到字段[' + args.mainKey + '],请检查主表字段根据从表列求值配置是否正确');
      return;
    }
    let bit = 2;
    if (mainVal?.toString().includes('.')) bit = mainVal.toString().split('.')[1].length;
    //@Sum=求和@Avg=求平均@Max=求最大@Min=求最小
    let val = 0;
    let tableSource = tableData.value;
    if (args.type === 'Number') {
      //根据配置过滤从表数据 filterCond=计算过滤表达式
      if (!!args.filterCond) {
        //验证表达式是否正确 xxx = 001,002,003 -- 暂时忽略，表达式的正确性未处理
        const fs = args.filterCond;
        //解析规则
        const filterField = fs.split('=')[0].trim(); //要过滤的字段
        const filterValue = fs.split('=')[1].trim(); //过滤数据时要匹配的值
        const arrs = filterValue.replaceAll('，', ',').split(',');
        tableSource = tableData.value.filter((data) => {
          if (data[filterField]) {
            console.log(arrs.includes(data[filterField]));
            return arrs.includes(data[filterField]);
          }
        });
        console.log('tableData', tableSource);
      }

      tableSource.forEach((item, idx) => {
        const b = !!item[args.dtlKey] ? item[args.dtlKey] : 0;
        if (idx == 0 && (args.computed === 'Max' || args.computed === 'Min')) val = b;
        switch (args.computed) {
          case 'Sum': // 求和
          case 'Avg': //求平均
            val = parseFloat(val) + parseFloat(parseFloat(b).toFixed(bit));
            break;
          case 'Max': //求最大值
            if (val < parseFloat(b)) val = parseFloat(b);
            break;
          case 'Min': //求最小值
            if (val > parseFloat(b)) val = parseFloat(b);
            break;
        }
      });
      if (args.computed === 'Avg') val = parseFloat(val) / tableSource.length;
      mainData.value[args.mainKey] = val.toFixed(bit);
    }
    if (args.type === 'Date') {
      let val = '';
      let tableDtl = tableData.value.filter((key) => !!key[args.dtlKey]);
      console.log('tableData.value', tableData.value);
      tableDtl.forEach((item, idx) => {
        if (idx == 0) val = item[args.dtlKey];
        switch (args.computed) {
          case 'Max': //求最大值
            if (val < item[args.dtlKey]) val = item[args.dtlKey];
            break;
          case 'Min': //求最小值
            if (val > item[args.dtlKey]) {
              val = item[args.dtlKey];
            }
            break;
        }
      });
      mainData.value[args.mainKey] = val;
    }

    // eslint-disable-next-line vue/no-mutating-props

    emit('update-prop-data', mainData.value);
  };

  /**
   * 值发生变化的时候
   * @param attrKey
   * @param val
   * @param dtlOID
   * @constructor
   */
  const TextBoxChange = async (attrKey, rowData, dtlOID) => {
    const resultData = await FrmDtlTextBoxChange.TextBoxChange(props.params.WorkID, mapDtl.value.No, parseInt(dtlOID), attrKey, rowData, tableData.value);
    if (!!resultData) {
      tableData.value = resultData;
      tempData.value++;
    }
    // 列表的key 变化了导致重新渲染， 然后顺便就触发了change 和 blur
  };

  const TextBoxBlur = async (attrKey, rowData, dtlOID) => {
    const resultData = await FrmDtlTextBoxChange.Blur(props.params.WorkID, mapDtl.value.No, parseInt(dtlOID), attrKey, rowData, tableData.value);
    if (!!resultData) {
      tableData.value = resultData;
      tempData.value++;
    }
  };

  /**
   * 修改父组件属性的信息
   * @param mapAttr
   * @param type
   * @constructor
   */
  const ChangeParentAttr = async (keyOfEn, type, data, rowIdx, atpara, rowData) => {
    if (typeof rowData == 'undefined') rowData = tableData.value[rowIdx];
    switch (type) {
      case 'AutoFull':
        //判断当前字段是否可编辑
        const items = rowMapAttrs.value[rowIdx].filter((mapAttr) => mapAttr.KeyOfEn == keyOfEn);
        if (items.length == 0) break;
        const mapAttr = items[0];
        if (parseInt(mapAttr.UIIsEnable) == 0 && mapAttr.mapExts.length > 0) {
          for (const mapExt of mapAttr.mapExts) {
            switch (mapExt.ExtModel) {
              case 'AutoFull': //自动计算
                let expression = mapExt.Tag;
                expression = expression.toLowerCase();
                for (const key in tableData.value[rowIdx]) {
                  if (expression.includes('@') == false) continue;
                  const lowerKey = key.toLowerCase();
                  const regExp = new RegExp(`@${lowerKey}\\b`, 'g');
                  expression = expression.replace(regExp, tableData.value[rowIdx][key] || '0');
                  let exp = '';
                  for (let i = 0; i < expression.length; i++) {
                    let char = expression.charAt(i);
                    if (char != ' ') {
                      exp += char;
                    }
                  }
                  expression = exp;
                  if (expression.includes('/0')) {
                    tableData.value[rowIdx][mapExt.AttrOfOper] = parseFloat('0.00').toFixed(mapAttr['bit'] || 2);
                    return;
                  }
                }
                try {
                  const data = eval(expression) || 0;
                  const attr = rowMapAttrs.value[rowIdx].filter((attr) => attr.KeyOfEn == mapExt.AttrOfOper && attr.FK_MapData == mapExt.FK_MapData)[0];
                  if (tableData.value[rowIdx][mapExt.AttrOfOper] === '' || data != tableData.value[rowIdx][mapExt.AttrOfOper]) {
                    const val = data + '';
                    if (isFloat(attr) || isMoney(attr)) {
                      tableData.value[rowIdx][mapExt.AttrOfOper] = parseFloat(val).toFixed(parseInt(GetPara(attr.AtPara, 'NumScale') || 2));
                    } else {
                      tableData.value[rowIdx][mapExt.AttrOfOper] = parseFloat(val).toFixed(0);
                    }
                  }
                } catch (e) {
                  console.log(e);
                }
                break;
              default:
                break;
            }
          }
        }

        break;
      case 'ActiveDDL':
      case 'FullDataDDL':
        const isSelectVal = GetPara(atpara, 'IsSelectVal') || '0';
        rowMapAttrs.value[rowIdx].forEach((mapAttr) => {
          if (mapAttr.KeyOfEn === keyOfEn) {
            const oldVal = rowData[keyOfEn];
            mapAttr['ddl'] = data;
            const result = data.filter((item) => item.value === rowData[keyOfEn]);
            let option = null;
            if (result.length != 0) option = result[0];
            if (result.length == 0) {
              if (isSelectVal === '1') option = data[0];
            }
            rowData[keyOfEn] = '';
            rowData[keyOfEn + 'T'] = '';
            rowData[keyOfEn + 'Text'] = '';
            if (option != null) {
              rowData[keyOfEn] = option['value'];
              rowData[keyOfEn + 'T'] = option['label'];
              rowData[keyOfEn + 'Text'] = rowData[keyOfEn + 'T'];
            }
            if (oldVal != rowData[keyOfEn]) {
              MapAttrLinkageTrigger(mapAttr, rowData[keyOfEn], rowData['OID'], rowData, rowIdx, option);
            }
            return;
          }
        });
        if (tableData.value[rowIdx] != undefined) tableData.value[rowIdx] = rowData;
        //if (isFirstLoad == false) tempData.value++;
        return rowData;
      case 'FullData':
        let i = 0;
        for (const item of data) {
          if (i === 0) {
            for (const key in item) {
              if (tableData.value[rowIdx].hasOwnProperty(key)) tableData.value[rowIdx][key] = item[key];
            }
            i++;
            continue;
          }
          i++;
          //执行新增.
          item['OID'] = 0;
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
        break;
      default:
        break;
    }
  };
  provide('ChangeParentAttr', ChangeParentAttr);
  const GetMapAttr = (mapAttr, indx) => {
    if (typeof mapAttr === 'undefined') return mapAttr;
    //if (rowMapAttrs.value.length === 0) return mapAttr;
    if (indx > rowMapAttrs.value.length - 1) return mapAttr;
    return rowMapAttrs.value[indx].filter((item) => item['MyPK'] === mapAttr.MyPK)[0];
  };
  const MapAttrLinkageTrigger = async (mapAttr, value, refPKVal, rowData, rowIdx, option: ddlInfo | null = null) => {
    const { GetActionDLLData, GetFullData, GetFullDataDtl } = mapExtParse();
    //修改对应的T值
    if (option != null) rowData[mapAttr.KeyOfEn + 'T'] = option.label;
    //处理扩展属性
    const mapExts = mapAttr.mapExts || [];
    for (const mapExt of mapExts) {
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          const data = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, rowData, 'Dtl');
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, rowIdx, mapExt.AtPara, rowData);
          break;
        case 'FullCtrl':
        case 'TBFullCtrl':
        case 'Pop':
          //不填充
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;

          //填充主表控件,控制字段是Tag5
          if (mapExt.Tag5 != 'None') {
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, rowData, mainData.value, true);
            if (fullData == null) continue;
            if (Array.isArray(fullData)) {
              if (fullData.length == 1) {
                for (const item in fullData[0]) {
                  if (tableData.value[rowIdx].hasOwnProperty(item)) tableData.value[rowIdx] = fullData[0][item];
                }
                break;
              }
              if (fullData.length > 1) {
                //填充多条从表数据
                ChangeParentAttr(mapAttr.KeyOfEn, 'FullData', fullData, rowIdx, mapExt.AtPara, tableData.value[rowIdx]);
              }
            }
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, rowData, 'Dtl');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, rowIdx, mapExt.AtPara, rowData);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, rowData, mapExt.AtPara, mainData.value);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null, rowIdx, mapExt.AtPara, rowData);
          break;
        default:
          break;
      }
    }
  };
  /**
   * 初始化从表表头信息
   * @constructor
   */
  const haveShowColums = ref(',');
  const secondHeader = ref(',');
  const gradeHeader = ref(',');
  const secondArr = ref<string[]>([]);
  const gradeArr = ref<string[]>([]);
  const InitColumn = () => {
    //二级表头
    secondHeader.value = GetPara(mapDtl.value.AtPara, 'MultiTitle') || '';
    secondArr.value = secondHeader.value.split(';');
    //三级表头
    gradeHeader.value = GetPara(mapDtl.value.AtPara, 'MultiTitle1') || '';
    gradeArr.value = gradeHeader.value.split(';');
    mapAttrs.value.forEach((attr) => {
      if (gradeHeader.value.includes(',' + attr.KeyOfEn + ',') == false && secondHeader.value.includes(',' + attr.KeyOfEn + ',') == false) {
        columns.value.push(SetColumnByAttr(attr));
      }
      //在三级目录下面
      if (gradeHeader.value.includes(',' + attr.KeyOfEn + ',') == true) {
        const str = gradeArr.value.find((item) => item.includes(',' + attr.KeyOfEn + ',')) || '';
        const strs = str.split(',');
        if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
          haveShowColums.value += strs[0] + ',';
          columns.value.push({
            title: strs[0],
            children: GetChildren(strs, null),
          });
        }
      }
      //在二级目录下面
      if (secondHeader.value.includes(',' + attr.KeyOfEn + ',') == true) {
        let str = secondArr.value.find((item) => item.includes(',' + attr.KeyOfEn + ',')) || '';
        let strs = str.split(',');
        if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
          //需要先判断二级目录是否在三级目录下
          if (gradeHeader.value.includes(',' + strs[0] + ',') == true) {
            str = gradeArr.value.find((item) => item.includes(',' + strs[0] + ',')) || '';
            strs = str.split(',');
            if (str != '' && haveShowColums.value.includes(',' + strs[0] + ',') == false) {
              haveShowColums.value += strs[0] + ',';
              columns.value.push({
                title: strs[0],
                children: GetChildren(strs, null),
              });
            }
          } else {
            haveShowColums.value += strs[0] + ',';
            columns.value.push({
              title: strs[0],
              children: GetChildren(null, strs),
            });
          }
        }
      }
    });
  };
  /**
   * 设置每一个字段的属性
   * @param attr
   * @constructor
   */
  const SetColumnByAttr = (attr) => {
    columnKeys.value += attr.KeyOfEn + ',';
    const field = (GetPara(mapDtl.value.AtPara, 'OrderField') || '') + ',';
    const isEdit = attr.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0;
    const column = {
      title: attr['Name' + sysLang] || attr.Name,
      key: attr.KeyOfEn,
      dataIndex: attr.KeyOfEn,
      align: 'center',
      width: (attr.UIWidth || 100) + 28,
      edit: isEdit,
      attr: attr,
      className: isEdit === false || (attr.MyDataType == 1 && attr.TextModel == 1) ? 'my-handle' : '',
      resizable: true,
      ellipsis: true,
    };
    if (!!field && field.includes(attr.KeyOfEn + ',') && isSave.value == false) {
      column['defaultSortOrder'] = 'descend';
      if (attr.MyDataType == 2 || attr.MyDataType === 3 || attr.MyDataType === 4 || attr.MyDataType === 5 || attr.MyDataType === 8)
        column['sorter'] = (a, b) => a[attr.KeyOfEn] - b[attr.KeyOfEn];
      else
        column['sorter'] = (a, b) => {
          return a[attr.KeyOfEn].localeCompare(b[attr.KeyOfEn]);
        };
    }
    return column;
  };
  /**
   * 获取表头的子级
   * @param grade
   * @param second
   * @constructor
   */
  const GetChildren = (grade: string[] | null, second: string[] | null) => {
    let curColumns: any[] = [];
    if (grade != null) {
      //获取grade的子级
      for (let i = 1; i < grade.length; i++) {
        const key = grade[i];
        if (key === '') continue;
        //判断是否在mapAttr中，不存在是二级目录
        const attr = mapAttrs.value.filter((item) => item.KeyOfEn === key);
        if (attr.length != 0) {
          curColumns.push(SetColumnByAttr(attr[0]));
          continue;
        }
        haveShowColums.value += key + ',';
        const str = secondArr.value.find((item) => item.includes(key + ',')) || '';
        curColumns.push({
          title: key,
          children: GetChildren(null, str.split(',')),
        });
      }
    }
    if (second != null) {
      //second
      for (let i = 1; i < second.length; i++) {
        const key = second[i];
        if (key === '') continue;
        //判断是否在mapAttr中
        const attr = mapAttrs.value.filter((item) => item.KeyOfEn === key);
        if (attr.length != 0) {
          curColumns.push(SetColumnByAttr(attr[0]));
          continue;
        }
      }
    }
    return curColumns;
  };

  onMounted(async () => {
    await InitPage(false);
  });
  const { ConvertDataToDB, ConvertDataFromDB } = userConvertData();
  /**
   * 计算合计值
   */
  const totals = computed(() => {
    const arr = {};
    tableData.value.forEach((item) => {
      summaryMapExts.value.forEach((mapExt) => {
        if (!arr[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = 0;
        switch (parseInt(mapExt?.DoWay)) {
          case 1: // 求和
          case 2: //求平均
            arr[mapExt.AttrOfOper] = (parseFloat(arr[mapExt.AttrOfOper]) + parseFloat(item[mapExt.AttrOfOper])).toFixed(2);
            break;
          case 3: //求最大值
            if (arr[mapExt.AttrOfOper] < item[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = item[mapExt.AttrOfOper];
            break;
          case 4: //求最小值
            if (arr[mapExt.AttrOfOper] > item[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = item[mapExt.AttrOfOper];
            break;
        }
      });
    });
    summaryMapExts.value.forEach((mapExt) => {
      if (parseInt(mapExt?.DoWay) === 2) arr[mapExt.AttrOfOper] = parseFloat(arr[mapExt.AttrOfOper]) / tableData.value.length;
    });
    return { arr };
  });

  const BtnClick = async (btnName) => {
    const result = await FrmDtlBtnClick.TableTopBtnClick(btnName, mapDtl.value.No, props.params.WorkID, '', JSON.stringify(props.mainData));
    if (!result) return;
    baseComponent.value?.handleGPNCallback(result, btnName);
    setTimeout(() => {
      InitPage(true);
    }, 100);
  };
  /**
   * 行编辑，经典表单显示
   * @param rowIdx
   * @constructor
   */
  const EditOrViewRow = (rowIdx) => {
    popModal.modalType = 'dtlFrm';
    popModal.visible = true;
    popModal.title = '新增/编辑';
    popModal.width = window.innerWidth * 0.8;
    popModal.width = window.innerWidth * 0.8;
    popModal.height = {
      height: impExt.value.H || window.innerHeight * 0.8 + 'px',
    };
    popModal.isReadonly = isSave.value === true ? false : true;
    popModal.refOID = tableData.value[rowIdx]['OID'];
  };

  const triggerSummary = () => {
    const isCompute = parseInt(GetPara(mapDtl.value.AtPara, 'PageSize') || '0') === 0 ? true : false;
    if (isCompute == false) return;
    for (const curMapAttr of subTableAttrList.value) {
      // 如果这个列是数字
      const isNumber = isInt(curMapAttr as MapAttrExt) || isFloat(curMapAttr as MapAttrExt) || isMoney(curMapAttr as MapAttrExt);
      // 找到这个列的扩展配置
      const mapExts = curMapAttr.mapExts || [];
      // 如果存在配置
      if (isNumber && mapExts.length > 0) {
        for (const mapExt of mapExts) {
          switch (mapExt.ExtModel) {
            case 'NumEnterLimit': //对从表列求值
              ChangeDtlData({ dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Number', filterCond: mapExt.Tag5 });
              break;
            case 'NumFiledSumAvg': //从表列求和求平均
              break;
            default:
            // message.error(mapExt.AttrOfOper + '的扩展属性' + mapExt.ExtModel + '还未解析');
          }
        }
      }
    }
  };

  watch(
    tableData,
    (val) => {
      console.log({ val });
      triggerSummary();
    },
    { deep: true },
  );
  const handlerClose = async () => {
    popModal.visible = false;
    if (popModal.modalType == 'dtlFrm') await InitPage(false);
    //await InitPage();
  };
  /**
   * 新增
   * @constructor
   */
  const AddRow = async () => {
    if (parseInt(mapDtl.value.EditModel) != 0) {
      const row: Record<string, any> = {};
      orginMapAttrs.value.forEach((attr) => {
        row[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
      });
      row['OID'] = 0;
      await FrmDtlBtnClick.TableBtnAddClick(mapDtl.value.No, props.params.WorkID, JSON.stringify(props.mainData), row, props.params.FID);
      //tableData.value.push(row);
      //tempData.value++;
      componentKey.value++;
      EditOrViewRow(row);
      return;
    }
    //执行新增.
    let row: Record<string, any> = {};
    orginMapAttrs.value.forEach((attr) => {
      row[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
    });
    if (mapDtl.value.IsCopyFirstData === 1 && tableData.value.length > 0) row = tableData.value[0];
    row['OID'] = 0;
    await FrmDtlBtnClick.TableBtnAddClick(mapDtl.value.No, props.params.WorkID, JSON.stringify(props.mainData), row, props.params.FID);
    if (isPageSize.value) {
      if (tableData.value.length == pagination.value.defaultPageSize) {
        await SaveAll(true);
        tableData.value = [];
        pagination.value.current++;
      }
      tableData.value.push(await ConvertDataFromDB(row, mapAttrs.value as any));
      rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
      pagination.value.total = pagination.value.total + 1;
      pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
    } else {
      tableData.value.push(await ConvertDataFromDB(row, mapAttrs.value as any));
      rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
    }

    tempData.value++;
  };
  /**
   *  广州市政方法处理
   * @constructor
   */
  // const GZSZFunc = async (row: Record<string, any>) => {
  //   //广州市政
  //   if (!CommonConfig.IsGZFrm) {
  //     return;
  //   }
  //   // const result = await FrmDtlBtnClick.TableTopBtnClick('新增', mapDtl.value.No, props.params.WorkID, '', JSON.stringify(props.mainData));
  //   //送审流程，强条从表的工程名和主表项目名称一致,专业名称和图纸表中的专业一致
  //   if (mapDtl.value.No == 'ND1203QiangTiaoTongJiBiao') {
  //     //项目名称
  //     const PrjName=props.mainData.PrjName;
  //     row['GongChengMingChen'] = PrjName;
  //     //获取专业
  //     const handler = new HttpHandler('BP.App.NetCore.GZSZ.GZ_CommTS');
  //     handler.AddPara('WorkID', props.params.WorkID);
  //     const data = await handler.DoMethodReturnJson('GetZhuanYeInfo');
  //     const ZhuanYe = data.Table[0].ZhuanYe;
  //     const ZhuanYeT = data.Table[0].ZhuanYeT;
  //     alert(ZhuanYe);
  //     row['SQL_ZhuanYe'] = ZhuanYe;
  //     row['SQL_ZhuanYeT'] = ZhuanYeT;
  //   }
  // };
  /**
   * 在指定位置下面插入一行
   * @param index
   * @constructor
   */
  const InsertRow = async (index) => {
    //插入之前保存数据
    //await SaveAll(true);
    const result = await FrmDtlBtnClick.TableTopBtnClick('新增', mapDtl.value.No, props.params.WorkID, '', JSON.stringify(props.mainData));
    if (typeof result === 'string' && result === 'reload') {
      await InitPage(true);
      return;
    }
    if (typeof result === 'boolean' && result === false) {
      return;
    }
    const row: Record<string, any> = {};
    orginMapAttrs.value.forEach((attr) => {
      row[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
    });
    row['OID'] = 0;
    await FrmDtlBtnClick.TableBtnAddClick(mapDtl.value.No, props.params.WorkID, JSON.stringify(props.mainData), row, props.params.FID);
    const data = JSON.parse(JSON.stringify(tableData.value));
    data.splice(index + 1, 0, await ConvertDataFromDB(row, mapAttrs.value as any));
    tableData.value = data;
    rowMapAttrs.value.splice(index + 1, 0, cloneDeep(mapAttrs.value));
    if (isPageSize.value) {
      pagination.value.total = pagination.value.total + 1;
      pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
    }
    tempData.value++;
  };
  /**
   * 复制数据
   * @param index
   * @constructor
   */
  const CopyRow = async (index) => {
    //复制之前保存数据
    //await SaveAll(true);
    const result = await FrmDtlBtnClick.TableTopBtnClick('新增', mapDtl.value.No, props.params.WorkID, '', JSON.stringify(props.mainData));
    if (typeof result === 'string' && result === 'reload') {
      await InitPage(true);
      return;
    }
    if (typeof result === 'boolean' && result === false) {
      return;
    }
    const row: Record<string, any> = cloneDeep(tableData.value[index]);
    row['OID'] = 0;
    const data = JSON.parse(JSON.stringify(tableData.value));
    data.splice(index + 1, 0, await ConvertDataFromDB(row, mapAttrs.value as any));
    tableData.value = data;
    rowMapAttrs.value.splice(index + 1, 0, cloneDeep(mapAttrs.value));
    if (isPageSize.value) {
      pagination.value.total = pagination.value.total + 1;
      pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
    }
    tempData.value++;
  };
  /**
   * 新增行设置默认值
   * @param defVal
   * @param attr
   * @constructor
   */
  const GetValByDefVal = (defVal, attr) => {
    switch (defVal) {
      case '@WebUser.No':
      case '@CurrWorker':
        return WebUser.No;
      case '@WebUser.Name':
        return WebUser.Name;
      case '@WebUser.DeptNo':
        return WebUser.DeptNo;
      case '@WebUser.DeptNoName':
        return WebUser.DeptNoName;
      case '@WebUser.DeptNoNameOfFull':
      case '@WebUser.DeptNoFullName':
        return WebUser.DeptNoNameOfFull;
      case '@WebUser.OrgNo':
        return WebUser.OrgNo;
      case '@WebUser.OrgName':
        return WebUser.OrgName;
      case '@RDT':
        if (props.isReadonly == true || attr.UIIsEnable === 0) return dayjs().format(GetDateTimeOption(attr));

        let dataFormat = 'YYYY-MM-DD';
        switch (attr.IsSupperText) {
          case 0:
            break;
          case 1:
            dataFormat = 'YYYY-MM-DD HH:mm';
            break;
          case 2:
            dataFormat = 'YYYY-MM-DD HH:mm:ss';
            break;
          case 3:
            dataFormat = 'YYYY-MM';
            break;
          case 4:
            dataFormat = 'HH:mm';
            break;
          case 5:
            dataFormat = 'HH:mm:ss';
            break;
          case 6:
            dataFormat = 'MM-DD';
            break;
          case 7:
            dataFormat = 'YYYY';
          default:
            message.error('没有找到指定的时间类型');
            return;
        }
        return dayjs().format(dataFormat);
      case '@FK_ND':
        return dayjs().format('YYYY-MM');
      case '@yyyy年MM月dd日':
      case '@yyyy年MM月dd日HH时mm分':
      case '@yy年MM月dd日':
      case '@yy年MM月dd日HH时mm分':
      case '@yyyy-MM-dd':
      case '@yyyy':
        return dayjs().format(defVal.replace('@', '').replace('yyyy', 'YYYY').replace('dd', 'DD'));
      default:
        if (attr.MyDataType === DataType.AppInt) {
          if (!!defVal) return parseInt(defVal);
          return '';
        }
        if (attr.MyDataType === DataType.AppFloat || attr.MyDataType === DataType.AppMoney) {
          if (!!defVal) return parseFloat(defVal);
          return '';
        }
        return defVal;
    }
  };
  /**
   * 批量删除行
   * @constructor
   */
  const DeleteRows = async () => {
    if (tableSelectedRowKeys.value.length == 0) {
      message.error('请选择需要删除的行');
      return;
    }
    for (const rowIdx of tableSelectedRowKeys.value) {
      const rowData = tableData.value[rowIdx];
      //删除行
      if (rowData['OID'] != 0) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        handler.AddPara('FK_MapDtl', mapDtl.value.No);
        handler.AddPara('RefOID', rowData['OID']);
        handler.AddPara('RefPKVal', props.params.WorkID);
        const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
        if (typeof data === 'string' && data.includes('err@')) {
          message.error(data.replace('err@', ''));
          return;
        }
      }
    }
    for (let i = tableSelectedRowKeys.value.length - 1; i >= 0; i--) {
      tableData.value.splice(tableSelectedRowKeys.value[i], 1);
      rowMapAttrs.value.splice(tableSelectedRowKeys.value[i], 1);
    }
    tableSelectedRowKeys.value = [];
    if (isPageSize.value) {
      await InitPage(false);
      return;
    }
    tempData.value--;
    triggerSummary();
  };

  const DeleteAllRows = async () => {
    let refPK = '0';
    for (const item of tableData.value) {
      if (item.OID != 0) {
        refPK = item.RefPK;
        break;
      }
    }
    if (refPK != '0') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('FK_MapDtl', mapDtl.value.No);
      handler.AddPara('RefPKVal', refPK);
      await handler.DoMethodReturnString('Dtl_DeleteAllRow');
    }
    await InitPage(false);
  };
  /**
   * 删除行
   * @constructor
   */
  const DeleteRow = async (index = -1, record) => {
    if (index == -1) {
      //获取选中的值
      return;
    }
    const result = await FrmDtlBtnRowClick.BtnClick('Delete', mapDtl.value.No, props.params.WorkID, record['OID'], JSON.stringify(props.mainData));
    if (typeof result === 'string' && result === 'reload') {
      await InitPage(true);
      return;
    }
    if (typeof result === 'boolean' && result === false) {
      return;
    }

    //删除行数据
    if (record != null) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('FK_MapDtl', mapDtl.value.No);
      handler.AddPara('RefOID', record['OID']);
      handler.AddPara('RefPKVal', props.params.WorkID);
      const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      tableData.value.splice(index, 1);
      rowMapAttrs.value.splice(index, 1);
      if (isPageSize.value) {
        pagination.value.total = pagination.value.total - 1;
        pagination.value.showTotal = () => `共 ${pagination.value.total} 条`;
      }
      tempData.value--;
      triggerSummary();
    }
  };
  /**
   * 移除行
   * @constructor
   */
  const RemoveRow = (index) => {
    if (index == 0) tableData.value.splice(index, 1);
    else tableData.value.splice(index - 1, 1);
    rowMapAttrs.value.splice(index, 1);
    tempData.value++;
  };
  /**
   * 保存
   * @constructor
   */
  const SaveAll = async (isSaveOnly) => {
    try {
      if (isSave.value === false) return true;
      btnDisabled.value = true;
      let msg = '';
      let str = '';
      //if (tableData.value.length == 0) return true;
      //tableData.value.forEach((item) => (item = ConvertDataToDB(item, mapAttrs.value)));
      //保存从表的校验
      if (isSaveOnly === false) {
        if (mapDtl.value.NumOfDtl > 0 && tableData.value.length == 0) {
          //4msg += '请检查明细表 [' + mapDtl.value.Name + '] ，至少填写' + mapDtl.value.NumOfDtl + '条数据！';
        }
        const newMapAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIIsInput === 1);
        tableData.value.forEach((rowData, idx) => {
          //if (newMapAttrs.length != 0) msg += '明细表[' + mapDtl.value.Name + ']第' + (idx + 1) + '行必填项:\n';
          newMapAttrs.forEach((mapAttr) => {
            if (mapAttr.LGType === FieldTypeS.Enum && rowData[mapAttr.KeyOfEn] === -1)
              str +=
                '字段' +
                mapAttr.Name +
                `值不能为空,
`;
            if (rowData[mapAttr.KeyOfEn] === null || rowData[mapAttr.KeyOfEn] === '')
              str +=
                '字段' +
                mapAttr.Name +
                `值不能为空,
`;
          });

          // 检查字段附件
          const athFieldList = mapAttrs.value.filter((attr) => attr.UIContralType == 6);
          for (const athField of athFieldList) {
            const rowKey = athField.KeyOfEn;
            const athNum = rowData?.[rowKey];
            const minUploadCount = (athField?.ath as Recordable)?.NumOfUpload || 0;
            const maxUploadCount = (athField?.ath as Recordable)?.TopNumOfUpload || 0;
            if (minUploadCount > 0 && athNum == 0) {
              str += `字段附件 [${athField.Name}] 必须要上传文件,\n`;
            }
            if (athNum < minUploadCount) {
              str += `字段附件[${athField.Name}] 上传附件数小于最小数量 ${minUploadCount},\n`;
            }
            if (athNum > maxUploadCount) {
              str += `字段附件[${athField.Name}] 上传附件数大于最大数量 ${minUploadCount},\n`;
            }
          }
          if (str != '')
            msg +=
              '明细表[' +
              mapDtl.value.Name +
              ']第' +
              (idx + 1) +
              `行必填项:
` +
              str;
        });
        if (msg != '') {
          message.error(msg);
          /* message.error({
          content: () => {
            return h('div', { domProps: { innerHTML: msg } });
          },
        });*/
          return false;
        }
      }
      /* const batchSize = 100;
    const totalBatches = Math.ceil(tableData.value.length / batchSize);
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = start + batchSize;
      const batch = tableData.value.slice(start, end);

      try {
        await saveBatch(batch, i + 1, totalBatches);
      } catch (error) {
        console.error(`Failed to save batch ${i + 1}:`, error);
      }
    }*/

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      handler.AddPara('RefPKVal', query.value.WorkID || query.value.RefPKVal);
      handler.AddPara('EnsName', mapDtl.value.No);
      const dtlDatas: Record<string, any>[] = [];
      for (const item of tableData.value) {
        dtlDatas.push(await ConvertDataToDB(item, mapAttrs.value));
      }
      //tableData.value.forEach((item) => dtlDatas.push(await ConvertDataToDB(item, mapAttrs.value)));

      handler.AddPara('Json', encodeURIComponent(JSON.stringify(dtlDatas)));
      const data = await handler.DoMethodReturnString('Dtl_Save');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return false;
      }
      if (Array.isArray(data)) {
        tableData.value = [];
        tableData.value = data;
        for (let item of tableData.value) {
          item = await ConvertDataFromDB(item, mapAttrs.value);
        }
        //tableData.value.forEach((item) => (item = await ConvertDataFromDB(item, mapAttrs.value)));
        tempData.value++;
      }
      if (isSaveOnly == true) {
        //await InitPage();
        message.info(mapDtl.value.Name + '保存成功');
      }
      return true;
    } catch (e) {
      return false;
      message.error(e as string);
    } finally {
      btnDisabled.value = false;
    }
    return true;
  };

  const CheckDtlNum = () => {
    if (mapDtl.value.NumOfDtl === 0) return true;
    if (isPageSize.value) {
      if (mapDtl.value.NumOfDtl > pagination.value.total) {
        message.error(mapDtl.value.Name + '至少含有' + mapDtl.value.NumOfDtl + '条数据');
        return false;
      }
      return true;
    }
    if (mapDtl.value.NumOfDtl > tableData.value.length) {
      message.error(mapDtl.value.Name + '至少含有' + mapDtl.value.NumOfDtl + '条数据');
      return false;
    }
    return true;
  };
  defineExpose({ SaveAll, InitPage, CheckDtlNum });
  /**
   * 导出从表信息
   * @constructor
   */
  const ExpDtl = async () => {
    const header = mapAttrs.value.map((attr) => attr.Name);
    if (GetPara(mapDtl.value.AtPara, 'PageSize') === '0') {
      // 如何从前端获取Attrs？
      const data = tableData.value.map((item) => {
        return mapAttrs.value.map((attr) => {
          return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
        });
      });
      aoaToSheetXlsx({ data, header, filename: mapDtl.value.Name + '.xlsx' });
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddJson(query.value);
    handler.AddPara('PageIdx', 0);
    const result = await handler.DoMethodReturnString('Dtl_DataOfPage');
    const data = JSON.parse(JSON.stringify(result)).map((item) => {
      return mapAttrs.value.map((attr) => {
        return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
      });
    });
    aoaToSheetXlsx({ data, header, filename: mapDtl.value.Name + '.xlsx' });
    return;
  };
  const ImpInvoice = () => {
    //const url = GloComm.UrlGPN('GPN_Invoice', 'ss');
    //return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    popModal.modalType = 'ImpInvoice';
    popModal.visible = true;
    popModal.title = '导入发票';
    popModal.width = window.innerWidth * 0.8;
    popModal.height = {
      height: window.innerHeight * 0.6 + 'px',
    };
    popModal.params = {
      EnName: 'GPN_Invoice',
      FrmID: mapDtl.value.No,
      WorkID: props.params.RefPKVal || props.params.WorkID,
      heightIsAuto: true,
    };
  };
  /**
   * 导入从表信息
   * @constructor
   */
  const ImpDtl = (type = 2) => {
    const impType = type === -1 ? parseInt(impExt.value.DoWay) : type;
    //解析从表导入模式  DoWay=1表格查询模式（简单模式）,DoWay=2Excel文件模式，DoWay=1表格查询模式（高级）
    if (impType === 1) {
      popModal.modalType = 'dtlImpSimple';
      popModal.visible = true;
      popModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      popModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      popModal.height = {
        height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      };
      popModal.mapExt = impExt.value;
      popModal.itemNames = '';
    }

    if (impType === 2) {
      popModal.modalType = 'dtlExcelImp';
      popModal.visible = true;
      popModal.title = '选择Excel文件';
      popModal.width = window.innerWidth * 0.6;
      popModal.height = {
        height: window.innerHeight * 0.5 + 'px',
      };
      popModal.mapExt = impExt.value;
    }
    if (impType === 3) {
      popModal.modalType = 'dtlImp';
      popModal.visible = true;
      popModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      popModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      popModal.height = {
        height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      };
      popModal.mapExt = impExt.value;
      popModal.itemNames = '';
    }
    if (impType === 4) {
      popModal.modalType = 'dtlTreeEns';
      popModal.visible = true;
      popModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      popModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      popModal.height = {
        height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      };
      popModal.mapExt = impExt.value;
      popModal.itemNames = '';
    }
    //自定义URL导入
    if (impType === 5) {
      let tag1 = impExt.value.Tag1 || '';
      if (!tag1) {
        message.error('请配置自定义导入的URL');
        return;
      }
      popModal.modalType = 'dtlImpBySelfUrl';
      popModal.visible = true;
      popModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      popModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      popModal.width = popModal.width < window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      popModal.height = {
        height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      };
      popModal.mapExt = impExt.value;
      if (tag1.includes('@')) {
        tag1 = DealExp(tag1, props.mainData);
        tag1 = DealExp(tag1, props.params);
      }
      if (tag1.split('?')[0].endsWith('.vue')) {
        popModal.component = markRaw(useCachedComponentLoader(tag1));
        popModal.params = getComponentParamsByUrl(tag1) || {};
        popModal.type = 'component';
      } else {
        popModal.url = tag1;
        popModal.type = 'iframe';
      }
      popModal.itemNames = '';
    }
  };
  /**
   * 批量编辑数据
   * @constructor
   */
  const BatchUpdateRows = () => {
    if (tableSelectedRowKeys.value.length == 0) {
      message.error('请选择需要编辑的行');
      return;
    }
    popModal.modalType = 'dtlBatchFrm';
    popModal.visible = true;
    popModal.title = mapDtl.value.Name + '编辑';
    popModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: '500px',
    };
    dtlParams.value = cloneDeep(props.params);
    dtlParams.value['WorkID'] = tableData.value[tableSelectedRowKeys.value[0]].OID as string;
  };

  const dtlImp = shallowRef<InstanceType<typeof DtlImp>>();
  const dtlImpSimple = shallowRef<InstanceType<typeof DtlImpSimple>>();
  const dtlBatchFrm = shallowRef<InstanceType<typeof DtlBatchFrm>>();
  const dtlTreeEns = shallowRef<InstanceType<typeof DtlTreeEns>>();
  const selfComponent = shallowRef<InstanceType<typeof Component>>();
  const iframeRef = shallowRef<HTMLIFrameElement>();
  const PopModalOK = async () => {
    if (popModal.modalType === 'dtlExcelImp') {
      await InitPage(false);
    }
    if (popModal.modalType === 'dtlImp') {
      const arrs = dtlImp.value.checkInfoList || [];
      cacheSelectedData.value = dtlImp.value.checkedList || [];
      const key = impExt.value.Tag4;
      if (!key) {
        for (const item of arrs) {
          //执行新增.
          orginMapAttrs.value.forEach((attr) => {
            if (!item[attr.KeyOfEn]) item[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
          });
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
      }
    }
    if (popModal.modalType === 'dtlImpSimple') {
      const arrs = dtlImpSimple.value.checkInfoList || [];
      cacheSelectedData.value = dtlImpSimple.value.checkedList || [];
      const key = impExt.value.Tag4;
      if (!key) {
        for (const item of arrs) {
          //执行新增.
          orginMapAttrs.value.forEach((attr) => {
            if (!item[attr.KeyOfEn]) item[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
          });
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
      } else {
        const data = tableData.value;
        data.forEach((item) => {
          for (const arr of arrs) {
            if (item[key] === arr[key]) break;
            arr.OID = 0;
            tableData.value.push(arr);
            rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
          }
        });
        tempData.value++;
      }
    }
    if (popModal.modalType === 'dtlTreeEns') {
      const arrs = dtlTreeEns.value.checkInfoList || [];
      cacheSelectedData.value = dtlTreeEns.value.checkedList || [];
      const key = impExt.value.Tag4;
      if (!key) {
        for (const item of arrs) {
          //执行新增.
          orginMapAttrs.value.forEach((attr) => {
            if (!item[attr.KeyOfEn]) item[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
          });
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
      } else {
        const data = tableData.value;
        data.forEach((item) => {
          for (const arr of arrs) {
            if (item[key] === arr[key]) break;
            arr.OID = 0;
            tableData.value.push(arr);
            rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
          }
        });
        tempData.value++;
      }
    }
    //自定义
    if (popModal.modalType === 'dtlImpBySelfUrl') {
      let arrs = [];
      if (popModal.type === 'component') {
        arrs = selfComponent.value.checkInfoList || [];
        cacheSelectedData.value = selfComponent.value.checkedList || [];
      }
      if (popModal.type === 'iframe') {
        iframeRef.value?.contentWindow?.postMessage?.({ Save: Save }, '*');
        iframeRef.value?.addEventListener('Save', () => {});
      }
      const key = impExt.value.Tag4;
      if (!key) {
        for (const item of arrs) {
          //执行新增.
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
      } else {
        const data = tableData.value;
        data.forEach((item) => {
          for (const arr of arrs) {
            if (item[key] === arr[key]) break;
            arr.OID = 0;
            tableData.value.push(arr);
            rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
          }
        });
        tempData.value++;
      }
    }
    if (popModal.modalType === 'dtlBatchFrm') {
      const result = await dtlBatchFrm.value.VerifyFormData(true);
      if (result != null) {
        let OIDs = '';
        let keys = '';
        for (const item of tableSelectedRowKeys.value) {
          OIDs += tableData.value[item].OID + ',';
          rowMapAttrs.value[item]
            .filter((mapAttr) => mapAttr.UIVisible == 1 && mapAttr.UIIsEnable == 1)
            .forEach((mapAttr) => {
              if (!!result[mapAttr.KeyOfEn]) {
                //枚举
                if (mapAttr.LGType === FieldTypeS.Enum && result[mapAttr.KeyOfEn] != -1) tableData.value[item][mapAttr.KeyOfEn] = result[mapAttr.KeyOfEn];
                //下拉框
                else if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK) {
                  tableData.value[item][mapAttr.KeyOfEn] = result[mapAttr.KeyOfEn];
                  mapAttr['ddl'] = [];
                  mapAttr['ddl'].push({
                    value: result[mapAttr.KeyOfEn],
                    label: result[mapAttr.KeyOfEn + 'Text'] || result[mapAttr.KeyOfEn + 'T'],
                  });
                } else {
                  tableData.value[item][mapAttr.KeyOfEn] = result[mapAttr.KeyOfEn];
                  if (popKeys.value.includes(mapAttr.KeyOfEn) && keys.includes(mapAttr.KeyOfEn + ',') === false) keys += mapAttr.KeyOfEn + ',';
                }
              }
            });
        }
      }
    }
    if (popModal.modalType === 'ImpInvoice') {
      await InitPage(false);
    }
    tempData.value--;
    popModal.visible = false;
  };
  /**
   * 获取枚举、外键、外部数据源的选择集合
   * @param mapAttr
   * @constructor
   */
  const GetDDLOption = (mapAttr: MapAttrExt, frmData) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: '',
          label: '绑定的外键枚举值丢失',
        },
      ];
    const options = ref<Array<ddlInfo>>([]);
    let data = frmData[mapAttr.KeyOfEn];
    if (data == undefined) data = frmData[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = frmData.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if (mapAttr.UIContralType == UIContralType.DDL) {
        options.value.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.value.push({
          value: item.StrKey || item.IntKey,
          label: item.Lab,
        });
      });
      return options;
    }
    //只读的状态时
    if ((data == undefined || uiBindKey === 'Blank') && (props.isReadonly == true || mapAttr.UIIsEnable == 0)) {
      let valText = mainData.value[mapAttr.KeyOfEn + 'Text'] || '';
      if (valText == '') valText = mainData.value[mapAttr.KeyOfEn + 'T'] || '';
      return [
        {
          value: mainData.value[mapAttr.KeyOfEn],
          label: valText,
        },
      ];
    }
    if (data == undefined)
      return [
        {
          value: '',
          label: '请选择',
        },
      ];
    if (mapAttr.UIContralType == UIContralType.DDL && mapAttr.LGType === FieldTypeS.Enum) {
      data.unshift({
        No: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
        Name: '-无-',
      });
      return data.map((item) => {
        return {
          value: mapAttr.LGType === FieldTypeS.Enum && mapAttr.MyDataType === DataType.AppInt ? item.No : item.No.toString(),
          label: item.Name,
        };
      });
    }
    return data.map((item) => {
      return {
        value: mapAttr.LGType === FieldTypeS.Enum && mapAttr.MyDataType === DataType.AppInt ? item.No : item.No.toString(),
        label: item.Name,
      };
    });
  };
  /**
   * 时间类型格式
   * @param mapAttr
   * @constructor
   */
  const GetDateTimeOption = (mapAttr: MapAttrExt) => {
    switch (parseInt(mapAttr.IsSupperText)) {
      case 0:
        return 'YYYY-MM-DD';
      case 1:
        return 'YYYY-MM-DD HH:mm';
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM';
      case 4:
        return 'HH:mm';
      case 5:
        return 'HH:mm:ss';
      case 6:
        return 'MM-DD';
      case 7:
        return 'YYYY';
      case 8:
        return 'MM';
      default:
        return 'YYYY-MM-DD';
    }
  };
</script>

<style lang="less" scoped>
  .van-h5 {
    position: relative;
    padding: 10px 32px;
    color: #000;
    font-size: 14px;
    font-weight: 700;
    background-color: #f2f5f7;
    &::before {
      content: '';
      position: absolute;
      top: 30%;
      left: 12px;
      width: 5px;
      height: 18px;
      border-radius: 10px;
      background-color: #ff7346;
    }
  }
  .must-input {
    color: red;
  }
  button {
    margin-right: 5px;
    margin-bottom: 5px;
  }
</style>
