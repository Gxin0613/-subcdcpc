<template>
  <div style="overflow-y: hidden">
    <NavBar v-if="isSinglePages" :title="mapDtl.Name" :fixed="true" left-arrow @click-left="onClickLeft">
      <template v-if="mapDtl.ListShowModel != 2" #right>
        <span v-if="isImp && isSave" style="color: white" size="18" @click="ImpDtl">{{ '导入' }}</span>
        <span style="color: white; margin-left: 15px" size="18" @click="onClickLeft">{{ rightText }}</span>
      </template>
    </NavBar>
    <div v-if="mapDtl.ListShowModel == 2">
      <iframe :src="GetIFrameSrc(mapDtl)" style="width: 100%; height: calc(var(--viewport-height))"></iframe>
    </div>
    <div v-else :style="contentStyle">
      <!--显示数据-->
      <div v-if="isHaveData === false && isInsert === false">
        <Empty :description="'暂无数据'" style="margin-top: 150px" />
      </div>
      <div v-else>
        <div v-for="(item, index) in tableData" :key="tempData">
          <div class="van-doc-card">
            <template v-if="isDelete">
              <h2 style="display: inline-block">#{{ index + 1 }}</h2>
              <div style="display: inline-block; margin-left: calc(100% - 120px)">
                <a v-if="item.OID && item.OID !== 0" @click="DeleteRow(index, item)"><i class="icon-close"></i><Divider vertical :hairline="false" /></a>
                <!--                <a v-if="item.OID && item.OID !== 0 && parseInt(mapDtl.EditModel) !== 0" @click="EditOrViewRow(index)">{{'编辑'}}<Divider vertical :hairline="false" /></a>-->
                <a v-else @click="RemoveRow(index)"><i class="icon-close"></i><Divider vertical :hairline="false" /></a>
              </div>
            </template>
            <h2 v-else>#{{ index + 1 }}</h2>
            <MapAttrForm
              :refPKVal="item.OID"
              :map-attrs="rowMapAttrs[index]"
              :mainData="item"
              :data="mainData"
              :frmData="frmData"
              checkField=""
              :fwcVer="0"
              :params="query"
              :rowIdx="index"
              :is-readonly="isReadonly"
              :isPreview="props.isPreview"
            />
          </div>
        </div>
        <template v-if="isHaveSummary && tableData.length != 0">
          <div class="van-doc-card">
            <h2 v-if="parseInt(mapDtl.IsShowIdx) === 1">{{ '合计' }}</h2>
            <span v-for="item in mapAttrs" :key="item.MyPK" style="text-align: center">
              <template v-if="!!totals[item.KeyOfEn]">
                <Field v-model="totals[item.KeyOfEn]" :label="item.Name" />
              </template>
            </span>
          </div>
        </template>
        <div v-if="isInsert" @click="AddRow" style="margin: 16px">
          <Button round block type="primary">{{ '新增' }}</Button>
        </div>
        <div v-if="isSinglePages == false" @click="SaveAll(false)" style="margin: 16px">
          <Button round block type="primary">{{ '保存' }}</Button>
        </div>
        <div v-if="isSinglePages == false" @click="colsePoup()" style="margin: 16px">
          <Button round block type="primary">{{ '关闭' }}</Button>
        </div>
      </div>
    </div>
    <Popup v-if="popupModal.modalType === 'dtlFrm'" v-model:show="popupModal.visible" position="left" :style="{ height: '100%', width: '100%' }">
      <NavBar :title="popupModal.title" :fixed="true" />
      <DtlFrm
        v-if="popupModal.visible === true && popupModal.modalType === 'dtlFrm'"
        ref="dtlFrm"
        :refOID="popupModal.refOID"
        :refPKVal="query.WorkID"
        :mapDtl="mapDtl"
        :params="{ IsSinglePages: '0', ...query }"
        :isReadonly="popupModal.isReadonly"
        @handler-close="handlerClose"
      />
    </Popup>
    <Popup v-else v-model:show="popupModal.visible" position="left" :style="{ height: '100%', width: '100%' }">
      <NavBar :title="popupModal.title" :fixed="true" left-arrow @click-left="PopupClose" />
      <DtlImpSimple
        v-if="popupModal.visible === true && popupModal.modalType === 'dtlImpSimple'"
        ref="dtlImpSimple"
        :mainData="mainData"
        :refPKVal="props.params.WorkID"
        :init-sql="popupModal.mapExt.Tag1"
        :list-sql="popupModal.mapExt.Tag2"
        :field-text="popupModal.mapExt.Tag"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
        :mypk="popupModal.mapExt.MyPK"
      />
      <DtlImp
        v-if="popupModal.visible === true && popupModal.modalType === 'dtlImp'"
        ref="dtlImp"
        :mainData="mainData"
        :refPKVal="props.params.WorkID"
        :cond-sql="popupModal.mapExt.Tag1"
        :list-sql="popupModal.mapExt.Tag2"
        :field-text="popupModal.mapExt.Tag"
        :is-multi-select="true"
        :selected-items="cacheSelectedData"
        :mypk="popupModal.mapExt.MyPK"
      />
    </Popup>
    <Popup v-model:show="msgVisible" round closeable @click-close-icon="msgVisible = false" :style="{ padding: '64px' }">
      <div v-html="inputMsg"></div>
    </Popup>
  </div>
</template>
<script lang="ts" setup>
  import { NavBar, Empty, Button, Popup, showFailToast, showToast, showConfirmDialog, Field, Divider } from 'vant';
  // 父组件传过来的属性
  import { computed, provide, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import MapAttrForm from './MapAttrForm.vue';
  import DtlFrm from './DtlFrm.vue';
  import DtlImpSimple from './DtlImpSimple.vue';
  import DtlImp from './DtlImp.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { ddlInfo, GetMapExtsGroup, MapAttrExt, useKeyOfEnType, userConvertData } from '/@/WF/CCForm/FrmEnd';
  import dayjs from 'dayjs';
  import { decodeExtraParams } from '/@/bp/tools/ParamUtils';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import { useRoute, useRouter } from 'vue-router';
  import { cloneDeep } from 'lodash-es';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { MapExts } from '/@/WF/Admin/FrmLogic/MapExt';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { AtPara } from '/@/bp/da/AtPara';
  import { FrmEleDBs } from '/@/WF/Admin/FrmLogic/MapAttrs/FrmEleDB';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
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
    isPreview: {
      type: Boolean,
      default: false,
    },
  });
  const route = useRoute();
  let query = props.params || {};
  if (!props.params.EnsName) query = route.query || {};

  const loading = ref(false);
  //定义从表表格展示的数据和列
  const tableData = ref<any[]>([]);

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
  //从表导入问题
  const isImp = ref(false);
  const impExt = ref<Record<string, string>>({});
  const cacheSelectedData = ref<string[]>([]);

  const autoExt = ref<Map<any, any>>();
  const isHaveData = ref(false);
  let isReadonly = false;
  const rightText = ref('保存');
  const frmRBs = ref<any[]>([]);
  const popKeys = ref<string[]>([]);
  const mainData = ref();
  const { isTextPop, isTextChoiceSearch } = useKeyOfEnType();
  const { GetActionDLLData } = mapExtParse();
  const tempData = ref(0);
  const isSinglePages = ref(false); //是否单独打开
  const contentStyle = reactive({
    backgroundColor: '#f7f8fa',
    boxSizing: 'border-box',
    height: 'calc(100vh)',
    marginTop: '0px',
    paddingBottom: '20px',
    overflowY: 'auto',
  });

  //从表是否有合计行，列
  const isHaveSummary = ref(false);
  const summaryMapExts = ref<any[]>([]);

  const frmData = ref();
  //弹窗显示
  const popupModal = reactive({
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
  });
  /**
   * 自定义url
   * @param mapDtl
   * @constructor
   */
  const GetIFrameSrc = (mapDtl) => {
    let url = mapDtl.UrlDtl || '';
    if (url === '') {
      message.error('从表' + mapDtl.Name + '没有设置URL');
      return url;
    }
    if (!url.includes('?')) url += '?1=1';
    url = DealExp(url, mainData.value);
    let urlParam = '';
    for (const key in props.params) {
      urlParam += '&' + key + '=' + props.params[key];
    }
    url +=
      '&EnsName=' +
      mapDtl.No +
      '&RefPKVal=' +
      props.params.WorkID +
      '&FK_MapData=' +
      mapDtl.FK_MapData +
      '&IsReadonly=' +
      (props.fieldIsReadonly == true ? 1 : 0) +
      urlParam +
      '&Version=1&FrmType=0';
    return url;
  };
  const orginMapExts = ref<Record<string, any>[]>([]);
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      if (!!props.dtlInfo.No) {
        query.EnsName = props.dtlInfo['No'];
        query.MapDtlNo = query.EnsName;
        query.FrmID = props.dtlInfo.FK_MapData;
        query.RefPKVal = props.params.WorkID;
        isReadonly = props.isReadonly;
        contentStyle.marginTop = '0px';
        contentStyle.height = 'calc(100vh)';
      } else {
        if (!!query?.IsSinglePages) isSinglePages.value = query?.IsSinglePages === '0' ? false : true;
        else isSinglePages.value = true;
        isReadonly = query?.IsReadonly != '0';
        contentStyle.marginTop = '46px';
        contentStyle.height = 'calc(100vh - 46px)';
      }
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('Dtl_Init');
      mapDtl.value = data['Sys_MapDtl'][0] || {};
      const dtlMapExts = GetMapExtsGroup(data['Sys_MapExt']);
      orginMapAttrs.value = data['Sys_MapAttr'];
      orginMapExts.value = data['Sys_MapExt'];
      const aths = data['Sys_FrmAttachment'];
      frmRBs.value = data['Sys_FrmRB'];
      mainData.value = data['MainTable'][0];
      frmData.value = data;
      //参数
      //从表列合计栏
      summaryMapExts.value = data['Sys_MapExt']?.filter((mapExt) => mapExt.ExtModel === 'NumFiledSumAvg' && mapExt?.DoWay != 0) || [];
      if (summaryMapExts.value.length > 0) isHaveSummary.value = true;

      //是否启用导入功能
      const impexts = data['Sys_MapExt']?.filter((mapExt) => mapExt.ExtModel === 'DtlImp' && mapExt?.DoWay != 0) || [];
      impExt.value = impexts.length > 0 ? impexts[0] : {};
      isImp.value = impexts.length > 0;

      //处理mapAttr的信息
      //处理字段的下拉框
      orginMapAttrs.value.forEach((mapAttr) => {
        if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum)
          mapAttr.ddl = GetDDLOption(mapAttr as any, data);
        //日期、日期时间类型
        if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
          const formatType = GetDateTimeOption(mapAttr as any);
          mapAttr['dateType'] = formatType[0];
          mapAttr['columnsType'] = formatType[1];
          mapAttr.format = formatType[2];
        }
        if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney)
          mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
        //字段附件，获取对应的附件信息
        if (mapAttr.UIContralType === UIContralType.AthShow) {
          const result = aths.filter((ath) => ath.MyPK === mapAttr.MyPK);
          if (result.length == 0) {
            mapAttr.ath = null;
          }
          mapAttr.ath = result[0];
        }
        mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;
        //后置说明
        mapAttr.suffix = GetPara(mapAttr.AtPara, 'suffix') || '';
        //mapExt的集合
        mapAttr.mapExts = dtlMapExts[mapAttr.MyPK];
        if (isTextPop(mapAttr) || isTextChoiceSearch(mapAttr)) popKeys.value.push(mapAttr.KeyOfEn);
        mapAttr['eleDBs'] = [];
      });
      rowMapAttrs.value = [[]];
      mapAttrs.value = orginMapAttrs.value.filter((attr) => attr.UIVisible == 1);
      const dtlData = data['DBDtl']; //从表数据集合
      isHaveData.value = dtlData.length > 0 ? true : false;
      if (mapDtl.value.ColAutoExp && mapDtl.value.ColAutoExp != '') {
        autoExt.value = decodeExtraParams(mapDtl.value.ColAutoExp);
      }
      isInsert.value = mapDtl.value.IsInsert === '1' && isReadonly == false && mapDtl.value.IsReadonly == '0';
      isDelete.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1') && isReadonly == false && mapDtl.value.IsReadonly == '0';
      isSave.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1' || mapDtl.value.IsUpdate == '1') && mapDtl.value.IsReadonly == '0' && isReadonly == false;
      isBatchUpdate.value = parseInt(mapDtl.value.IsBatchUpdate) === 1 && props.isReadonly == false && isSave.value == true;

      //变更tableData中的值
      tableData.value = [];
      const exts = data['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'ActiveDDL' && mapExt?.DoWay != 0);
      const cmapExts = data['Sys_MapExt'].filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
      for (let i = 0; i < dtlData.length; i++) {
        let item = dtlData[i];
        item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
        dtlData[i] = item;
        rowMapAttrs.value[i] = cloneDeep(mapAttrs.value);
        if (popKeys.value.length != 0) {
          const eleDBs = new FrmEleDBs();
          await eleDBs.Retrieve('FK_MapData', mapDtl.value.No, 'RefPKVal', item.OID == 0 ? query.WorkID + '_' + i : item.OID);
          rowMapAttrs.value[i].forEach((attr) => {
            if (popKeys.value.includes(attr.KeyOfEn)) attr['eleDBs'] = eleDBs.filter((eleDB) => eleDB.EleID === attr.KeyOfEn);
          });
        }
        if (exts.length != 0)
          for (const mapExt of exts) {
            const refPKVal = parseInt(item.OID) === 0 ? query.WorkID + '_' + i : '' + parseInt(item.OID);
            const data = await GetActionDLLData(item[mapExt.AttrOfOper], mapExt, 'Doc', refPKVal, item, 'Dtl');
            dtlData[i] = ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, item, i);
          }
       if (cmapExts.length != 0 && isSave.value)
          cmapExts.forEach((mapExt) => {
            if (Array.isArray(item[mapExt.AttrOfOper])) {
              item[mapExt.AttrOfOper].forEach((val) => {
                SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, val, i,true);
              });
            } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item[mapExt.AttrOfOper],i, true);
          });
      }
      tableData.value = dtlData; //从表数据集合
      //if (isInsert.value == true && isHaveData.value === false) AddRow();
      if (isSave.value == false) rightText.value = '';
    } catch (e) {
      showFailToast(e as string);
    } finally {
      loading.value = false;
    }
  };

  InitPage();
  const { ConvertDataToDB, ConvertDataFromDB } = userConvertData();
  /**
   * 计算合计值
   */
  const totals = computed(() => {
    const arr: Record<string, number> = {};
    tableData.value.forEach((item) => {
      summaryMapExts.value?.forEach((mapExt) => {
        if (!arr[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = 0;
        switch (parseInt(mapExt?.DoWay)) {
          case 1:
          case 2:
            // arr[key] += item[key];
            arr[mapExt.AttrOfOper] = parseFloat((parseFloat(arr[mapExt.AttrOfOper]) + parseFloat(item[mapExt.AttrOfOper])).toFixed(2));
            break;
          case 3:
            // if (arr[key] < item[key]) arr[key] = item[key];
            if (arr[mapExt.AttrOfOper] < item[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = item[mapExt.AttrOfOper];
            break;
          case 4:
            if (arr[mapExt.AttrOfOper] > item[mapExt.AttrOfOper]) arr[mapExt.AttrOfOper] = item[mapExt.AttrOfOper];

            // if (arr[key] > item[key]) arr[key] = item[key];
            break;
          default:
            showFailToast(mapExt + '的计算方式还未增加');
            break;
        }
      });
    });
    summaryMapExts.value?.forEach((mapExt, key) => {
      if (parseInt(mapExt?.DoWay) === 2) arr[key] = arr[key] / tableData.value.length;
    });

    return arr;
  });
  /**
   * 新增
   * @constructor
   */
  const AddRow = async () => {
    /*if (parseInt(mapDtl.value.EditModel) != 0) {
      const row: Record<string, any> = {};
      row['OID'] = 0;
      tableData.value.push(row);
      EditOrViewRow(tableData.value.length - 1);
      return;
    }*/
    let row: Record<string, any> = {};
    orginMapAttrs.value.forEach((attr) => {
      row[attr.KeyOfEn] = GetValByDefVal(attr.DefVal, attr);
    });
    if (mapDtl.value.IsCopyFirstData === 1 && tableData.value.length > 0) row = tableData.value[0];
    row['OID'] = 0;
    tableData.value.push(await ConvertDataFromDB(row, mapAttrs.value as any));
    rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
    const cmapExts =  orginMapExts.value.filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
    if (cmapExts.length != 0 && isSave.value){
      const item= tableData.value[tableData.value.length-1];
      cmapExts.forEach((mapExt) => {
        if (Array.isArray(item[mapExt.AttrOfOper])) {
          item[mapExt.AttrOfOper].forEach((val) => {
            SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, val, tableData.value.length-1, true);
          });
        } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item[mapExt.AttrOfOper], tableData.value.length-1, true);
      });
    }
  };
  /**
   * 行编辑，经典表单显示
   * @param rowIdx
   * @constructor
   */
  const EditOrViewRow = (rowIdx) => {
    popupModal.modalType = 'dtlFrm';
    popupModal.visible = true;
    popupModal.title = '新增/编辑';
    popupModal.width = window.innerWidth * 0.8;
    popupModal.width = window.innerWidth * 0.8;
    popupModal.isReadonly = isSave.value === true ? false : true;
    popupModal.refOID = tableData.value[rowIdx]['OID'];
  };

  const handlerClose = () => {
    popupModal.visible = false;
    tempData.value++;
    InitPage();
  };
  const dtlImpSimple = shallowRef<InstanceType<typeof DtlImpSimple>>();
  const dtlImp = shallowRef<InstanceType<typeof DtlImp>>();
  const PopupClose = async () => {
    if (tableData.value.length == 0) {
      isHaveData.value = false;
    } else {
      isHaveData.value = true;
    }
    if (popupModal.modalType === 'dtlImp') {
      const arrs = dtlImp.value?.checkInfoList || [];
      cacheSelectedData.value = dtlImp.value?.checkedList || [];
      const key = impExt.value.Tag4;
      if (!key) {
        for (const item of arrs) {
          //执行新增.
          tableData.value.push(await ConvertDataFromDB(item, mapAttrs.value as any));
          rowMapAttrs.value[tableData.value.length - 1] = cloneDeep(mapAttrs.value);
        }
        tempData.value++;
      }
    }
    if (popupModal.modalType === 'dtlImpSimple') {
      const arrs = dtlImpSimple.value?.checkInfoList || [];
      cacheSelectedData.value = dtlImpSimple.value?.checkedList || [];
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
    popupModal.visible = false;
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
        if (props.isReadonly == true || attr.UIIsEnable === 0) return dayjs().format(GetDateTimeOption(attr)[2] as string);
        let dataFormat = 'yyyy-MM-dd';
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
            showFailToast('没有找到指定的时间类型');
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
        return dayjs().format(defVal.replace('@', '').replace('yyyy', 'YYYY').replace('dd', 'DD'));
      default:
        return defVal;
    }
  };
  /**
   * 删除行
   * @constructor
   */
  const DeleteRow = async (index = -1, record = null) => {
    if (index == -1) {
      //获取选中的值
      return;
    }
    //删除行数据
    if (record != null) {
      showConfirmDialog({
        title: '提示',
        message: '确定要删除选择的行?',
      })
        .then(async () => {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          handler.AddPara('FK_MapDtl', mapDtl.value.No);
          handler.AddPara('RefOID', record['OID']);
          handler.AddPara('RefPKVal', query.RefPKVal);
          const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
          if (typeof data === 'string' && data.includes('err@')) {
            showFailToast(data.replace('err@', ''));
            return;
          }
          tableData.value.splice(index, 1);
          rowMapAttrs.value.splice(index, 1);
          if (tableData.value.length == 0) isHaveData.value = false;
          tempData.value++;
          showToast('删除成功');
        })
        .catch(() => {});
    }
  };
  /**
   * 移除行
   * @constructor
   */
  const RemoveRow = (index) => {
    tableData.value.splice(index, 1);
    if (tableData.value.length == 0) isHaveData.value = false;
    showToast('移除成功');
  };
  const emit = defineEmits(['ClosePoup', 'UpdateMainData']);

  /**
   * 导入从表信息
   * @constructor
   */
  const ImpDtl = () => {
    //解析从表导入模式  DoWay=1表格查询模式（简单模式）,DoWay=2Excel文件模式，DoWay=1表格查询模式（高级）
    if (impExt.value.DoWay === '1') {
      popupModal.modalType = 'dtlImpSimple';
      popupModal.visible = true;
      popupModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      // popupModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      // popupModal.width = popupModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      // popupModal.height = {
      //   height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      // };
      popupModal.mapExt = impExt.value;
      popupModal.itemNames = '';
    } else if (impExt.value.DoWay === '3') {
      popupModal.modalType = 'dtlImp';
      popupModal.visible = true;
      popupModal.title = GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      // popupModal.width = parseFloat(impExt.value.W) || window.innerWidth * 0.8;
      // popupModal.width = popupModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
      // popupModal.height = {
      //   height: impExt.value.H || window.innerHeight * 0.8 + 'px',
      // };
      popupModal.mapExt = impExt.value;
      popupModal.itemNames = '';
    }
  };
  /**
   * 保存
   * @constructor
   */

  const SaveAll = async (isSave = false) => {
    let dtlData: any[] = [];
    for (const item of tableData.value) {
      const newItem = await ConvertDataToDB(cloneDeep(item), orginMapAttrs.value);
      dtlData.push(newItem);
    }
    if (isSave === false) {
      let msg = '';
      
      if (mapDtl.value.NumOfDtl > 0 && tableData.value.length == 0) {
        //4msg += '请检查明细表 [' + mapDtl.value.Name + '] ，至少填写' + mapDtl.value.NumOfDtl + '条数据！';
      }
      //校验从表数字类型填写规范
      /*for (const mapAttr of mapAttrs.value) {
        if (mapAttr.MyDataType == DataType.AppMoney || mapAttr.MyDataType == DataType.AppFloat || mapAttr.MyDataType == DataType.AppInt) {
          const isValidNumber = /^[+-]?\d*(\.\d+)?$/.test(tableData.value[mapAttr.KeyOfEn]);
          if (!isValidNumber) {
            str += '字段' + mapAttr.Name + '输入数字类型' + '\t\n';
          }
        }
      }*/
      const newMapAttrs = mapAttrs.value.filter((mapAttr) => mapAttr.UIIsInput === 1);
      tableData.value.forEach((rowData, idx) => {
        let str = '';
        newMapAttrs.forEach((mapAttr) => {
          if (mapAttr.MyDataType == DataType.AppMoney || mapAttr.MyDataType == DataType.AppFloat || mapAttr.MyDataType == DataType.AppInt) {
            const isValidNumber = /^[+-]?\d*(\.\d+)?$/.test(rowData[mapAttr.KeyOfEn]);
            if (!isValidNumber) {
              str += '字段' + mapAttr.Name + '输入数字类型' + '\t\n';
            }
          }
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
        return false;
      }
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddJson(query);
    handler.AddPara('Json', encodeURIComponent(JSON.stringify(dtlData)));
    const data = await handler.DoMethodReturnString('Dtl_Save');
    if (typeof data === 'string' && data.includes('err@')) {
      showFailToast(data.replace('err@', ''));
      return false;
    }
    if (isSave == false) showToast(mapDtl.value.Name + '保存成功');
    tableData.value = [];
    dtlData = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < dtlData.length; i++) {
      let item = dtlData[i];
      item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
      dtlData[i] = item;
      rowMapAttrs.value[i] = cloneDeep(mapAttrs.value);
      tableData.value.push(item);
    }
    tempData.value++;
    if (isSinglePages.value == false) {
      emit('ClosePoup');
      return;
    }

    return true;
  };
  const colsePoup = () => {
    emit('ClosePoup');
  };
  /**
   * 返回上一级
   */
  const msgVisible = ref(false);
  const inputMsg = ref('');
  const router = useRouter();
  const onClickLeft = async () => {
    if (props.params.RefPKVal === '0') {
      colsePoup();
      return;
    }
    if (isSave.value == true) {
      //判断是否最小行数
      if (mapDtl.value.NumOfDtl != 0 && mapDtl.value.NumOfDtl > tableData.value.length) {
        showFailToast(mapDtl.value.Name + '至少含有' + mapDtl.value.NumOfDtl + '条数据');
        return;
      }
      //必填的验证
      let msg = '';
      tableData.value.forEach((rowData, rowIdx) => {
        let rowMsg = '';
        mapAttrs.value
          .filter((mapAttr) => mapAttr.UIIsInput === 1)
          .forEach((mapAttr) => {
            if (mapAttr.LGType === FieldTypeS.Enum) {
              if (mapAttr.UIContralType == UIContralType.CheckBok) {
                if (!rowData[mapAttr.KeyOfEn] || rowData[mapAttr.KeyOfEn] === '-1') rowMsg += '字段' + mapAttr.Name + '值不能为空<br/>';
              } else if (rowData[mapAttr.KeyOfEn] === -1 || rowData[mapAttr.KeyOfEn] === '-1') rowMsg += '字段' + mapAttr.Name + '值不能为空,<br/>';
            } else if (rowData[mapAttr.KeyOfEn] === null || rowData[mapAttr.KeyOfEn] === '') rowMsg += '字段' + mapAttr.Name + '值不能为空<br/>';
          });
        if (rowMsg != '') msg += '第' + (rowIdx + 1) + '行必填项未输入值:<br/>' + rowMsg;
      });

      if (msg != '') {
        inputMsg.value = msg;
        msgVisible.value = true;
        //showFailToast(msg);
        return;
      }

      await SaveAll(false);
    }
    const mapExts = new MapExts();
    await mapExts.Retrieve('FK_MapData', mapDtl.value.FK_MapData, 'Doc', mapDtl.value.No);
    const arr = mapExts.filter((mapAttr) => mapAttr.DoWay != 0);
    if (arr.length != 0) {
      /* const en = new BSEntity(mapDtl.value.FK_MapData);
      en.setPK(query.RefPKVal);
      await en.RetrieveFromDBSources();*/
      arr.forEach((mapExt) => {
        if (mapExt.ExtModel === 'NumEnterLimit') {
          const val = GetMainTableData({ dtlKey: mapExt.Tag1, computed: mapExt.Tag, type: 'Number' });
          //en[mapExt.AttrOfOper] = val;
          emit('UpdateMainData', mapExt.AttrOfOper, val);
        }
        if (mapExt.ExtModel === 'DateFiledMaxMin') {
          const val = GetMainTableData({ dtlKey: mapExt.Tag1, computed: mapExt.Tag, type: 'Date' });
          emit('UpdateMainData', mapExt.AttrOfOper, val);
          //en[mapExt.AttrOfOper] = val;
        }
      });
      //await en.Update();
    }
    colsePoup();
    /*let url = history.state.back;
    if (url.indexOf('WorkID') == -1) url += '&WorkID=' + query.RefPKVal;
    router.replace(url);*/
  };
  const GetMainTableData = (args) => {
    //@Sum=求和@Avg=求平均@Max=求最大@Min=求最小
    if (args.type === 'Number') {
      const bit = mapAttrs.value.filter((mapAttr) => mapAttr.KeyOfEn == args.dtlKey)[0]['bit'] || 2;
      let val = 0;
      tableData.value.forEach((item, idx) => {
        if (idx == 0 && (args.computed === 'Max' || args.computed === 'Min')) val = item[args.dtlKey];
        switch (args.computed) {
          case 'Sum': // 求和
          case 'Avg': //求平均
            val = val + parseFloat(item[args.dtlKey]);
            break;
          case 'Max': //求最大值
            if (val < item[args.dtlKey]) val = item[args.dtlKey];
            break;
          case 'Min': //求最小值
            if (val > item[args.dtlKey]) val = item[args.dtlKey];
            break;
        }
      });
      const factor = Math.pow(10, bit);
      val = Math.round(parseFloat(val) * factor + Number.EPSILON) / factor;
      if (args.computed === 'Avg') val = parseFloat(val) / tableData.value.length;
      return val;
    }
    if (args.type === 'Date') {
      let val = '';
      tableData.value.forEach((item, idx) => {
        if (idx == 0) val = item[args.dtlKey];
        switch (args.computed) {
          case 'Max': //求最大值
            if (val < item[args.dtlKey]) val = item[args.dtlKey];
            break;
          case 'Min': //求最小值
            if (val > item[args.dtlKey]) val = item[args.dtlKey];
            break;
        }
      });
      return val;
    }
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
          text: '绑定的外键枚举值丢失',
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
          text: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.value.push({
          value: item.StrKey || item.IntKey,
          text: item['Name' + sysLang] || item.Lab,
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
          text: valText,
        },
      ];
    }
    if (data == undefined)
      return [
        {
          value: '',
          text: '请选择',
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
          text: item.Name,
        };
      });
    }
    return data.map((item) => {
      return {
        value: mapAttr.LGType === FieldTypeS.Enum && mapAttr.MyDataType === DataType.AppInt ? item.No : item.No.toString(),
        text: item.Name,
      };
    });
  };
  /* const GetDDLOption = (mapAttr: MapAttrExt, frmData) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: '',
          text: '绑定的外键枚举值丢失',
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
          value: -1,
          text: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.IntKey,
          text: item.Lab,
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
          text: valText,
        },
      ];
    }
    if (data == undefined)
      return [
        {
          value: '',
          text: '请选择',
        },
      ];

    return data.map((item) => {
      return {
        value: item.No,
        text: item.Name,
      };
    });
  };*/
  /**
   * 时间类型格式
   * @param mapAttr
   * @constructor
   */
  /**
   * 时间类型格式
   * @param mapAttr
   * @constructor
   */
  const GetDateTimeOption = (mapAttr: MapAttrExt) => {
    switch (parseInt(mapAttr.IsSupperText)) {
      case 0:
        return ['date', ['year', 'month', 'day'], 'YYYY-MM-DD'];
      case 1:
        return ['datetime', ['hour', 'minute'], 'YYYY-MM-DD HH:mm'];
      case 2:
        return ['datetime', ['hour', 'minute', 'second'], 'YYYY-MM-DD HH:mm:ss'];
      case 3:
        return ['date', ['year', 'month'], 'YYYY-MM'];
      case 4:
        return ['time', ['hour', 'minute'], 'HH:mm'];
      case 5:
        return ['time', ['hour', 'minute', 'second'], 'HH:mm:ss'];
      case 6:
        return ['date', ['month', 'day'], 'MM-DD'];
      case 7:
        return ['date', ['year'], 'YYYY'];
      case 8:
        return ['date', ['month'], 'MM'];
      default:
        return ['date', ['year', 'month', 'day'], 'YYYY-MM-DD'];
    }
  };
  const GetMapAttrs = (mapAttrs, idx) => {
    if (idx > rowMapAttrs.value.length - 1) return mapAttrs;
    return rowMapAttrs.value[idx];
  };
  /**
   * 修改父组件属性的信息
   * @param mapAttr
   * @param type
   * @constructor
   */
  const ChangeParentAttr = (keyOfEn, type, data, rowData, rowIdx) => {
    if (typeof rowData == 'undefined' || typeof rowData != 'object') rowData = tableData.value[rowIdx];
    switch (type) {
      case 'ActiveDDL':
        rowMapAttrs.value[rowIdx].forEach((mapAttr) => {
          if (mapAttr.KeyOfEn === keyOfEn) {
            const oldVal = rowData[keyOfEn];
            mapAttr['ddl'] = data;
            const result = data.filter((item) => item.value === rowData[keyOfEn]);
            let option = null;
            if (result.length != 0) option = result[0];
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
        return rowData;
        break;
       case 'EnumHidItems': //隐藏枚举项
        for (const mapAttr of rowMapAttrs.value[rowIdx]) {
          if (mapAttr.KeyOfEn === keyOfEn) {
            if (typeof mapAttr['ogDll'] === 'undefined') mapAttr['ogDll'] = mapAttr.ddl;
            if(!!data){
              mapAttr['ddl'] = mapAttr['ogDll']
              .filter((item) => data.includes(item.value + ',') == false)
              .map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  text: item.text,
                };
              });
              //判断当前值是否在当前的下拉列表中
              if (mapAttr.UIContralType == UIContralType.CheckBok) {
                //多选
                if (mapAttr['ddl'].filter((item) => rowData[keyOfEn].includes(item.value)).length === 0) {
                  rowData[keyOfEn] = [];
                }
              } else {
                if (mapAttr['ddl'].filter((item) => item.value ===rowData[keyOfEn]).length === 0) {
                  rowData[keyOfEn] = mapAttr['ddl'].length === 0 ? (mapAttr.MyDataType === DataType.AppString ? '' : '-1') : -1;
                }
              }

              //调用子页面的方法
              MapAttrLinkageTrigger(mapAttr, rowData[keyOfEn], rowData['OID'], rowData, rowIdx, rowData[keyOfEn]);
            }
            else  mapAttr['ddl'] =cloneDeep(mapAttr['ogDll']);
            return;
          }
        }
        break;  
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
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, rowData, mainData.value);
            if (fullData == null) continue;
            ChangeParentAttr('', 'FullData', fullData, rowIdx, rowData);
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
   * 联动其他控件
   */
  const LinkAttrs = {};
  //清空联动
  const CleanAll = (frmID, keyOfEn, idx) => {
  };
  //设置联动
  const SetEnable = async (frmID, keyOfEn, val, idx,isFirstLoad = false) => {
    //判断是否启用了
    const frmRBs = frmData.value.Sys_FrmRB;
    if (typeof val === 'boolean') {
      val = val ? 1 : 0;
    }
    const frmRB = frmRBs.filter((frmRB) => frmRB.MyPK === frmID + '_' + keyOfEn + '_' + val);
    if (frmRB.length == 0) return;
    const curmapAttrs = cloneDeep(mapAttrs.value);
    //隐藏，显示的设置
    const cfgs = frmRB[0].FieldsCfg;
    //设置字段默认值
    const setVal = frmRB[0].SetVal;
    if (!cfgs && !setVal) return;
    const cfgPara = new AtPara(cfgs);
    cfgPara.HisHT.forEach((value, key) => {
      const val = parseInt(value);
      if (val != 0) {
        for (let i = 0; i < curmapAttrs.length; i++) {
          if (curmapAttrs[i].MyPK === frmID + '_' + key || curmapAttrs[i].MyPK === key) {
            if (val === 1) {
              //设置为可编辑
              curmapAttrs[i].UIIsEnable = 1;
              curmapAttrs[i].UIVisible = 1;
            }
            if (val === 2) {
              //设置为可编辑且必填
              curmapAttrs[i].UIIsEnable = 1;
              curmapAttrs[i].UIIsInput = 1;
              curmapAttrs[i].UIVisible = 1;
              
            }
            if (val === 3) {
              //设置为可见
              curmapAttrs[i].UIIsEnable = 0;
              curmapAttrs[i].UIVisible = 1;
            }
            if (val === 4) {
              //设置为不可见
              curmapAttrs[i].UIVisible = 0;
            }
            //设置为可见且必填
            if (val === 5) {
              curmapAttrs[i].UIIsEnable = 0;
              curmapAttrs[i].UIVisible = 1;
              curmapAttrs[i].UIIsInput = 1;
            }
            break;
          }
        }
      }
    });
    rowMapAttrs.value[idx] = cloneDeep(curmapAttrs);
    if(isFirstLoad==false)tempData.value++;
  };


  provide('CleanAll', CleanAll);
  provide('SetEnable', SetEnable);
</script>

<style lang="less" scoped>
  .must-input {
    color: red;
  }
  h2 {
    margin: 0;
    padding: 16px 16px 16px;
    color: var(--van-doc-text-color-4);
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  :deep(.van-nav-bar__left .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  .van-hairline--bottom:after {
    border-bottom-width: 0;
  }
</style>
