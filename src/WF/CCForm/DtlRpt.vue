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
                <Button v-if="isInsert" @click="AddRow" ghost class="gostButton label"><PlusOutlined />{{ '新增' }}</Button>
                <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled" ghost class="gostButton label"><CheckOutlined />{{ '保存' }}</Button>
                <Button v-if="isSave" @click="Setting()" :disabled="btnDisabled" ghost class="gostButton label"><SettingOutlined />{{ '设置' }}</Button>
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
              <Button v-if="isInsert" @click="AddRow"><PlusOutlined />{{ '新增' }}</Button>
              <Button v-if="isSave" @click="SaveAll(true)" :disabled="btnDisabled"><CheckOutlined />{{ '保存' }}</Button>
              <Button v-if="isSave" @click="Setting()" :disabled="btnDisabled"><SettingOutlined />{{ '设置' }}</Button>
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
                  <template v-if="column.key === 'Oper'">
                    <Popconfirm v-if="isDelete" :title="'确定要删除该行数据吗?'" :ok-text="'确定'" :cancel-text="'取消'" @confirm="DeleteRow(index, record)">
                      <a href="#"><CloseCircleOutlined :style="{ color: 'red' }" /></a>
                    </Popconfirm>
                  </template>
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
      <DtlRptSetting
        v-if="popModal.visible === true && popModal.modalType === 'dtlRptSetting'"
        ref="dtlRptSetting"
        :frmData="frmData"
        :listModel="parseInt(mapDtl.ListShowModel)"
        :d1="d1"
        :d2="d2"
        :d3="d3"
        :settingVal="selectD"
      />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Button, Popconfirm, ConfigProvider, Table, message, TableSummaryRow, TableSummaryCell, TypographyText, Modal, InputNumber, Input } from 'ant-design-vue';
  import {
    CheckOutlined,
    SettingOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    UploadOutlined,
    FullscreenOutlined,
  } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { computed, provide, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { ddlInfo, MapAttrExt } from '/@/WF/CCForm/FrmEnd';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import DtlImp from '/@/WF/CCForm/DtlImp.vue';
  import DtlRptSetting from '/@/WF/CCForm/DtlRptSetting.vue';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { FrmDtlBtnClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnClick';
  import { FrmDtlTextBoxChange } from '/@/DataUser/OverrideFiles/FrmDtlTextBoxChange';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { AtPara } from '/@/bp/da/AtPara';
  import { FrmDtlBtnRowClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnRowClick';
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
  const d3 = ref('');
  const numberField = ref('');
  const selectD = ref<Record<string, string[] | number[]>>({});
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
      let refPKVal = props.params.WorkID;
      if (refPKVal == null || !refPKVal) refPKVal = props.params.No;

      query.value.RefPKVal = refPKVal;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('DtlRpt_Init');
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
      d3.value = GetPara(mapDtl.value.AtPara, 'D3') || '';
      numberField.value = GetPara(mapDtl.value.AtPara, 'NumberField') || '';
      if (!numberField.value) {
        message.error('请配置明细表[' + mapDtl.value.Name + ']的数值字段');
        return;
      }
      //维度1字段
      d1Attr.value = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === d1.value)[0];
      const isString = d1Attr.value.MyDataType === DataType.AppString && d1Attr.value.UIContralType === UIContralType.TB && d1Attr.value.LGType === FieldTypeS.Normal;
      isInsert.value = mapDtl.value.IsInsert === '1' && isString === true && props.isReadonly == false;
      isDelete.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1') && isString === true && props.isReadonly == false;

      //维度Value
      valAttr.value = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === numberField.value)[0];
      valAttr.value['bit'] = parseInt(GetPara(valAttr.value.AtPara, 'NumScale') || 2);
      const val = props.mainData[mapDtl.value.No] || '';
      if (val === '') {
        selectD.value[d1.value] = [];
        selectD.value[d2.value] = [];
        selectD.value[d3.value] = [];
      } else {
        //存储方式D1:field1,field2;D2:field3,field4
        const arr = val.split(';');
        arr.forEach((item) => {
          const strs = item.split(':');
          if (!!strs[0]) selectD.value[strs[0]] = strs[1].split(',');
        });
      }

      //初始化从表表头信息
      InitColumn(data);
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
      tableData.value = [];
      if (parseInt(mapDtl.value.ListShowModel) === 3) {
        const selectVal = isString === true ? [] : selectD.value[d1.value];
        for (const key in map) {
          const arr = map[key];
          const item: Record<string, any> = {};
          item[d1.value] = key;
          if (selectVal.length != 0 && selectVal.includes(key.toString()) == false) continue;
          item['IsEnable'] = 1;
          item[d1.value + 'T'] = arr[0][d1.value + 'T'] || arr[0][d1.value + 'Text'];
          columns.value.forEach((column) => {
            if (column.key != d1.value && column.key != 'Oper') {
              const obj = arr.filter((obj) => obj[d2.value] == column.keyVal)[0];
              item[d2.value + column.keyVal] = obj[valAttr.value.KeyOfEn];
              item[d2.value] = obj[d2.value];
              item[d2.value + 'T'] = obj[d2.value + 'T'];
            }
          });
          tableData.value.push(item);
        }
      }
      if (parseInt(mapDtl.value.ListShowModel) === 4) {
        const map = {};
        dtlData.value.forEach((obj) => {
          const key = obj[d1.value] + '_' + obj[d2.value];
          if (map[key]) {
            map[key].push(obj);
          } else {
            map[key] = [obj];
          }
        });
        const selectVal1 = isString === true ? [] : selectD.value[d1.value];
        const selectVal2 = selectD.value[d2.value];
        for (const key in map) {
          const arr = map[key];
          const item: Record<string, any> = {};
          if (selectVal1.length != 0 && selectVal1.includes(arr[0][d1.value].toString()) == false) continue;
          if (selectVal2.length != 0 && selectVal2.includes(arr[0][d2.value].toString()) == false) continue;
          item['IsEnable'] = 1;
          item[d1.value] = arr[0][d1.value];
          item[d1.value + 'T'] = arr[0][d1.value + 'T'] || arr[0][d1.value + 'Text'];
          item[d2.value] = arr[0][d2.value];
          item[d2.value + 'T'] = arr[0][d2.value + 'T'] || arr[0][d2.value + 'Text'];
          columns.value.forEach((column) => {
            if (!!column.key && column.key != d1.value && column.key != d2.value && column.key != 'Oper') {
              const obj = arr.filter((obj) => obj[d3.value] == column.keyVal)[0];
              item[d3.value + column.keyVal] = !!obj ? obj[valAttr.value.KeyOfEn] : 0;
              item[d3.value] = !!obj ? obj[d3.value] : '';
              item[d3.value + 'T'] = !!obj ? obj[d3.value + 'T'] || obj[d3.value + 'Text'] : '';
            }
          });
          tableData.value.push(item);
        }
      }
      if (parseInt(mapDtl.value.ListShowModel) === 5) {
        const selectVal = isString === true ? [] : selectD.value[d1.value];
        for (const key in map) {
          const arr = map[key];
          const item: Record<string, any> = {};
          item[d1.value] = key;
          if (selectVal.length != 0 && selectVal.includes(key.toString()) == false) continue;
          item['IsEnable'] = 1;
          item[d1.value + 'T'] = arr[0][d1.value + 'T'] || arr[0][d1.value + 'Text'];
          columns.value.forEach((column) => {
            if (column.key != d1.value && column.key != 'Oper') {
              column.children.forEach((child) => {
                const obj = arr.filter((obj) => obj[d2.value] == child.D2Val && obj[d3.value] == child.D3Val)[0];
                item[d3.value + '_' + child.D3Val + '_' + child.D2Val] = obj[valAttr.value.KeyOfEn];
                item[d2.value] = obj[d2.value];
                item[d2.value + 'T'] = obj[d2.value + 'T'] || obj[d2.value + 'Text'];
                item[d3.value] = obj[d3.value];
                item[d3.value + 'T'] = obj[d3.value + 'T'] || obj[d3.value + 'Text'];
              });
            }
          });
          tableData.value.push(item);
        }
      }
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
  const InitColumn = (frmData) => {
    const listShowModel = parseInt(mapDtl.value.ListShowModel);
    if (listShowModel === 3) {
      if (!d2.value) {
        message.warn('请配置维度字段2的值');
        return;
      }
    }

    const D2Attr = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === d2.value)[0];
    ddl2s.value = GetDDLOption(D2Attr, frmData);
    if (parseInt(mapDtl.value.ListShowModel) === 3 || parseInt(mapDtl.value.ListShowModel) === 5)
      columns.value.push({
        title: '',
        key: d1.value,
        edit: isInsert.value == true ? true : false,
        width: d1Attr.value.UIWidth || 100,
        align: 'center',
        attr: d1Attr.value,
      });

    if (parseInt(mapDtl.value.ListShowModel) === 3) {
      const d2Select: string[] | number[] = selectD.value[d2.value] || [];
      ddl2s.value.forEach((item) => {
        if (d2Select.length == 0 || d2Select.includes(item.value.toString())) {
          columns.value.push({
            title: item.label,
            key: d2.value + item.value,
            keyVal: item.value,
            align: 'center', //居中
            width: valAttr.value.UIWidth || 100,
            edit: valAttr.value.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0,
            attr: valAttr.value,
          });
        }
      });
      if (isInsert.value || isDelete.value) {
        columns.value.push({
          title: '操作',
          key: 'Oper',
          width: 80,
          align: 'center',
          fixed: 'right',
        });
      }
      return;
    }
    const D3Attr = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn === d3.value)[0];
    ddl3s.value = GetDDLOption(D3Attr, frmData);
    if (parseInt(mapDtl.value.ListShowModel) === 4) {
      let d2Count = ddl2s.value.length;
      const selectVal = selectD.value[d2.value];
      if (selectVal.length != 0) {
        d2Count = ddl2s.value.filter((item) => selectVal.includes(item.value.toString())).length;
      }
      columns.value.push({
        title: '',
        key: d1.value,
        edit: isInsert.value == true ? true : false,
        width: d1Attr.value.UIWidth || 100,
        align: 'center',
        attr: d1Attr.value,
        colSpan: 2,
        customCell: (_, index) => {
          if (index % d2Count == 0) return { rowSpan: d2Count };
          else return { rowSpan: 0 };
        },
      });
      columns.value.push({
        title: '',
        key: d2.value,
        colSpan: 0,
        edit: false,
        width: D2Attr.UIWidth || 100,
        align: 'center',
        attr: D2Attr,
      });
      const d3Select: string[] | number[] = selectD.value[d3.value] || [];
      ddl3s.value.forEach((item) => {
        if (d3Select.length == 0 || d3Select.includes(item.value.toString())) {
          columns.value.push({
            title: item.label,
            key: d3.value + item.value,
            keyVal: item.value,
            align: 'center', //居中
            width: valAttr.value.UIWidth || 100,
            edit: valAttr.value.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0,
            attr: valAttr.value,
          });
        }
      });
      if (isInsert.value || isDelete.value) {
        columns.value.push({
          title: '操作',
          key: 'Oper',
          width: 80,
          align: 'center',
          fixed: 'right',
          customCell: (_, index) => {
            if (index % d2Count == 0) return { rowSpan: d2Count };
            else return { rowSpan: 0 };
          },
        });
      }
    }
    if (parseInt(mapDtl.value.ListShowModel) === 5) {
      const d2Select: string[] | number[] = selectD.value[d2.value] || [];
      const d3Select: string[] | number[] = selectD.value[d3.value] || [];
      ddl2s.value.forEach((item) => {
        if (d2Select.length == 0 || d2Select.includes(item.value.toString())) {
          //获取子级
          const childColumns: Record<string, any> = [];
          ddl3s.value.forEach((obj) => {
            if (d3Select.length == 0 || d3Select.includes(obj.value.toString())) {
              childColumns.push({
                title: obj.label,
                key: d3.value + '_' + obj.value + '_' + item.value,
                D2Val: item.value,
                D3Val: obj.value,
                align: 'center', //居中
                width: valAttr.value.UIWidth || 100,
                edit: valAttr.value.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0,
                attr: valAttr.value,
              });
            }
          });
          columns.value.push({
            title: item.label,
            children: childColumns,
          });
        }
      });
      if (isInsert.value || isDelete.value) {
        columns.value.push({
          title: '操作',
          key: 'Oper',
          width: 80,
          align: 'center',
          fixed: 'right',
        });
      }
      return;
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
   * 新增
   * @constructor
   */
  const AddRow = async () => {
    //执行新增.
    const row: Record<string, any> = {};
    //二维
    const d2Select: string[] | number[] = selectD.value[d2.value] || [];
    if (parseInt(mapDtl.value.ListShowModel) === 3) {
      row['OID'] = 0;
      row['IsEnable'] = 1;
      row[d1.value] = '';
      ddl2s.value.forEach((item) => {
        if (d2Select.length == 0 || d2Select.includes(item.value.toString())) {
          row[d2.value + item.value] = 0;
          row[d2.value] = item.value;
          row[d2.value + 'T'] = item.label;
        }
      });
      tableData.value.push(row);
    }
    //三维左
    const d3Select: string[] | number[] = selectD.value[d3.value] || [];
    if (parseInt(mapDtl.value.ListShowModel) === 4) {
      ddl2s.value.forEach((obj) => {
        if (d2Select.length == 0 || d2Select.includes(obj.value.toString())) {
          const row: Record<string, any> = {};
          row['OID'] = 0;
          row['IsEnable'] = 1;
          row[d1.value] = '';
          row[d2.value] = obj.value;
          row[d2.value + 'T'] = obj.label;
          ddl3s.value.forEach((item) => {
            if (d3Select.length == 0 || d3Select.includes(item.value.toString())) {
              row[d3.value + item.value] = 0;
              row[d3.value] = item.value;
              row[d3.value + 'T'] = item.label;
            }
          });
          tableData.value.push(row);
        }
      });
    }
    //三维上
    if (parseInt(mapDtl.value.ListShowModel) === 5) {
      const row: Record<string, any> = {};
      row['OID'] = 0;
      row['IsEnable'] = 1;
      row[d1.value] = '';
      ddl2s.value.forEach((d2) => {
        if (d2Select.length == 0 || d2Select.includes(d2.value.toString())) {
          row[d2.value] = d2.value;
          row[d2.value + 'T'] = d2.label;
          ddl3s.value.forEach((item) => {
            if (d3Select.length == 0 || d3Select.includes(item.value.toString())) {
              row[d3.value + '_' + item.value + '_' + d2.value] = 0;
              row[d3.value] = item.value;
              row[d3.value + 'T'] = item.label;
            }
          });
        }
      });
      tableData.value.push(row);
    }

    tempData.value++;
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
    let curIdx = index;
    //二维表
    if (parseInt(mapDtl.value.ListShowModel) === 3 && !!record) {
      for (const item of ddl2s.value) {
        const result = dtlData.value.filter((obj) => obj[d2.value] === item[d2.value] && obj[d1.value] === record[d1.value]);
        if (result.length != 0) {
          //删除行
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          handler.AddPara('FK_MapDtl', mapDtl.value.No);
          handler.AddPara('RefOID', result[0]['OID']);
          handler.AddPara('RefPKVal', props.params.WorkID);
          const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
          if (typeof data === 'string' && data.includes('err@')) {
            message.error(data.replace('err@', ''));
            return;
          }
        }
      }
      tableData.value.splice(index, 1);
      rowMapAttrs.value.splice(index, 1);
      tempData.value--;
    }

    //三维报表左
    if (parseInt(mapDtl.value.ListShowModel) === 4) {
      //删除多行数据
      for (const item of ddl2s.value) {
        for (const ddl3 of ddl3s.value) {
          if (!record[d1.value]) record[d1.value] = tableData.value[index + ddl2s.value.length - 1][d1.value];
          const result = dtlData.value.filter(
            (data) => data[d1.value] === record[d1.value] && data[d2.value].toString() === item.value && data[d3.value].toString() === ddl3.value,
          );
          if (result.length != 0) {
            //删除行
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
            handler.AddPara('FK_MapDtl', mapDtl.value.No);
            handler.AddPara('RefOID', result[0]['OID']);
            handler.AddPara('RefPKVal', props.params.WorkID);
            const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
            if (typeof data === 'string' && data.includes('err@')) {
              message.error(data.replace('err@', ''));
              return;
            }
          }
        }
      }
      tableData.value.splice(curIdx, selectD.value[d2.value].length === 0 ? ddl2s.value.length : selectD.value[d2.value].length);
      rowMapAttrs.value.splice(curIdx, selectD.value[d2.value].length === 0 ? ddl2s.value.length : selectD.value[d2.value].length);
      tempData.value--;
    }
    //三维报表上
    if (parseInt(mapDtl.value.ListShowModel) === 5) {
      //删除数据
      for (const item of ddl2s.value) {
        for (const ddl3 of ddl3s.value) {
          const result = dtlData.value.filter(
            (data) => data[d1.value] === record[d1.value] && data[d2.value].toString() === item.value && data[d3.value].toString() === ddl3.value,
          );
          if (result.length != 0) {
            //删除行
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
            handler.AddPara('FK_MapDtl', mapDtl.value.No);
            handler.AddPara('RefOID', result[0]['OID']);
            handler.AddPara('RefPKVal', props.params.WorkID);
            const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
            if (typeof data === 'string' && data.includes('err@')) {
              message.error(data.replace('err@', ''));
              return;
            }
          }
        }
      }
      tableData.value.splice(index, 1);
      rowMapAttrs.value.splice(index, 1);
      tempData.value--;
    }
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
      if (isInsert.value === true) {
        const mydtlData: Record<string, any>[] = [];
        const d2Select: string[] | number[] = selectD.value[d2.value] || [];
        let oids = '';
        if (parseInt(mapDtl.value.ListShowModel) === 3) {
          tableData.value.forEach((item) => {
            ddl2s.value.forEach((obj2) => {
              const result = dtlData.value.filter((data) => data[d1.value] === item[d1.value] && data[d2.value].toString() === obj2.value);
              if (result.length === 1) oids += result[0].OID + ',';
              const row: Record<string, any> = result.length === 1 ? result[0] : {};
              row[d2.value] = obj2.value;
              row[d2.value + 'T'] = obj2.label;
              row[d1.value] = item[d1.value];
              if (d2Select.length === 0 || d2Select.includes(obj2.value.toString())) {
                row['IsEnable'] = 1;
                row[valAttr.value.KeyOfEn] = item[d2.value + obj2.value];
              } else {
                row['IsEnable'] = 0;
                row[valAttr.value.KeyOfEn] = 0;
              }
              mydtlData.push(row);
            });
          });
        }
        const d3Select: string[] | number[] = selectD.value[d3.value] || [];
        if (parseInt(mapDtl.value.ListShowModel) === 4) {
          let idx = 0;
          tableData.value.forEach((item) => {
            if (!item[d1.value]) {
              let ddlIdx = -1;
              ddl2s.value.forEach((ddl2, curIdx) => {
                if (ddl2.value === item[d2.value].toString()) ddlIdx = curIdx;
              });
              item[d1.value] = tableData.value[idx - ddlIdx][d1.value];
            }
            ddl3s.value.forEach((obj3) => {
              const result = dtlData.value.filter((data) => data[d1.value] === item[d1.value] && data[d2.value] === item[d2.value] && data[d3.value].toString() === obj3.value);
              const row: Record<string, any> = result.length === 1 ? result[0] : {};
              if (result.length === 1) oids += result[0].OID + ',';
              row[d2.value] = item[d2.value];
              row[d2.value + 'T'] = item[d2.value + 'T'];
              row[d3.value] = obj3.value;
              row[d3.value + 'T'] = obj3.label;
              row[d1.value] = item[d1.value];
              if (d2Select.length === 0 || d2Select.includes(item[d2.value].toString())) {
                if (d3Select.length === 0 || d3Select.includes(obj3.value.toString())) {
                  row['IsEnable'] = 1;
                  row[valAttr.value.KeyOfEn] = item[d3.value + obj3.value];
                } else {
                  row['IsEnable'] = 0;
                  row[valAttr.value.KeyOfEn] = 0;
                }
              } else {
                row['IsEnable'] = 0;
                row[valAttr.value.KeyOfEn] = 0;
              }
              mydtlData.push(row);
            });
            idx++;
          });
        }
        if (parseInt(mapDtl.value.ListShowModel) === 5) {
          tableData.value.forEach((item) => {
            ddl2s.value.forEach((obj2) => {
              ddl3s.value.forEach((obj3) => {
                const result = dtlData.value.filter(
                  (data) => data[d1.value] === item[d1.value] && data[d2.value].toString() === obj2.value && data[d3.value].toString() === obj3.value,
                );
                if (result.length === 1) oids += result[0].OID + ',';
                const row: Record<string, any> = result.length === 1 ? result[0] : {};
                row[d2.value] = obj2.value;
                row[d2.value + 'T'] = obj2.label;
                row[d3.value] = obj3.value;
                row[d3.value + 'T'] = obj3.label;
                row[d1.value] = item[d1.value];
                if (d2Select.length === 0 || d2Select.includes(obj2.value.toString())) {
                  if (d3Select.length === 0 || d3Select.includes(obj3.value.toString())) {
                    row['IsEnable'] = 1;
                    row[valAttr.value.KeyOfEn] = item[d3.value + '_' + obj3.value + '_' + obj2.value];
                  } else {
                    row['IsEnable'] = 0;
                    row[valAttr.value.KeyOfEn] = 0;
                  }
                } else {
                  row['IsEnable'] = 0;
                  row[valAttr.value.KeyOfEn] = 0;
                }
                mydtlData.push(row);
              });
            });
          });
        }
        dtlData.value.forEach((item) => {
          if (oids.includes(item.OID + ',') === false) {
            item['IsEnable'] = 0;
            mydtlData.push(item);
          }
        });
        dtlData.value = mydtlData;
      } else {
        if (parseInt(mapDtl.value.ListShowModel) === 3) {
          dtlData.value.forEach((item) => {
            const obj = tableData.value.filter((obj) => obj[d1.value] === item[d1.value]);
            if (obj.length == 0) {
              item[valAttr.value.KeyOfEn] = 0;
              item['IsEnable'] = 0;
            } else {
              if (typeof obj[0][d2.value + item[d2.value]] === 'undefined') {
                item[valAttr.value.KeyOfEn] = 0;
                item['IsEnable'] = 0;
              } else {
                item[valAttr.value.KeyOfEn] = obj[0][d2.value + item[d2.value]];
                item['IsEnable'] = 1;
              }
            }
          });
        }
        if (parseInt(mapDtl.value.ListShowModel) === 4) {
          dtlData.value.forEach((item) => {
            const obj = tableData.value.filter((obj) => obj[d1.value] === item[d1.value] && obj[d2.value] === item[d2.value]);
            if (obj.length == 0) {
              item[valAttr.value.KeyOfEn] = 0;
              item['IsEnable'] = 0;
            } else {
              if (typeof obj[0][d3.value + item[d3.value]] === 'undefined') {
                item[valAttr.value.KeyOfEn] = 0;
                item['IsEnable'] = 0;
              } else {
                item[valAttr.value.KeyOfEn] = obj[0][d3.value + item[d3.value]];
                item['IsEnable'] = 1;
              }
            }
          });
        }

        if (parseInt(mapDtl.value.ListShowModel) === 5) {
          dtlData.value.forEach((item) => {
            const obj = tableData.value.filter((obj) => obj[d1.value] === item[d1.value]);
            if (obj.length == 0) {
              item[valAttr.value.KeyOfEn] = 0;
              item['IsEnable'] = 0;
            } else {
              if (typeof obj[0][d3.value + '_' + item[d3.value] + '_' + item[d2.value]] === 'undefined') {
                item[valAttr.value.KeyOfEn] = 0;
                item['IsEnable'] = 0;
              } else {
                item[valAttr.value.KeyOfEn] = obj[0][d3.value + '_' + item[d3.value] + '_' + item[d2.value]];
                item['IsEnable'] = 1;
              }
            }
          });
        }
      }

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
   * 设置从表维度显示的字段
   * @constructor
   */
  const Setting = async () => {
    await SaveAll(false);
    popModal.modalType = 'dtlRptSetting';
    popModal.visible = true;
    popModal.title = '二维/三维显示设置';
    popModal.width = window.innerWidth * 0.8;
    popModal.width = window.innerWidth * 0.8;
    popModal.height = {
      height: impExt.value.H || window.innerHeight * 0.8 + 'px',
    };
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
  const ChangeParentAttr = (keyOfEn, type, data, rowIdx, rowData, isFirstLoad = false) => {
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
  const dtlRptSetting = shallowRef<InstanceType<typeof DtlRptSetting>>();
  const emit = defineEmits(['ChangeMainData']);
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
    if (popModal.modalType === 'dtlRptSetting') {
      const selectVal = dtlRptSetting.value.handlerOK();
      const d1Select = selectVal[0];
      const d2Select = selectVal[1];
      const d3Select = selectVal[2];
      selectD.value[d1.value] = d1Select;
      selectD.value[d2.value] = d2Select;
      selectD.value[d3.value] = d3Select;
      const atPara = new AtPara(props.mainData.AtPara);
      atPara.SetVal(mapDtl.value.No, d1.value + ':' + d1Select.join(',') + ';' + d2.value + ':' + d2Select.join(',') + ';' + d3.value + ':' + d3Select.join(',') + ';');
      emit('ChangeMainData', atPara, mapDtl.value.No);
      tempData.value--;
      popModal.visible = false;
      InitPage();
      return;
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
