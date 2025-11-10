<template>
  <BaseComponent ref="baseComp">
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
                <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled" ghost class="gostButton label"><CheckOutlined />{{ '保存' }}</Button>
                <template v-for="item in btnList" :key="item">
                  <Button type="default" @click="BtnClick(item)" ghost class="gostButton label">
                    {{ item }}
                  </Button>
                </template>
                <Button v-if="mapDtl.ImpModel === '1'" @click="ExpDtl" ghost class="gostButton label"><UploadOutlined />{{ '导出' }}</Button>
                <Button v-if="isImp && isSave" @click="ImpDtl" ghost class="gostButton label"><DownloadOutlined />{{ '导入' }}</Button>
                <Button @click="fullScreen">
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
              <Button @click="fullScreen">
                <FullscreenOutlined />
              </Button>
            </div>
          </div>
          <ConfigProvider :getPopupContainer="getPopupContainer">
            <div ref="tableRef" :style="groupField.IsZDPC == 1 ? { minHeight: '0', height: '0', overflow: 'hidden' } : ''">
              <Table
                :columns="columns"
                :data-source="tableData"
                bordered
                size="small"
                :rowKey="(record, index) => index"
                :key="tempData"
                :pagination="false"
                :scroll="getScroll"
                :row-class-name="getRowClass"
                @resizeColumn="handleResizeColumn"
              >
                <template #headerCell="{ column }">
                  <template v-if="column.attr !== undefined && column.attr.UIIsInput">
                    <span class="must-input">*</span><span>{{ column.title }}</span>
                  </template>
                </template>
                <template #bodyCell="{ column, record, index }">
                  <template v-if="!!column.attr && (column.attr.UIIsEnable === 0 || column.edit == false)">
                    {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                  </template>
                  <template v-if="!!column.attr && column.edit == true">
                    <InputNumber
                      v-if="column.attr.MyDataType === DataType.AppInt && column.attr.LGType === FieldTypeS.Normal"
                      v-model:value="record[column.key]"
                      :id="column.attr.KeyOfEn"
                      :controls="false"
                      style="width: 100%"
                      :precision="0"
                      stringMode
                      :addon-after="column.attr.suffix"
                      class="frmStyleType"
                    />
                    <InputNumber
                      v-if="column.attr.MyDataType === DataType.AppFloat || column.attr.MyDataType === DataType.AppDouble"
                      v-model:value="record[column.key]"
                      :id="column.attr.KeyOfEn"
                      :placeholder="column.attr.Tip"
                      :controls="false"
                      :precision="column.attr.bit"
                      style="width: 100%"
                      stringMode
                      :addon-after="column.attr.suffix"
                      :disabled="column.attr.UIIsEnable === 0 || isReadonly == true"
                      class="frmStyleType"
                    />
                    <InputNumber
                      v-if="column.attr.MyDataType === DataType.AppMoney"
                      v-model:value="record[column.key]"
                      :id="column.attr.KeyOfEn"
                      :placeholder="column.attr.Tip"
                      :controls="false"
                      :precision="column.attr.bit"
                      style="width: 100%"
                      :formatter="FormatMoney"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :addon-after="column.attr.suffix"
                      stringMode
                      class="frmStyleType"
                    />
                    <!--普通文本-->
                    <Input
                      v-if="column.attr.MyDataType === DataType.AppString"
                      v-model:value="record[column.key]"
                      :placeholder="column.attr.Tip"
                      :allow-clear="column.attr.clearable"
                      :addon-after="column.attr.suffix"
                      class="frmStyleType"
                      @blur="inputBlur(record, index)"
                    />
                  </template>
                  <!--   <template v-if="column.key === 'Oper'">
                                       <Popconfirm v-if="isDelete" :title="'确定要删除该行数据吗?'" :ok-text="'确定'" :cancel-text="'取消'" @confirm="DeleteRow(index, record)">
                       <a href="#"><CloseCircleOutlined :style="{ color: 'red' }" /></a>
                     </Popconfirm>
                  </template>-->
                </template>
                <template v-if="isHaveSummary && tableData.length != 0" #summary>
                  <TableSummaryRow>
                    <TableSummaryCell v-if="parseInt(mapDtl.IsShowIdx) === 1" style="text-align: center">{{ '总结' }}</TableSummaryCell>
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
      :title="popModal.title"
      :width="popModal.width"
      :bodyStyle="{
        padding: '0px 12px !important',
      }"
      :style="popModal.height"
      @ok="PopModalOK"
    >
      <DtlImp
        v-if="popModal.visible === true && popModal.modalType === 'dtlImp'"
        ref="dtlImp"
        :refPKVal="props.refPKVal"
        :cond-sql="popModal.mapExt.Tag1"
        :list-sql="popModal.mapExt.Tag2"
        :field-text="popModal.mapExt.Tag"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
        :mypk="popModal.mapExt.MyPK"
      />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Button, ConfigProvider, Table, message, TableSummaryRow, TableSummaryCell, TypographyText, Modal, InputNumber, Input } from 'ant-design-vue';
  import { CheckOutlined, DownloadOutlined, UploadOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { computed, provide, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { ddlInfo, MapAttrExt } from '/@/WF/CCForm/FrmEnd';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import DtlImp from '/@/WF/CCForm/DtlImp.vue';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { FrmDtlBtnClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnClick';
  import { FrmDtlTextBoxChange } from '/@/DataUser/OverrideFiles/FrmDtlTextBoxChange';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { AtPara } from '/@/bp/da/AtPara';
  import WebUser from '/@/bp/web/WebUser';

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
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
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isShowGF: {
      type: Boolean,
      default: false,
    },
  });
  const sysLang = WebUser.SysLang || 'CH';
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const query = ref(props.params);
  const btnDisabled = ref(false);
  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const dtlData = ref<any[]>([]);
  const tempData = ref(0);

  //从表属性信息
  const mapDtl = ref<Record<string, string>>({});
  const mapAttrs = ref<MapAttr[]>([]);
  const frmData = ref<Record<string, any>>({});
  //报表值的属性
  const valAttr = ref<MapAttr>({});
  //维度1字段
  const d1Attr = ref<MapAttr>({});
  //维度
  const d1 = ref('');
  const d2 = ref('');
  const ddl2s = ref<Record<string, any>[]>([]);
  const ddl3s = ref<Record<string, any>[]>([]);

  const rowMapAttrs = ref<[MapAttr[]]>([[]]);
  const orginMapAttrs = ref<MapAttrExt[]>([]);
  //从表操作
  const isInsert = ref(true);
  const isDelete = ref(true);
  const isSave = ref(true);
  //从表导入问题
  const isImp = ref(false);
  const impExt = ref<Record<string, string>>({});
  const cacheSelectedData = ref<string[]>([]);
  const tableRef = shallowRef<HTMLElement>();
  const contentRef = shallowRef<HTMLElement>();
  //从表是否有合计行，列
  const isHaveSummary = ref(false);
  const summaryMapExts = ref<any[]>([]);

  //从表增加的头部按钮
  const btnList = ref<string[]>([]);

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
    rowData: {},
    mapAttrs: [],
  });

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
  const { GetActionDLLData } = mapExtParse();
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

  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      //参数
      query.value = props.params;
      query.value.EnsName = props.dtlInfo['No'];
      query.value.FrmID = props.dtlInfo.FK_MapData;
      query.value.RefPKVal = props.params.WorkID;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('Dtl_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      mapDtl.value = data['Sys_MapDtl'][0] || {};
      orginMapAttrs.value = data['Sys_MapAttr'];
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

      isSave.value =
        (parseInt(mapDtl.value.IsDelete) === 1 || parseInt(mapDtl.value.IsInsert) === 1 || parseInt(mapDtl.value.IsUpdate) == 1) &&
        parseInt(mapDtl.value.IsReadonly) == 0 &&
        props.isReadonly == false;

      mapAttrs.value = orginMapAttrs.value.filter((attr) => attr.UIVisible == 1);

      //维度值
      d1.value = GetPara(mapDtl.value.AtPara, 'D1') || '';
      d2.value = GetPara(mapDtl.value.AtPara, 'D2') || '';

      //维度1字段
      d1Attr.value = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === d1.value)[0];
      const isString = d1Attr.value.MyDataType === DataType.AppString && d1Attr.value.UIContralType === UIContralType.TB && d1Attr.value.LGType === FieldTypeS.Normal;
      isInsert.value = mapDtl.value.IsInsert === '1' && isString === true && props.isReadonly == false;
      isDelete.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1') && isString === true && props.isReadonly == false;
      //初始化从表表头信息
      await InitColumn(data);
      //增加操作按钮
      // if (isInsert.value || isDelete.value || isSave.value || mapDtl.value.IsEnableLink || mapDtl.value.IsEnableLink2) {
      //   columns.value.push({
      //     title: '操作',
      //     key: 'Oper',
      //     width: 80,
      //     align: 'center',
      //     fixed: 'right',
      //   });
      // }
      dtlData.value = data['DBDtl'];
      //根据维度1字段分组
      const map = {};
      dtlData.value.forEach((obj) => {
        const key = obj[d1.value];
        if (map[key]) {
          map[key].push(obj);
        } else {
          map[key] = [obj];
        }
      });
      tableData.value = dtlData.value;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 初始化从表表头信息
   * @constructor
   */
  const InitColumn = async (frmData) => {
    const exts = frmData['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'ActiveDDL' && mapExt?.DoWay != 0 && mapExt.AttrOfOper === d1.value);
    const ddls = GetDDLOption(d1Attr.value, frmData);
    const map = {};
    if (exts.length > 0) {
      const ext = exts[0];
      for (const ddl of ddls) {
        const data = await GetActionDLLData(ddl.value, ext, 'Doc', null, null, 'Dtl');
        map[ddl.value] = data.length;
      }
    }
    let count = 0;
    let d1Vals: number[] = [];
    for (const attr of mapAttrs.value) {
      if (attr.KeyOfEn === d1.value) {
        //需要合并
        columns.value.push({
          title: '',
          key: d1.value,
          edit: false,
          width: d1Attr.value.UIWidth || 100,
          align: 'center',
          attr: d1Attr.value,
          colSpan: 1,
          customCell: (record, index, column) => {
            if (index == 0) {
              count = 0;
              d1Vals = [];
            }
            if (column.key === d1.value && exts.length != 0) {
              if (d1Vals.includes(record[d1.value]) == false) {
                if (index != 0) count += map[d1Vals[d1Vals.length - 1]];
                d1Vals.push(record[d1.value]);
              }
              if (index == 0 || index % count == 0) return { rowSpan: map[record[d1.value]] };
              return { rowSpan: 0 };
            }
            return { rowSpan: 1 };
          },
        });
      } else {
        const isEdit = attr.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0;
        columns.value.push({
          title: attr.Name,
          key: attr.KeyOfEn,
          edit: isEdit,
          width: (attr.UIWidth || 100) + 28,
          align: attr.KeyOfEn == d2.value ? 'left' : 'center',
          attr: attr,
          className: isEdit == false || (attr.MyDataType == 1 && attr.TextModel == 1) ? 'my-handle' : '',
        });
      }
    }
  };
  function handleResizeColumn(w, col) {
    col.width = w;
  }

  /**
   * 金额格式化
   * @param value
   * @constructor
   */
  const FormatMoney = (value) => {
    const valStr = value.toString();
    const newValue = !valStr.includes('.') ? valStr : valStr.substring(0, valStr.indexOf('.'));
    let precisionVal = !valStr.includes('.') ? '0' : valStr.substring(valStr.indexOf('.') + 1);
    if (precisionVal.length < valAttr.value['bit']) {
      for (let i = precisionVal.length; i < valAttr.value['bit']; i++) precisionVal += '0';
    }

    return newValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + precisionVal;
  };

  /**
   * 保存
   * @constructor
   */
  const SaveAll = async (isSaveOnly) => {
    try {
      if (isSave.value === false) return true;
      btnDisabled.value = true;
      if (tableData.value.length == 0) return true;
      //保存从表的校验
      if (isSaveOnly === false) {
        const newMapAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIIsInput === 1);
        let msg = '';
        tableData.value.forEach((rowData, idx) => {
          let str = '';
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
          return false;
        }
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      handler.AddPara('RefPKVal', query.value.WorkID || query.value.RefPKVal);
      handler.AddPara('EnsName', mapDtl.value.No);
      handler.AddPara('Json', encodeURIComponent(JSON.stringify(dtlData.value)));
      const data = await handler.DoMethodReturnString('Dtl_Save');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return false;
      }
      if (isSaveOnly == true) {
        message.info(mapDtl.value.Name + '保存成功');
        if (isInsert.value) await InitPage();
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

  /**
   * 输入文本不能重复
   * @param record
   * @param index
   */
  const inputBlur = (record, index) => {
    //判断当前的值是否重复
    let isHave = false;
    tableData.value.forEach((item, idx) => {
      if (!!record[d1.value] && item[d1.value] === record[d1.value] && (idx < index || idx >= index + ddl2s.value.length)) {
        isHave = true;
      }
    });
    if (isHave === false) return;
    message.info('输入一维字段的值已经存在,请重新输入值');
    tableData.value[index][d1.value] = '';
    tempData.value--;
  };
  const ChangeDtlData = (args) => {
    //@Sum=求和@Avg=求平均@Max=求最大@Min=求最小
    let val = 0;
    tableData.value.forEach((item) => {
      switch (args.computed) {
        case 'Sum': // 求和
        case 'Avg': //求平均
          val = parseFloat(val) + parseFloat(parseFloat(item[args.dtlKey]).toFixed(2));
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
    // eslint-disable-next-line vue/no-mutating-props
    props.mainData[args.mainKey] = val;
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
  const ChangeParentAttr = (keyOfEn, type, data, rowIdx, rowData, _isFirstLoad = false) => {
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
            if (result.length == 0 && data.length != 0) {
              option = data[0];
            }
            if (result.length != 0) option = result[0];

            //判断当前值是否在当前的下拉列表中
            rowData[keyOfEn] = '';
            rowData[keyOfEn + 'T'] = '';
            rowData[keyOfEn + 'Text'] = '';
            if (option != null) {
              rowData[keyOfEn] = option['value'];
              rowData[keyOfEn + 'T'] = option['text'];
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
      default:
        break;
    }
  };
  provide('ChangeParentAttr', ChangeParentAttr);

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
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, rowData, null);
            if (fullData == null) continue;
            ChangeParentAttr('', 'FullData', fullData, rowIdx, rowData);
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, rowData, 'Dtl');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, rowIdx, rowData);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, rowData, null);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null, rowIdx, rowData);
          break;
        default:
          break;
      }
    }
  };

  InitPage();
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
    baseComp.value?.handleGPNCallback(result, btnName);
    setTimeout(() => {
      InitPage();
    }, 100);
  };

  defineExpose({ SaveAll, InitPage });
  /**
   * 导出从表信息
   * @constructor
   */
  const ExpDtl = () => {};
  /**
   * 导入从表信息
   * @constructor
   */
  const ImpDtl = () => {
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
  };

  const dtlImp = shallowRef<InstanceType<typeof DtlImp>>();
  const PopModalOK = async () => {
    if (popModal.modalType === 'dtlImp') {
      const arrs = dtlImp.value.checkInfoList;
      cacheSelectedData.value = dtlImp.value.checkedList;
      const key = impExt.value.Tag4;
      if (!key) {
        tableData.value = tableData.value.concat(arrs);
      } else {
        tableData.value.forEach((item) => {
          for (const arr of arrs) {
            if (item[key] === arr[key]) break;
            arr.OID = 0;
            tableData.value.push(arr);
          }
        });
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
  const GetDDLOption = (mapAttr, frmData) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: '',
          label: '绑定的外键枚举值丢失',
        },
      ];
    const options: Array<ddlInfo> = [];
    let data = frmData[mapAttr.KeyOfEn];
    if (data == undefined) data = frmData[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = frmData.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if ((mapAttr.UIIsInput === 0 || mapAttr.DefVal === '-1') && mapAttr.UIContralType == UIContralType.DDL) {
        options.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.StrKey || item.IntKey,
          label: item.Lab,
        });
      });
      return options;
    }

    if (data == undefined)
      return [
        {
          value: '',
          label: '请选择',
        },
      ];

    return data.map((item) => {
      return {
        value: item.No,
        label: item.Name,
      };
    });
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
  .defaultGroupTitle3 {
    background: #fff;
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
