<template>
  <BaseComponent ref="baseComponent">
    <div class="p-1">
      <Spin :spinning="loading" style="background-color: white">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div v-else class="content" ref="contentRef">
          <div style="margin-bottom: 5px">
            <div v-if="isShowGF" class="GroupBar GroupTitle" :class="frmStyleContent.GroupTitle">
              <span>
                <i
                  :class="groupField.IsZDPC == 1 ? 'glyphicon glyphicon-plus' : 'glyphicon glyphicon-minus'"
                  @click="groupField.IsZDPC === 1 ? (groupField.IsZDPC = 0) : (groupField.IsZDPC = 1)"
                ></i
                >{{ groupField['Name' + sysLang] || groupField.Lab }}
              </span>
              <div style="text-align: right">
                <!--                <Button v-if="isInsert" @click="AddRow" ghost class="gostButton"><PlusOutlined />{{'新增'}}</Button>
                <Popconfirm v-if="isDelete" :title="'确定要删除选择的行吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteRows()">
                  <Button ghost class="gostButton"><CloseOutlined />{{'删除'}}</Button>
                </Popconfirm>

                <Button v-if="isBatchUpdate" @click="BatchUpdateRows" ghost class="gostButton"><EditOutlined />{{'批量编辑'}}</Button>-->
                <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled" ghost class="gostButton label"><CheckOutlined />{{ '保存' }}</Button>
                <template v-for="item in btnList" :key="item">
                  <Button type="default" @click="BtnClick(item)" ghost class="gostButton label">
                    {{ item }}
                  </Button>
                </template>
                <Button v-if="mapDtl.ImpModel === '1'" @click="ExpDtl" ghost class="gostButton label"><UploadOutlined />{{ '导出' }}</Button>
                <template v-if="(isImp || isExcelImp) && isSave">
                  <Button v-if="isImp && isExcelImp === false" @click="ImpDtl(-1)" ghost class="gostButton label"><DownloadOutlined />{{ '导入' }}</Button>
                  <Button v-else-if="isImp === false && isExcelImp" @click="ImpDtl(2)" ghost class="gostButton label"><DownloadOutlined />{{ '导入' }}</Button>
                  <template v-else>
                    <Dropdown placement="bottomLeft" arrow>
                      <Button ghost class="gostButton label"><DownloadOutlined />{{ '导入' }}</Button>
                      <template #overlay>
                        <Menu>
                          <MenuItem @click="ImpDtl(-1)">{{ impName }}</MenuItem>
                          <MenuItem @click="ImpDtl(2)">{{ 'Excel导入' }}</MenuItem>
                        </Menu>
                      </template>
                    </Dropdown>
                  </template>
                </template>
                <Button v-if="GetPara(mapDtl.AtPara, 'IsFullShow') === '1'" @click="fullScreen" ghost class="gostButton label">
                  <FullscreenOutlined />
                </Button>
              </div>
            </div>
            <div v-else style="text-align: right">
              <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled"><CheckOutlined />{{ '保存' }}</Button>
              <template v-for="item in btnList" :key="item">
                <Button type="default" @click="BtnClick(item)">
                  {{ item }}
                </Button>
              </template>
              <Button v-if="mapDtl.ImpModel === '1'" @click="ExpDtl"><UploadOutlined />{{ '导出' }}</Button>
              <Button v-if="isImp && isSave" @click="ImpDtl"><DownloadOutlined />{{ '导入' }}</Button>
              <Button v-if="GetPara(mapDtl.AtPara, 'IsFullShow') === '1'" @click="fullScreen">
                <FullscreenOutlined />
              </Button>
            </div>
          </div>
          <ConfigProvider :getPopupContainer="getPopupContainer">
            <div ref="tableRef" :style="groupField.IsZDPC == 1 ? { minHeight: '0', height: '0', overflow: 'hidden' } : ''">
              <Table
                :columns="columns"
                :data-source="tableData"
                :expandedRowKeys="expandedRowKeys"
                bordered
                size="small"
                :key="tempData"
                :pagination="false"
                :scroll="getScroll"
                :row-class-name="getRowClass"
                @resizeColumn="handleResizeColumn"
                :style="{ height: '100%', overflow: 'auto' }"
              >
                <template #headerCell="{ column }">
                  <template v-if="column.attr !== undefined && column.attr.UIIsInput">
                    <span class="must-input">*</span><span>{{ column.title }}</span>
                  </template>
                </template>
                <template #bodyCell="{ column, index, record }">
                  <template v-if="!!column.attr && (column.attr.UIIsEnable === 0 || column.edit == false) && column.attr.UIContralType != 6">
                    <template v-if="column.key === treeKey"> {{ record[column.key] }}.{{ record[column.key + 'T'] || record[column.key + 'Text'] }} </template>
                    <template v-else-if="column.attr.UIContralType === UIContralType.HandWriting">
                      <img :src="GetImgSrc(column.attr, record[column.key])" onerror="this.style.dispaly='none'" :style="{ width: '100%', height: '32px' }" />
                    </template>
                    <template v-else>
                      <template v-if="columnKeys.includes(',' + column.key + 'T,') || columnKeys.includes(',' + column.key + 'Text,')">
                        {{ record[column.key] }}
                      </template>
                      <template v-else>
                        {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                      </template>
                    </template>
                  </template>
                  <template v-if="column.key != '_sys_default_idx' && !!column.attr && (column.edit == true || column.attr.UIContralType === 6)">
                    <template v-if="isNumber(column.attr) && !!record.children">
                      {{ record[column.key] }}
                    </template>
                    <OneMapAttr
                      v-else
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
                      :is-reload="true"
                      :isDtl="true"
                      :rowIdx="index"
                      @update-row="(key, val, index) => updateRow(key, val, index)"
                    />
                  </template>

                  <template v-if="column.key === 'Oper'">
                    <Button v-if="parseInt(mapDtl.EditModel) != 0" type="link" @click="EditOrViewRow(index)"><EditOutlined /></Button>
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
    <Modal
      v-model:open="popModal.visible"
      v-if="popModal.modalType === 'dtlFrm'"
      :title="popModal.title"
      :width="popModal.width"
      :bodyStyle="{
        padding: '0px 12px !important',
      }"
      :footer="null"
      :style="popModal.height"
      @cancel="handlerClose"
    >
      <DtlFrm
        v-if="popModal.visible === true && popModal.modalType === 'dtlFrm'"
        ref="dtlFrm"
        :refOID="popModal.refOID"
        :refPKVal="props.params.WorkID"
        :mapDtl="mapDtl"
        :params="props.params"
        :isReadonly="popModal.isReadonly"
        @handler-close="handlerClose"
        :key="componentKey"
      />
    </Modal>
    <Modal
      v-else
      v-model:open="popModal.visible"
      :title="popModal.title"
      :width="popModal.width"
      :bodyStyle="{
        padding: '0px 12px !important',
      }"
      :style="popModal.height"
      @cancel="handlerClose"
      @ok="PopModalOK"
    >
      <!-- <DtlExcelImp v-if="popModal.visible === true && popModal.modalType === 'dtlExcelImp'" ref="dtlExcelImp" :params="props.params" /> -->
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
        :refPKVal="props.params.WorkID"
        :rowData="props.rowData"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
      />
      <!--自定义URL导入-->
      <template v-if="popModal.visible === true && popModal.modalType === 'dtlImpBySelfUrl'">
        <component v-if="popModal.type === 'component'" :is="popModal.component" ref="selfComponent" :params="popModal.params" />
        <iframe v-if="popModal.type === 'iframe'" :src="popModal.url" ref="iframeRef" style="width: 100%; height: 100%; border: none"></iframe>
      </template>
      <DtlBatchFrm
        v-if="popModal.visible === true && popModal.modalType === 'dtlBatchFrm'"
        ref="dtlBatchFrm"
        :refPKVal="props.params.WorkID"
        :mapDtl="mapDtl"
        :params="dtlParams"
      />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Button, ConfigProvider, Table, message, TableSummaryRow, TableSummaryCell, TypographyText, Divider, Modal, Dropdown, Menu, MenuItem } from 'ant-design-vue';
  import { CheckOutlined, EditOutlined, DownloadOutlined, UploadOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { computed, provide, reactive, ref, shallowRef, watch, onMounted, markRaw } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr, MapExt } from '/#/entity';
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
  import DtlFrm from '/@/WF/CCForm/DtlFrm.vue';
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
  import type { Component } from 'vue';
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

  const treeKey = ref('');
  const expandedRowKeys = ref<string[]>([]);
  let parentMap = new Map();
  //从表列不能重复的字段
  const dtlIsRepeats = ref<string[]>([]);
  const { GetActionDLLData } = mapExtParse();
  const { isInt, isFloat, isMoney, isNumber, isTextPop, isTextChoiceSearch } = useKeyOfEnType(props.isReadonly);
  const componentKey = ref(0);
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const entityParams = reactive<Recordable>({
    EnName: 'GPN_DtlImpExcel',
    query: {},
    dtlInfo: {},
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
      let arr = [];
      for (let rowData of tableData.value) {
        if (arr.includes(rowData[key]) == false) arr.push(rowData[key]);
        else {
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
    return { y: !isFullScreen.value ? 300 : '100vh', x: 300 };
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
        isFullScreen.value = true;
      } else {
        document.exitFullscreen();
        isFullScreen.value = false;
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
  const isExcelImp = ref(false);
  //初始化页面
  const InitPage = async (isLoad = true) => {
    try {
      loading.value = true;
      tableData.value = [];
      //参数
      query.value = props.params;
      query.value.EnsName = props.dtlInfo['No'];
      query.value.FrmID = props.dtlInfo.FK_MapData;
      query.value.RefPKVal = props.params.WorkID;
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
      treeKey.value = mapDtl.value.InitDBAttrs || '';
      if (!treeKey.value) {
        errorObj.hasError = true;
        errorObj.tips = '没有配置固定行字段的值';
        return;
      }
      //是否启用Excel导入
      isExcelImp.value = (mapDtl.value.AtPara || '').includes('IsExcelExp=1') ? true : false;
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
        isCopyThisData.value = isSave.value === true && mapDtl.value.IsCopyThisData;
        /*//增加序号
        if (parseInt(mapDtl.value.IsShowIdx) === 1)
          columns.value.push({
            title: '',
            key: 'SN',
            width: 50,
            align: 'center',
            className: 'my-handle',
            customRender: ({ index }) => {
              return `${index + 1}`;
            },
          });
*/
        //初始化从表表头信息
        InitColumn();
        //增加操作按钮
        if ((isInsert.value || isDelete.value || isSave.value) && (parseInt(mapDtl.value.IsEnableLink) === 1 || parseInt(mapDtl.value.IsEnableLink2) === 1)) {
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
            const data = await GetActionDLLData(item[mapExt.AttrOfOper], mapExt, 'Doc', refPKVal, item, 'Dtl');
            dtlData[i] = ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, i, item);
          }
      }

      //转成树形结构
      const mapAttr = orginMapAttrs.value.filter((item) => item.KeyOfEn == treeKey.value);
      if (mapAttr.length == 0) {
        message.error('没有找到' + treeKey.value + '的字段属性');
        return;
      }
      const keyData = frmData.value[mapAttr[0].UIBindKey] || [];
      if (keyData.length == 0) {
      }

      //获取根节点
      const root = keyData.filter((item) => item.ParentNo === '0')[0];
      const items = dtlData.filter((item) => item[treeKey.value] === root.No);
      if (items.length == 0) {
        message.error('没有存储固定数据，请查看配置的数据集合是否 正确');
        return;
      }
      const order = keyData.map((item) => {
        return item['No'];
      });

      //排序
      dtlData.sort((a, b) => {
        const indexA = order.indexOf(a[treeKey.value]);
        const indexB = order.indexOf(b[treeKey.value]);
        return indexA - indexB;
      });
      const item = items[0];
      const arr = keyData
        .filter((u) => u.ParentNo === item[treeKey.value])
        .map((u) => {
          return u.No;
        });

      const children = dtlData.filter((u) => arr.includes(u[treeKey.value]));
      children.forEach((i) => {
        i['key'] = i[treeKey.value + 'T'];
        expandedRowKeys.value.push(i[treeKey.value + 'T']);
        tableData.value.push(i);
      });
      /*item['key'] = item[treeKey.value + 'T'];
      expandedRowKeys.value.push(item[treeKey.value + 'T']);
      tableData.value.push(item);*/
      toTree(dtlData, tableData.value, keyData);
      //自动计算父节点的数据
      parentMap = buildParentMap(tableData.value[0]);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
      triggerSummary();
    }
  };
  const treeLeval = ref(1);
  const toTree = (data, tree, keyData) => {
    tree.forEach((item) => {
      //获取keyData下级的目录
      const arr = keyData
        .filter((u) => u.ParentNo === item[treeKey.value])
        .map((u) => {
          return u.No;
        });
      const children = data.filter((u) => arr.includes(u[treeKey.value]));
      let level = 2;
      if (children && children.length > 0) {
        item.children = item.children || [];
        children.forEach((i) => {
          i['key'] = i[treeKey.value + 'T'];
          i['leval'] = level;
          expandedRowKeys.value.push(i[treeKey.value + 'T']);
          item.children.push(i);
        });
        level++;
        toTree(data, item.children, keyData);
      }
      if (treeLeval.value < level) treeLeval.value = level;
    });
  };
  function handleResizeColumn(w, col) {
    col.width = w;
  }
  /**
   * 监听从表数据的变化
   */
  const emit = defineEmits(['update-prop-data']);
  const ChangeDtlData = (args) => {
    //获取主表值的小数位数
    const mainVal = mainData.value[args.mainKey];
    let bit = 2;
    if (mainVal.toString().includes('.')) bit = mainVal.toString().split('.')[1].length;
    //@Sum=求和@Avg=求平均@Max=求最大@Min=求最小
    if (args.type === 'Number') {
      let val = 0;
      tableData.value.forEach((item, idx) => {
        if (idx == 0 && (args.computed === 'Max' || args.computed === 'Min')) val = item[args.dtlKey];
        switch (args.computed) {
          case 'Sum': // 求和
          case 'Avg': //求平均
            val = parseFloat(val) + parseFloat(parseFloat(item[args.dtlKey]).toFixed(bit));
            break;
          case 'Max': //求最大值
            if (val < parseFloat(item[args.dtlKey])) val = parseFloat(item[args.dtlKey]);
            break;
          case 'Min': //求最小值
            if (val > parseFloat(item[args.dtlKey])) val = parseFloat(item[args.dtlKey]);
            break;
        }
      });
      if (args.computed === 'Avg') val = parseFloat(val) / tableData.value.length;
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

  const buildParentMap = (tree) => {
    const parentMap = new Map();
    function traverse(node, parent) {
      parentMap.set(node, parent);
      if (!!node.children) {
        node.children.forEach((child) => {
          traverse(child, node);
        });
      }
    }
    traverse(tree, null);
    return parentMap;
  };
  const getParentNode = (parentMap, childNode) => {
    return parentMap.get(childNode);
  };
  const computerParentNumber = (attrKey, parentMap, rowData, bit) => {
    const parentNode = getParentNode(parentMap, rowData);
    if (!!parentNode) {
      let val = 0;
      parentNode.children.forEach((item) => {
        val = val + (!item[attrKey] ? 0 : parseFloat(parseFloat(item[attrKey]).toFixed(bit)));
      });
      parentNode[attrKey] = parseFloat(val.toFixed(bit));
    }
    computerParentNumber(attrKey, parentMap, parentNode, bit);
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
    //判断这个字段的属性
    const attrs = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === attrKey && isNumber(mapAttr as MapAttrExt));
    if (attrs.length > 0) {
      computerParentNumber(attrKey, parentMap, rowData, attrs[0]['bit']);
    }
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
  const ChangeParentAttr = async (keyOfEn, type, data, rowIdx, rowData) => {
    if (typeof rowData == 'undefined') rowData = tableData.value[rowIdx];
    switch (type) {
      case 'ActiveDDL':
      case 'FullDataDDL':
        rowMapAttrs.value[rowIdx].forEach((mapAttr) => {
          if (mapAttr.KeyOfEn === keyOfEn) {
            const oldVal = rowData[keyOfEn];
            mapAttr['ddl'] = data;
            const result = data.filter((item) => item.value === rowData[keyOfEn]);
            let option = null;
            //if (result.length == 0 && data.length != 0) {
            // option = data[0];
            //}
            if (result.length != 0) option = result[0];
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
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, rowIdx, rowData);
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
                ChangeParentAttr(mapAttr.KeyOfEn, 'FullData', fullData, rowIdx, tableData.value[rowIdx]);
              }
            }
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, rowData, 'Dtl');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, rowIdx, rowData);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, rowData, mainData.value);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null, rowIdx, rowData);
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
    const column = {};
    column['title'] = attr.Name;
    column['dataIndex'] = attr.KeyOfEn;
    column['key'] = attr.KeyOfEn;
    column['align'] = 'center'; //居中
    column['width'] = (attr.UIWidth || 100) + 28;
    column['edit'] = treeKey.value === attr.KeyOfEn ? false : attr.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0; //是否可编辑
    column['attr'] = attr;
    column['isNumber'] = isNumber(attr);
    column['className'] = column['edit'] == false || (attr.MyDataType == 1 && attr.TextModel == 1) ? 'my-handle' : '';
    column['resizable'] = true;
    column['ellipsis'] = true;
    column['customCell'] = SetColor;
    return column;
  };

  const SetColor = (record, _rowIndex, column) => {
    return {
      style: {
        backgroundColor: !!record.children && column['isNumber'] && column['edit'] == false ? '#9cede6a8' : 'white',
        fontWeight: !!record.children && column.key === treeKey.value ? 600 : 400,
        textAlign: !!record.children && column.key === treeKey.value ? 'left' : '',
      },
    };
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
    //generateImage();
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
    for (const curMapAttr of subTableAttrList.value) {
      // 如果这个列是数字
      const isN = isNumber(curMapAttr as MapAttrExt);
      //修改父节点的值

      // 找到这个列的扩展配置
      const mapExts = curMapAttr.mapExts || [];
      // 如果存在配置
      if (isN && mapExts.length > 0) {
        for (const mapExt of mapExts) {
          switch (mapExt.ExtModel) {
            case 'NumEnterLimit': //对从表列求值
              ChangeDtlData({ dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Number' });
              break;
            case 'NumFiledSumAvg': //从表列求和求平均
              break;
            default:
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
      tableData.value.push(row);
      tempData.value++;
      componentKey.value++;
      EditOrViewRow(tableData.value.length - 1);
      return;
    }
    // const result = await FrmDtlBtnClick.TableTopBtnClick('新增', mapDtl.value.No, props.params.WorkID, '', JSON.stringify(props.mainData));
    // if (result instanceof GPNReturnObj && result.data === 'reload') {
    //   await InitPage(true);
    //   return;
    // }
    // if (result instanceof GPNReturnObj && result.ReturnType === GPNReturnType.DoNothing) {
    //   return;
    // }

    //执行新增.
    let row: Record<string, any> = {};
    orginMapAttrs.value.forEach((attr) => {
      row[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
    });
    if (mapDtl.value.IsCopyFirstData === 1 && tableData.value.length > 0) row = tableData.value[0];
    row['OID'] = 0;
    tableData.value.push(await ConvertDataFromDB(row, mapAttrs.value as any));
    rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
    tempData.value++;
  };
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
    const data = JSON.parse(JSON.stringify(tableData.value));
    data.splice(index + 1, 0, await ConvertDataFromDB(row, mapAttrs.value as any));
    tableData.value = data;
    rowMapAttrs.value.splice(index + 1, 0, cloneDeep(mapAttrs.value));

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
    tempData.value--;
    triggerSummary();
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
  const GetDataChildren = (treeData, data) => {
    treeData.children.forEach((item) => {
      data.push(item);
      if (!!item.children && item.children.length > 0) GetDataChildren(item, data);
    });
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
      const dtlDatas: Record<string, any>[] = [];
      for (const item of tableData.value) {
        dtlDatas.push(await ConvertDataToDB(item, mapAttrs.value));
        if (!!item.children && item.children.length > 0) GetDataChildren(item, dtlDatas);
      }
      //保存从表的校验
      if (isSaveOnly === false) {
        if (mapDtl.value.NumOfDtl > 0 && tableData.value.length == 0) {
          //4msg += '请检查明细表 [' + mapDtl.value.Name + '] ，至少填写' + mapDtl.value.NumOfDtl + '条数据！';
        }
        const newMapAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIIsInput === 1);
        dtlDatas.forEach((rowData, idx) => {
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
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      handler.AddPara('RefPKVal', query.value.WorkID || query.value.RefPKVal);
      handler.AddPara('EnsName', mapDtl.value.No);
      handler.AddPara('Json', encodeURIComponent(JSON.stringify(dtlDatas)));
      const data = await handler.DoMethodReturnString('Dtl_Save');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return false;
      }
      /*if (Array.isArray(data)) {
        tableData.value = [];
        tableData.value = data;
        for (let item of tableData.value) {
          item = await ConvertDataFromDB(item, mapAttrs.value);
        }
        //tableData.value.forEach((item) => (item = await ConvertDataFromDB(item, mapAttrs.value)));
        tempData.value++;
      }*/
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
  const ExpDtl = () => {};
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
        height: window.innerHeight * 0.8,
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
      height: impExt.value.H || window.innerHeight * 0.8 + 'px',
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
    if (popModal.modalType === 'dtlImp') {
      const arrs = dtlImp.value.checkInfoList || [];
      cacheSelectedData.value = dtlImp.value.checkedList || [];
      const key = impExt.value.Tag4;
      if (!key) {
        //tableData.value = [];
        //tableData.value = tableData.value.concat(arrs);
        //tableData.value = arrs;
        /*  arrs.forEach((item) => {
        //执行新增.
        tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
        rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
      });*/
        for (const item of arrs) {
          //执行新增.
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
        /*arrs.forEach((item) => {
        //执行新增.
        tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
        rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
      });*/
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
    if (popModal.modalType === 'dtlTreeEns') {
      const arrs = dtlTreeEns.value.checkInfoList || [];
      cacheSelectedData.value = dtlTreeEns.value.checkedList || [];
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
    //自定义
    if (popModal.modalType === 'dtlImpBySelfUrl') {
      let arrs = [];
      if (popModal.type === 'component') {
        arrs = selfComponent.value.checkInfoList || [];
        cacheSelectedData.value = selfComponent.value.checkedList || [];
      }
      if (popModal.type === 'iframe') {
        iframeRef.value?.contentWindow?.postMessage?.({ Save: Save }, '*');
        iframeRef.value?.addEventListener('Save', () => {
          /*callbackFunc = msgListener;
        window.addEventListener('message', listener);
        if (postMsg) {
          iframeRef.value?.contentWindow?.postMessage?.(postMsg.data, postMsg.origin);
        }*/
        });
        //arrs = selfComponent.value.checkInfoList || [];
        //cacheSelectedData.value = selfComponent.value.checkedList || [];
      }
      const key = impExt.value.Tag4;
      if (!key) {
        /*arrs.forEach((item) => {
        //执行新增.
        tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
        rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
      });*/
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
  .must-input {
    color: red;
  }
  .gostButton {
    border-color: transparent;
    color: rgba(0, 0, 0, 0.85);
  }
  :deep(.ant-table-row-expand-icon) {
    display: none;
  }
  :deep(.ant-table-cell) {
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }
  .GroupBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding: 10px;
    margin-bottom: 4px;
    background-color: whitesmoke;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupTitle {
    margin: 10px 0;
    border-radius: 5px;
    background-color: #e3dbd7;
  }
  //第一套样式
  .defaultGroupTitle1 {
    background-color: #f1f1f6;
    position: relative;
    &::before {
      position: absolute;
      top: 30%;
      left: 0;
      width: 3px;
      height: 16px;
      content: '';
      background-color: #5f7af9;
    }
  }
  //第二套样式
  .defaultGroupTitle2 {
    position: relative;
    border-radius: 0;
    border-bottom: 2px solid #fea101;
    background: #2d2d2e;
    color: #e7ac45;
    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 5px;
      width: 25px;
      height: 30px;
      background: linear-gradient(to right, #905e18, #fea101);
      transform: skew(-30deg);
    }
    & span {
      margin-left: 50px;
    }
    .label {
      color: #b8b8b8;
    }
  }
  //第三套样式
  //第三套样式
  .defaultGroupTitle3 {
    background: #fff;
    .ant-btn-default.ant-btn-background-ghost:hover {
      color: #4096ff !important;
    }
    .ant-btn-default.ant-btn-background-ghost:focus {
      color: rgba(0, 0, 0, 0.85) !important;
    }
  }
  //第四套样式
  .defaultGroupTitle4 {
    border-radius: 0;
    border-bottom: 1px solid #e3dbd7;
    background-color: #fff;
  }
  .glyphicon {
    margin-right: 10px;
  }
</style>
