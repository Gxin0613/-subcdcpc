<template>
  <div style="overflow-y: hidden">
    <NavBar v-if="isSinglePages" :title="mapDtl.Name" :fixed="true" left-arrow @click-left="onClickLeft">
      <template v-if="mapDtl.ListShowModel != 2" #right>
        <span v-if="isImp && isSave" style="color: white" size="18" @click="ImpDtl">{{ '导入' }}</span>
      </template>
    </NavBar>
    <div :style="contentStyle">
      <!--显示数据-->
      <div v-if="isHaveData === false && isInsert === false">
        <Empty :description="'暂无数据'" style="margin-top: 150px" />
      </div>
      <div v-else>
        <div v-for="(item, index) in tableData" :key="index">
          <div class="vant-address-item">
            <div class="vant-cell vant-cell--borderless">
              <div class="vant-cell__value vant-cell__value--alone">
                <span v-if="isDelete">
                  <div class="vant-gl-text">
                    <h2 style="display: inline-block; font-weight: bold">#{{ index + 1 }}</h2>
                    <div style="display: inline-block; margin-left: calc(100% - 180px)">
                      <a v-if="item.OID && item.OID !== 0" @click="DeleteRow(index, item)">{{ '删除' }}<Divider vertical :hairline="false" /></a>
                      <a v-else @click="RemoveRow(index)">{{ '移除' }}<Divider vertical :hairline="false" /></a>
                      <a v-if="isSave" @click="EditOrViewRow(index)">{{ '编辑' }}</a>
                    </div>
                  </div>
                </span>
                <span v-else
                  ><h2 style="display: inline-block">#{{ index + 1 }}</h2></span
                >
                <span v-for="(attr, idx) in mapAttrs" :key="idx">
                  <div class="vant-gl-text">
                    <span style="color: #808399"> {{ attr.Name }}</span>
                    <span>
                      <template v-if="attr.UIContralType === UIContralType.HandWriting">
                        <img :src="GetImgSrc(attr, item[attr.KeyOfEn])" onerror="this.style.dispaly='none'" :style="{ width: '100%', height: '32px' }" />
                      </template>
                      <template v-else-if="attr.MyDataType === DataType.AppBoolean">
                        {{ item[attr.KeyOfEn] ? GetPara(attr.AtPara, 'checkedTips') || '是' : GetPara(attr.AtPara, 'unCheckedTips') || '否' }}
                      </template>
                      <template v-else-if="attr.MyDataType === DataType.AppString && attr.UIContralType === UIContralType.TB && attr.TextModel === 3">
                        <div v-html="item[attr.KeyOfEn]" class="html-field"></div>
                      </template>
                      <template v-else>
                        {{ item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn] }}
                      </template>
                    </span>
                  </div>
                </span>
              </div>
            </div>
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
        <div v-if="isSinglePages == false" @click="SaveAll()" style="margin: 16px">
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
        :refPKVal="query.WorkID || query.RefPKVal"
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
    </Popup>
    <Popup v-model:show="msgVisible" round closeable @click-close-icon="msgVisible = false" :style="{ padding: '64px' }">
      <div v-html="inputMsg"></div>
    </Popup>
  </div>
</template>
<script lang="ts" setup>
    import { NavBar, Empty, Button, Popup, showFailToast, showToast, showConfirmDialog, Field, Divider } from 'vant';
  // 父组件传过来的属性
  import { computed, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import DtlFrm from './DtlFrm.vue';
  import DtlImpSimple from './DtlImpSimple.vue';
  import { MapAttrExt, userConvertData } from '/@/WF/CCForm/FrmEnd';
  import { UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import { useRoute } from 'vue-router';
  import { cloneDeep } from 'lodash-es';
  import { MapExts } from '/@/WF/Admin/FrmLogic/MapExt';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getAppEnvConfig } from '/@/utils/env';
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

  const isHaveData = ref(false);
  const mainData = ref();
  const tempData = ref(0);
  const isSinglePages = ref(false); //是否单独打开
  const contentStyle = reactive({
    backgroundColor: '#f7f8fa',
    boxSizing: 'border-box',
    height: 'calc(100vh - 46px)',
    marginTop: '0px',
    paddingBottom: '20px',
    overflowY: 'auto',
  });

  //从表是否有合计行，列
  const isHaveSummary = ref(false);
  const summaryMapExts = ref<any[]>([]);

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
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const GetImgSrc = (mapAttr, value) => {
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    if (value == null || value == undefined || value == '') return prefix + '/DataUser/Siganture/UnName.jpg';
    return prefix + value.substring(value.indexOf('/DataUser'));
  };

  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;

      if (!!props.dtlInfo.No) {
        query.EnsName = props.dtlInfo['No'];
        query.MapDtlNo = query.EnsName;
        query.FrmID = props.dtlInfo.FK_MapData;
        query.RefPKVal = props.params.WorkID || props.params.RefPKVal;
        contentStyle.marginTop = '0px';
        contentStyle.height = 'calc(100vh)';
      } else {
        if (!!query?.IsSinglePages) isSinglePages.value = query?.IsSinglePages === '0' ? false : true;
        else isSinglePages.value = true;
        contentStyle.marginTop = '46px';
        contentStyle.height = 'calc(100vh - 46px)';
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query);
      const data = await handler.DoMethodReturnString('DtlCard_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
        return;
      }
      //从表的属性
      mapDtl.value = data['Main'][0];
      //从表的插入、删除、批量更新的设置
      isInsert.value = mapDtl.value.IsInsert === '1' && props.isReadonly == false;
      isDelete.value = (mapDtl.value.IsDelete === '1' || mapDtl.value.IsInsert === '1') && props.isReadonly == false;
      isSave.value =
        (parseInt(mapDtl.value.IsDelete) === 1 || parseInt(mapDtl.value.IsInsert) === 1 || parseInt(mapDtl.value.IsUpdate) == 1) &&
        parseInt(mapDtl.value.IsReadonly) == 0 &&
        props.isReadonly == false;
      isBatchUpdate.value = parseInt(mapDtl.value.IsBatchUpdate) === 1 && props.isReadonly == false;

      //是否启用导入功能
      const impexts = data['MapExts']?.filter((mapExt) => mapExt.ExtModel === 'DtlImp' && mapExt?.DoWay != 0) || [];
      impExt.value = impexts.length > 0 ? impexts[0] : {};
      isImp.value = impexts.length > 0;

      //从表的字段
      orginMapAttrs.value = data['MapAttrs'];
      mapAttrs.value = orginMapAttrs.value.filter((attr) => attr.UIVisible == 1);
      //明细的集合
      const dtlData = data['DTDtls'];
      for (let i = 0; i < dtlData.length; i++) {
        let item = dtlData[i];
        item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
        dtlData[i] = item;
      }
      tableData.value = dtlData;
      isHaveData.value = tableData.value.length > 0;
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
    const row: Record<string, any> = {};
    row['OID'] = 0;
    tableData.value.push(row);
    EditOrViewRow(tableData.value.length - 1);
    return;
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
  const PopupClose = async () => {
    if (tableData.value.length == 0) {
      isHaveData.value = false;
    } else {
      isHaveData.value = true;
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
  const emit = defineEmits(['ClosePoup']);

  /**
   * 导入从表信息
   * @constructor
   */
  const ImpDtl = () => {
    //解析从表导入模式  DoWay=1表格查询模式（简单模式）,DoWay=2Excel文件模式，DoWay=1表格查询模式（高级）
    if (impExt.value.DoWay === '1') {
      popupModal.modalType = 'dtlImpSimple';
      popupModal.visible = true;
      popupModal.title =
        GetPara(impExt.value.AtPara, 'Title') || '选择' + mapDtl.value.Name + '数据';
      popupModal.mapExt = impExt.value;
      popupModal.itemNames = '';
    }
  };
  /**
   * 保存
   * @constructor
   */

  const SaveAll = async (isOnlySave = false) => {
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
  const onClickLeft = async () => {
    if (props.params.RefPKVal === '0') {
      colsePoup();
      return;
    }
    const mapExts = new MapExts();
    await mapExts.Retrieve('FK_MapData', mapDtl.value.FK_MapData, 'Doc', mapDtl.value.No);
    const arr = mapExts.filter((mapAttr) => mapAttr.DoWay != 0);
    if (arr.length != 0) {
      const en = new BSEntity(mapDtl.value.FK_MapData);
      en.setPK(query.RefPKVal);
      await en.RetrieveFromDBSources();
      arr.forEach((mapExt) => {
        if (mapExt.ExtModel === 'NumEnterLimit') {
          const val = GetMainTableData({ dtlKey: mapExt.Tag1, computed: mapExt.Tag, type: 'Number' });
          en[mapExt.AttrOfOper] = val;
        }
        if (mapExt.ExtModel === 'DateFiledMaxMin') {
          const val = GetMainTableData({ dtlKey: mapExt.Tag1, computed: mapExt.Tag, type: 'Date' });
          en[mapExt.AttrOfOper] = val;
        }
      });
      await en.Update();
    }
    colsePoup();
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

  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
    margin: 5px;
  }
  .vant-collapse-item__title {
    background: #fafafa !important;
  }
  .vant-collapse-item__content {
    background: #fafafa !important;
  }

  .vant-gl-tag {
    width: 15%;
    display: flex;
    justify-content: center;
    margin-left: auto;
  }
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
</style>
