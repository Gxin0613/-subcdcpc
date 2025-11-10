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
                <Popconfirm v-if="isDelete" :title="'确定要删除选择的行吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteRows()">
                  <Button ghost class="gostButton label"><CloseOutlined />{{ '删除' }}</Button>
                </Popconfirm>

                <!--                <Button v-if="isBatchUpdate" @click="BatchUpdateRows" ghost class="gostButton"><EditOutlined />{{'编辑'}}</Button>-->
                <template v-for="item in btnList" :key="item">
                  <Button type="default" @click="BtnClick(item)" ghost class="gostButton label">
                    {{ item }}
                  </Button>
                </template>
                <Button v-if="parseInt(mapDtl.IsImp) === 1" @click="ExpDtl" ghost class="gostButton label"><UploadOutlined />{{ '导出' }}</Button>
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
              <Button v-if="isInsert" @click="AddRow"><PlusOutlined />{{ '新增' }}</Button>
              <Popconfirm v-if="isDelete" :title="'确定要删除选择的行吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteRows()">
                <Button><CloseOutlined />{{ '删除' }}</Button>
              </Popconfirm>

              <Button v-if="isBatchUpdate" @click="BatchUpdateRows"><EditOutlined />{{ '编辑' }}</Button>
              <template v-for="item in btnList" :key="item">
                <Button type="default" @click="BtnClick(item)">
                  {{ item }}
                </Button>
              </template>
              <Button v-if="parseInt(mapDtl.IsImp) === 1" @click="ExpDtl"><UploadOutlined />{{ '导出' }}</Button>
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
              <Button @click="fullScreen">
                <FullscreenOutlined />
              </Button>
            </div>
          </div>

          <div ref="tableRef" :style="groupField.IsZDPC == 1 ? { minHeight: '0', height: '0', overflow: 'hidden' } : ''">
            <Table
              :row-selection="isDelete === true || isBatchUpdate === true ? { selectedRowKeys: tableSelectedRowKeys, onChange: onSelectChange } : null"
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
              :customRow="dbClcik"
            >
              <template #headerCell="{ column }">
                <template v-if="column.attr !== undefined && column.attr.UIIsInput">
                  <span class="must-input">*</span><span>{{ column.title }}</span>
                </template>
              </template>
              <template #bodyCell="{ column, index, record }">
                <template v-if="!!column.attr">
                  <template v-if="column.attr.UIContralType === UIContralType.HandWriting">
                    <img :src="GetImgSrc(column.attr, record[column.key])" onerror="this.style.dispaly='none'" :style="{ width: '100%', height: '32px' }" />
                  </template>
                  <template v-else-if="column.attr.MyDataType === DataType.AppBoolean">
                    {{ record[column.key] ? GetPara(column.attr.AtPara, 'checkedTips') || '是' : GetPara(column.attr.AtPara, 'unCheckedTips') || '否' }}
                  </template>
                  <template v-else>
                    {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                  </template>
                </template>
                <template v-if="column.key === 'Oper'">
                  <Button type="link" @click="EditOrViewRow(index)"><EditOutlined /></Button>
                  <Popconfirm
                    v-if="record.OID && record.OID !== 0 && isDelete"
                    :title="'确定要删除该行数据吗?'"
                    :ok-text="'确定'"
                    :cancel-text="'取消'"
                    @confirm="DeleteRow(index, record)"
                  >
                    <a href="#"><CloseCircleOutlined :style="{ color: 'red' }" /></a>
                  </Popconfirm>
                </template>
              </template>
              <template v-if="mapDtls.length != 0" #expandedRowRender="{ record }">
                <div v-for="dtl in mapDtls" :key="dtl.No">
                  <div v-if="clildDtls[record.OID][dtl.No]['data'].length === 0">{{ '暂无数据' }}</div>
                  <Table v-else :columns="clildDtls[record.OID][dtl.No]['column']" :data-source="clildDtls[record.OID][dtl.No]['data']" bordered size="small" :pagination="false">
                    <template #bodyCell="{ column, record }">
                      {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                    </template>
                  </Table>
                </div>
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
      :footer="true"
      :style="popModal.height"
      @ok="PopModalOK"
      @cancel="PopModalCancel"
    >
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
        :rowData="props.mainData"
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
    <Modal
      v-model:open="frmModal.visible"
      :title="frmModal.title"
      :width="frmModal.width"
      :bodyStyle="{
        padding: '0px 12px !important',
      }"
      :footer="null"
      :style="frmModal.height"
      :closable="false"
      :maskClosable="false"
    >
      <DtlFrm
        v-if="frmModal.visible === true && frmModal.modalType === 'dtlFrm'"
        ref="dtlFrm"
        :refOID="frmModal.refOID"
        :refPKVal="props.params.WorkID || props.params.RefNo || props.params.No"
        :mapDtl="mapDtl"
        :params="props.params"
        :mainData="props.mainData"
        :isReadonly="frmModal.isReadonly"
        @handlerClose="handlerClose"
      />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Button, Table, message, TableSummaryRow, TableSummaryCell, TypographyText, Popconfirm, Modal } from 'ant-design-vue';
  import { PlusOutlined, CloseCircleOutlined, CloseOutlined, EditOutlined, DownloadOutlined, UploadOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { computed, markRaw, reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapAttr } from '/#/entity';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import DtlImp from '/@/WF/CCForm/DtlImp.vue';
  import DtlImpSimple from '/@/WF/CCForm/DtlImpSimple.vue';
  import DtlTreeEns from '/@/WF/CCForm/DtlTreeEns.vue';
  import DtlFrm from '/@/WF/CCForm/DtlFrm.vue';
  import DtlBatchFrm from '/@/WF/CCForm/DtlBatchFrm.vue';
  import { FrmDtlBtnClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnClick';
  import { FrmDtlBtnRowClick } from '/@/DataUser/OverrideFiles/FrmDtlBtnRowClick';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { AtPara } from '/@/bp/da/AtPara';
  import { cloneDeep } from 'lodash-es';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { GetMapExtsGroup, MapAttrExt, useKeyOfEnType, userConvertData } from '/@/WF/CCForm/FrmEnd';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { aoaToSheetXlsx } from '/@/components/Excel';
  import { DataType } from '/@/bp/en/DataType';

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
  type Key = number;
  const loading = ref(false);
  const query = ref(props.params);
  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const tempData = ref(0);

  //从表属性信息
  const mapDtl = ref<Record<string, string>>({});
  const mapAttrs = ref<MapAttrExt[]>([]);
  const rowMapAttrs = ref<[MapAttr[]]>([[]]);
  const orginMapAttrs = ref<MapAttrExt[]>([]);
  //从表操作
  const isInsert = ref(true);
  const isDelete = ref(true);
  const isSave = ref(true);
  const isBatchUpdate = ref(false);
  const dtlParams = ref({});
  const tableSelectedRowKeys = ref<Key[]>([]); //选择的行数

  //孙表
  const clildDtls = ref<Record<string, any>>({});
  const mapDtls = ref<Record<string, string>[]>([]);
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
  const popKeys = ref<string[]>([]);
  const { isTextPop, isTextChoiceSearch } = useKeyOfEnType();
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
  const frmModal = reactive({
    visible: false,
    title: '',
    modalType: 'dtlImp',
    keyOfEn: '',
    width: 800,
    height: {},
    refOID: 0,
    isReadonly: false,
    params: {},
  });
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
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
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
  const { ConvertDataFromDB } = userConvertData();
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      console.log(props.mainData);
      //参数
      query.value = props.params;
      query.value.EnsName = props.dtlInfo['No'];
      query.value.FrmID = props.dtlInfo.FK_MapData;
      query.value.RefPKVal = props.params.WorkID || props.params.RefNo || props.params.No;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(query.value);
      const data = await handler.DoMethodReturnString('DtlCard_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
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
      const mapExts = GetMapExtsGroup(data['MapExts']);
      orginMapAttrs.value
        .filter((attr) => attr.UIVisible == 1)
        .forEach((mapAttr) => {
          mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
          if (isTextPop(mapAttr) || isTextChoiceSearch(mapAttr)) popKeys.value.push(mapAttr.KeyOfEn);
        });
      mapAttrs.value = orginMapAttrs.value.filter((attr) => attr.UIVisible == 1);

      columns.value = [];
      tableData.value = [];
      InitColumn();
      //增加操作按钮
      if (isInsert.value || isDelete.value || isSave.value)
        columns.value.push({
          title: '操作',
          key: 'Oper',
          width: 80,
          align: 'center',
          fixed: 'right',
        });
      //明细的集合
      const dtlData = data['DTDtls'];
      for (let i = 0; i < dtlData.length; i++) {
        let item = dtlData[i];
        item = cloneDeep(await ConvertDataFromDB(item, mapAttrs.value));
        dtlData[i] = item;
      }
      tableData.value = dtlData;
      //从表的从表的集合
      mapDtls.value = data['MapDtls'];
      for (const item of dtlData) {
        const dtl = {};
        for (const mapDtl of mapDtls.value) {
          const dtlAttrs: Record<string, any>[] = JSON.parse(JSON.stringify(data[mapDtl.No]));
          const childColumn: Record<string, any>[] = [];
          dtlAttrs
            .filter((attr) => attr.UIVisible == 1)
            .forEach((attr) => {
              childColumn.push({
                title: attr.Name,
                key: attr.KeyOfEn,
                align: 'center',
                width: attr.UIWidth,
              });
            });
          //获取当前从表的数据
          const hand = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          hand.AddPara('EnsName', mapDtl.No);
          hand.AddPara('RefPKVal', item.OID);
          const dtlDatas = await hand.DoMethodReturnString('DtlCard_Init_Dtl');
          const dtlData = dtlDatas['DTDtls'];
          dtl[mapDtl.No] = {};
          dtl[mapDtl.No]['column'] = childColumn;
          dtl[mapDtl.No]['data'] = dtlData;
        }
        clildDtls.value[item.OID] = dtl;
      }
      console.log(clildDtls.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  function handleResizeColumn(w, col) {
    col.width = w;
  }

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
    const column = ref<any[]>([]);
    column.value['title'] = attr.Name;
    column.value['key'] = attr.KeyOfEn;
    column.value['align'] = 'center'; //居中
    column.value['width'] = attr.UIWidth || 100;
    column.value['edit'] = attr.UIIsEnable && isSave.value == true && parseInt(mapDtl.value.EditModel) === 0; //是否可编辑
    column.value['attr'] = attr;
    column.value['className'] = column.value['edit'] == false || (attr.MyDataType == 1 && attr.TextModel == 1) ? 'my-handle' : '';
    column.value['resizable'] = true;
    column.value['ellipsis'] = true;
    column.value['customCell'] = (record, column) => {
      return record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key];
    };
    return column.value;
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
  InitPage();

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
  const dbClcik = (record, index) => {
    return {
      onDblclick: () => {
        EditOrViewRow(index);
      },
    };
  };
  /**
   * 行编辑，经典表单显示
   * @param rowIdx
   * @constructor
   */
  const EditOrViewRow = (rowIdx) => {
    frmModal.modalType = 'dtlFrm';
    frmModal.visible = true;
    frmModal.title = '新增/编辑';
    popModal.width = window.innerWidth * 0.8;
    frmModal.width = window.innerWidth * 0.8;
    frmModal.height = {
      height: impExt.value.H || window.innerHeight * 0.8 + 'px',
    };
    frmModal.isReadonly = isSave.value === true ? false : true;
    frmModal.refOID = tableData.value[rowIdx]['OID'];
  };
  const handlerClose = async () => {
    popModal.visible = false;
    frmModal.visible = false;
    await InitPage();
  };
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
      await InitPage();
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
  const dtlBatchFrm = shallowRef<InstanceType<typeof DtlBatchFrm>>();
  const dtlImpSimple = shallowRef<InstanceType<typeof DtlImpSimple>>();
  const dtlTreeEns = shallowRef<InstanceType<typeof DtlTreeEns>>();
  const selfComponent = shallowRef<InstanceType<typeof Component>>();
  const iframeRef = shallowRef<HTMLIFrameElement>();
  const PopModalOK = async () => {
    if (popModal.modalType === 'dtlImp') {
      const arrs = dtlImp.value.checkInfoList || [];
      cacheSelectedData.value = dtlImp.value.checkedList || [];
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
    if (popModal.modalType === 'dtlImpSimple') {
      const arrs = dtlImpSimple.value.checkInfoList || [];
      cacheSelectedData.value = dtlImpSimple.value.checkedList || [];
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
    tempData.value--;
    popModal.visible = false;
  };

  const PopModalCancel = async () => {
    tempData.value--;
    await InitPage();
  };
  const SaveAll = (isOnlySave) => {
    console.log(isOnlySave);
    return true;
  };
  /**
   * 导出从表信息
   * @constructor
   */
  const ExpDtl = () => {
    const header = mapAttrs.value.map((attr) => attr.Name);
    // 如何从前端获取Attrs？
    const data = tableData.value.map((item) => {
      return mapAttrs.value.map((attr) => {
        return item[attr.KeyOfEn + 'Text'] || item[attr.KeyOfEn + 'T'] || item[attr.KeyOfEn];
      });
    });
    aoaToSheetXlsx({ data, header, filename: mapDtl.value.Name + '.xlsx' });
    return;
  };
  /**
   * 导入从表信息
   * @constructor
   */
  /**
   * 导入从表信息
   * @constructor
   */
  const { getComponentParamsByUrl } = useComponentLoader();
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

  const CheckDtlNum = () => {
    if (parseInt(mapDtl.value.NumOfDtl) === 0) return true;
    if (parseInt(mapDtl.value.NumOfDtl) > tableData.value.length) {
      message.error(mapDtl.value.Name + '至少含有' + mapDtl.value.NumOfDtl + '条数据');
      return false;
    }
    return true;
  };
  defineExpose({ SaveAll, InitPage, CheckDtlNum });
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
