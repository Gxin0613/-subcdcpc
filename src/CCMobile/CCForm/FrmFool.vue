<template>
  <div class="content" :style="contentStyle" v-if="!isShowMsg" style="background-color: white">
    <template v-if="mapData?.MobileFrmShowType === 0 && isLoadComplete">
      <!--表格模式展示-->
      <div v-for="gf in gfs" :key="gf.OID">
        <div v-if="gf.CtrlType === 'Dtl' && gf.ShowType != 2" :key="componentKey">
          <template v-if="gf.dtl.MobileShowModel === 0">
            <div class="van-h5 flex-center">
              {{ gf['Name' + sysLang] || gf.Lab }}
              <div style="color: #666; font-size: 12px" @click="ToDtl(gf.dtl)"
                >{{ '进入从表' }}<i class="van-badge__wrapper van-icon van-icon-arrow van-cell__right-icon"></i>
              </div>
            </div>
          </template>
          <!--列表展示-->
          <template v-else>
            <DtlList
              :groupField="gf"
              :ref="'dtl' + gf.dtl.No"
              :dtl-info="gf.dtl"
              :params="props.params"
              :main-data="mainData"
              :is-readonly="props.fieldIsReadonly || props.isReadonly"
              :key="componentKey"
            />
          </template>
        </div>
        <template v-else>
          <div class="van-h5" v-if="gf.ShowType != 2">
            <span v-if="gf.CtrlType === 'FWC'" class="flex-center">
              {{ gf['Name' + sysLang] || gf.Lab }}
              <div>
                <i class="icon-film" @click="changeTrack"></i>
                <i class="icon-notebook" @click="changeNormal" style="margin: 0 10px"></i>
                <i class="icon-compass" @click="changeTimeTrack"></i>
              </div>
            </span>
            <span v-else class="flex-center">
              {{ gf['Name' + sysLang] || gf.Lab }}
              <div @click="gf.fold = !gf.fold">
                <MenuUnfoldOutlined v-if="gf.fold" />
                <UpOutlined v-else />
              </div>
            </span>
          </div>
        </template>
        <MapAttrForm
          v-if="gf.CtrlType === null || gf.CtrlType === ''"
          :style="({
            display: gf.fold ? 'none' : '',
          } as StyleValue)"
          :refPKVal="props.params.WorkID"
          :map-attrs="GetMapAttrsByGroupID(gf.OID)"
          :frmData="props.frmData"
          :mainData="mainData"
          :checkField="checkField"
          :fwcVer="fwcVer"
          :params="props.params"
          ref="basicData"
          :is-readonly="props.fieldIsReadonly || props.isReadonly"
          :is-page-readonly="props.isReadonly"
          :key="componentKey"
          :WGFrm="entityFrm"
          :isPreview="props.isPreview"
        />
        <div
          v-if="gf.CtrlType === 'Ath' && gf.ShowType != 2"
          :style="{
            display: gf.fold ? 'none' : '',
          }"
        >
          <template v-if="parseInt(gf.ath?.IsUpload) === 0 || props.fieldIsReadonly || props.isReadonly">
            <div style="width: 100%; border-radius: 2px">
              <AthView :ath-info="gf.ath" :params="props.params" :PKValue="props.params.WorkID" />
            </div>
          </template>
          <template v-else>
            <Ath :ref="'ath' + gf.ath.MyPK" :ath-info="gf.ath" :params="props.params" :is-readonly="props.fieldIsReadonly || props.isReadonly" :key="componentKey" />
          </template>
        </div>

        <WorkCheck
          v-if="gf.CtrlType === 'FWC'"
          ref="workCheck"
          :params="props.params"
          :nodeInfo="nodeInfo"
          :is-readonly="props.isReadonly"
          :examineMode="examineMode"
          :frmData="props.frmData"
        />
        <SubFlow v-if="gf.CtrlType === 'SubFlow'" ref="subFlow" :params="props.params" :nodeInfo="nodeInfo" :is-readonly="props.isReadonly" />
      </div>
    </template>
    <template v-if="mapData?.MobileFrmShowType !== 0 && isLoadComplete">
      <Tabs>
        <!--包含分组的情况-->
        <Tab v-for="gf in gfs" :key="gf.OID" :title="gf['Name' + sysLang] || gf.Lab">
          <MapAttrForm
            :refPKVal="props.params.WorkID"
            v-if="gf.CtrlType === null || gf.CtrlType === ''"
            :map-attrs="GetMapAttrsByGroupID(gf.OID)"
            :frmData="props.frmData"
            :mainData="mainData"
            :checkField="checkField"
            :fwcVer="fwcVer"
            :params="props.params"
            :is-readonly="props.fieldIsReadonly"
            :WGFrm="entityFrm"
            ref="TabbasicData"
            :isPreview="props.isPreview"
          />
          <!-- <Ath v-if="gf.CtrlType === 'Ath'" :ref="'ath' + gf.ath.MyPK" :ath-info="gf.ath" :params="props.params" :is-readonly="props.fieldIsReadonly" /> -->
          <template v-if="gf.CtrlType === 'Ath'">
            <template v-if="props.fieldIsReadonly">
              <div style="width: 100%; border-radius: 2px">
                <AthView :ath-info="gf.ath" :params="props.params" :PKValue="props.params.WorkID" />
              </div>
            </template>
            <template v-else>
              <Ath :ref="'ath' + gf.ath.MyPK" :ath-info="gf.ath" :params="props.params" :is-readonly="props.fieldIsReadonly" :key="componentKey" />
            </template>
          </template>
          <template v-if="gf.CtrlType === 'Dtl'">
            <Dtl
              v-if="gf.dtl.MobileShowModel === 0"
              :dtl-info="gf.dtl"
              :main-data="mainData"
              :params="props.params"
              :is-readonly="props.fieldIsReadonly"
              :isPreview="props.isPreview"
            />
            <!--列表展示-->
            <DtlList
              v-else
              :groupField="gf"
              :ref="'dtl' + gf.dtl.No"
              :dtl-info="gf.dtl"
              :params="props.params"
              :main-data="mainData"
              :is-readonly="props.fieldIsReadonly || props.isReadonly"
              :key="componentKey"
            />
          </template>
          <WorkCheck
            v-if="gf.CtrlType === 'FWC'"
            ref="tabWorkCheck"
            :nodeInfo="nodeInfo"
            :params="props.params"
            :is-readonly="props.isReadonly"
            :examineMode="examineMode"
            :frmData="props.frmData"
          />
          <SubFlow v-if="gf.CtrlType === 'SubFlow'" ref="tabSubFlow" :params="props.params" :nodeInfo="nodeInfo" :is-readonly="props.isReadonly" />
        </Tab>
      </Tabs>
    </template>
    <Popup v-model:show="popupModal.visible" position="right" :style="{ width: '100%', height: '100%' }">
      <Dtl
        v-if="popupModal.visible && popupModal.modal === 'Dtl'"
        :params="popupModal.params"
        @ClosePoup="ClosePoup"
        @UpdateMainData="(keyOfEn, val) => UpdateMainData(keyOfEn, val)"
        :isPreview="props.isPreview"
      />
      <DtlCard
        v-if="popupModal.visible && popupModal.modal === 'DtlCard'"
        :params="popupModal.params"
        @ClosePoup="ClosePoup"
        @UpdateMainData="(keyOfEn, val) => UpdateMainData(keyOfEn, val)"
        :isPreview="props.isPreview"
      />
    </Popup>
    <Popup v-model:show="ShowFailToast.visible" round closeable :style="{ padding: '64px' }">
      <p>{{ ShowFailToast.msg }}</p>
    </Popup>
    <div class="safe-area-bottom"> </div>
  </div>
</template>
<script lang="ts" setup>
  import { Tabs, Tab, Popup } from 'vant';
  import { UpOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
  import { computed, defineAsyncComponent, getCurrentInstance, onMounted, onUnmounted, provide, reactive, ref, ShallowRef, shallowRef, StyleValue } from 'vue';
  import { FrmAttachment, GroupField, MapData, MapDtl } from '/#/entity';
  import MapAttrForm from './MapAttrForm.vue';
  import DtlList from './DtlList.vue';
  import SubFlow from '../WorkOpt/SubFlow.vue';
  import { DealExp, GetPara, mobileNavbarVisible } from '/@/utils/gener/StringUtils';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { MapAttrExt, GetMapExtsGroup, userConvertData, ddlInfo } from '/@/WF/CCForm/FrmEnd';
  import { DataType } from '/@/bp/en/DataType';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useRouter } from 'vue-router';
  import { AtPara } from '/@/bp/da/AtPara';
  import Event from '/@/utils/Events';
  import { NodeWorkCheck } from '/@/WF/Admin/AttrNode/NodeWorkCheck';
  // import Icon from '/@/components/Icon';
  import AthView from '/@/CCMobile/CCForm/AthView.vue';
  import { getmark } from '/@/utils/gener/watermark';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { FrmAttachmentExts } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentExt';
  import { cloneDeep } from 'lodash-es';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { FrmBodyLoadAfter } from '/@/DataUser/OverrideFiles/FrmBodyLoadAfter';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import { ClassFactoryOfWaiGuaFlow } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaFlow';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { message } from 'ant-design-vue';
  import { MapDtls } from '/@/WF/Admin/FrmLogic/MapDtl';
  import WebUser from '/@/bp/web/WebUser';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NodeFormType } from '/@/WF/Admin/EnumLab';
  const { t } = useI18n();
  //判断钉钉是否开启
  const contentStyle = computed(() => {
    return {
      paddingTop: mobileNavbarVisible() ? '48px' : '0',
    };
  });
  //异步引入组件
  const Ath = defineAsyncComponent(() => import('./Ath.vue'));
  const Dtl = defineAsyncComponent(() => import('./Dtl.vue'));
  const DtlCard = defineAsyncComponent(() => import('./DtlCard.vue'));
  //const DtlRpt = defineAsyncComponent(() => import('./DtlRpt.vue'));
  const WorkCheck = defineAsyncComponent(() => import('/@/CCMobile/WorkOpt/WorkCheck.vue'));
  //const SubFlow = defineAsyncComponent(() => import('../WorkOpt/SubFlow.vue'));
  // 父组件传过来的属性
  const props = defineProps({
    frmData: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
    fieldIsReadonly: {
      type: Boolean,
      default: false,
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isSave: {
      type: Boolean,
      default: false,
    },
    pageFrom: {
      type: String,
      default: 'FoolFrm',
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  });
  const WF_GenerWorkFlow = ref(props.frmData.WF_GenerWorkFlow);

  interface GroupFieldExt extends GroupField {
    dtl: MapDtl;
    ath: FrmAttachment;
    fold: boolean;
  }
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const sysLang = WebUser.SysLang || 'CH';
  const router = useRouter();
  const loading = ref(false);
  const instance = getCurrentInstance();
  const gfs = ref<Array<GroupFieldExt>>([]); //分组
  const mapAttrs = ref<Array<MapAttrExt>>([]); //字段集合
  const aths = ref<Array<FrmAttachment>>([]); //附件集合
  const dtls = ref<Array<MapDtl>>([]); //从表集合
  const mapData = ref<MapData>(); //表单属性
  const mainData = ref<Record<string, any>>({}); //表单数据集合
  const origData = ref<Record<string, any>>({});
  const componentKey = ref(0);

  //表单的列数，标签位置(左边，顶部)，标签对齐方式(靠左，靠右）
  const isHaveEditWorkCheck = ref(false); //是否启用了审核组件(可编辑)
  const isHaveSignCheck = ref(false); //是否存在签批字段
  const checkField = ref(''); // 签批字段
  const fwcVer = ref(0);
  const nodeInfo = props.frmData.WF_Node != undefined ? props.frmData.WF_Node[0] : null;
  const isShowMsg = ref(false);

  //显示错误信息
  const ShowFailToast = reactive({
    visible: false,
    msg: '',
  });

  //审核组件模式
  const examineMode = ref('');
  const isLoadComplete = ref(false);
  const { watermark } = getmark();
  const WorkCheckMode = async () => {
    const NodeID = props.params.NodeID;
    const en = new NodeWorkCheck(NodeID);
    await en.RetrieveFromDBSources();
    console.log(en);
    switch (en.FWCShowModel) {
      case 0:
        examineMode.value = 'normalMode';
        break;
      case 1:
        examineMode.value = 'trackMode';
        break;
      case 2:
        examineMode.value = 'trackTimeMode';
        break;
      default:
        examineMode.value = 'normalMode';
        break;
    }
  };

  const changeTrack = () => {
    examineMode.value = 'trackMode';
  };
  const changeNormal = () => {
    examineMode.value = 'normalMode';
  };
  const changeTimeTrack = () => {
    examineMode.value = 'trackTimeMode';
  };
  let waterMarkText = '';
  const generateWatermark = () => {
    let mapExts = props.frmData.Sys_MapExt || [];
    mapExts = mapExts.filter((mapExt) => {
      return mapExt.ExtModel === 'FrmBodySecret';
    });
    if (mapExts.length != 0) {
      waterMarkText = mapExts[0].Tag1;
      if (waterMarkText.includes('@') == true) waterMarkText = DealExp(waterMarkText, mainData.value);
      if (!!waterMarkText) watermark(waterMarkText);
    }
  };
  /**
   * 解析审核组件
   * @param gf
   * @param frmNode
   */
  const parseFWC = (gf, frmNode) => {
    if (nodeInfo != null && nodeInfo.FWCSta != 0 && !!props.params.WorkID) {
      fwcVer.value = nodeInfo.FWCVer;
      //判断当前节点是否有签批字段
      const list = mapAttrs.value.filter((item) => item.UIContralType == UIContralType.SignCheck);
      //节点启用/只读了审核组件
      if (frmNode != null && frmNode.MyPK != '' && nodeInfo.FormType == NodeFormType.SheetTree) {
        if (frmNode.IsEnableFWC != 0) {
          //存在签批字段
          if (list.length > 0) {
            if ((nodeInfo.FWCSta == 1 && nodeInfo.CheckField != '') || nodeInfo.FWCSta == 2) {
              isHaveSignCheck.value = true;
              checkField.value = nodeInfo.CheckField;
            } else {
              gfs.value.push(gf);
            }
          } else {
            gfs.value.push(gf);
          }
          if (nodeInfo.FWCSta == 1) isHaveEditWorkCheck.value = true;
        }
      } else {
        if (list.length > 0) {
          if ((nodeInfo.FWCSta == 1 && nodeInfo.CheckField != '') || nodeInfo.FWCSta == 2) {
            isHaveSignCheck.value = true;
            checkField.value = nodeInfo.CheckField;
          } else {
            gfs.value.push(gf);
          }
        } else {
          gfs.value.push(gf);
        }
        if (nodeInfo.FWCSta == 1) isHaveEditWorkCheck.value = true;
      }
      WorkCheckMode();
    }
  };
  const entityFrm = ref<WaiGuaBaseFrm>(null);
  const parentName = instance?.parent?.parent?.type.__name || '';
  //初始化页面
  const InitPage = async () => {
    try {
      isLoadComplete.value = false;
      loading.value = true;
      gfs.value = [];
      //获取表单的分组
      const sysGroupField = props.frmData.Sys_GroupField as Array<GroupFieldExt>;
      mapAttrs.value = cloneDeep(props.frmData.Sys_MapAttr as Array<MapAttrExt>);
      aths.value = (props.frmData.Sys_FrmAttachment as Array<FrmAttachment>) || [];
      dtls.value = (props.frmData.Sys_MapDtl as Array<MapDtl>) || [];
      mapData.value = props.frmData.Sys_MapData[0] as MapData;
      mainData.value = props.frmData.MainTable[0] || {};

      const mapExts = GetMapExtsGroup(props.frmData.Sys_MapExt);
      const frmNode = props.frmData.WF_FrmNode != undefined ? props.frmData.WF_FrmNode[0] : null;
      let athSlns: any[] = [];
      if (!!frmNode && !!frmNode.FK_Frm && !!frmNode.FK_Node) {
        const athments = new FrmAttachmentExts();
        await athments.Retrieve('FK_MapData', frmNode.FK_Frm, 'FK_Node', frmNode.FK_Node);
        athSlns = athments;
        aths.value.forEach((ath) => {
          const arrs = athments.filter((en) => en.MyPK == ath.MyPK + '_' + frmNode.FK_Node);
          if (arrs.length > 0) {
            const obj = Object.fromEntries(arrs[0].Row);
            for (const key in obj) {
              if (key != 'MyPK') {
                ath[key] = obj[key];
              }
            }
          }
        });
        //获取从表的属性
        const ens = new MapDtls();
        await ens.Retrieve('FK_MapData', frmNode.FK_Frm, 'FK_Node', frmNode.FK_Node);
        dtls.value.forEach((dtl) => {
          const arrs = ens.filter((en) => en.No == dtl.No + '_' + frmNode.FK_Node);
          if (arrs.length > 0) {
            const obj = Object.fromEntries(arrs[0].Row);
            for (const key in obj) {
              if (key != 'No') {
                dtl[key] = obj[key];
              }
            }
          }
        });
      }
      let isHaveSubFlow = false;
      let isHaveFWC = false;
      //处理分组信息
      for (const gf of sysGroupField) {
        gf.fold = parseInt(gf.IsZDMobile) === 1 ? true : false;
        //ShowType===2 隐藏
        //if (gf.ShowType != 2) {
        if (gf.CtrlType === 'Dir') {
          gfs.value.push(gf);
          continue;
        }
        if (gf.CtrlType === null || gf.CtrlType === '') gfs.value.push(gf);
        //从表处理
        if (gf.CtrlType === 'Dtl') {
          const dtls = GetDtlsByGroupCtrlID(gf.CtrlID);
          if (dtls.length > 0) {
            gf.dtl = dtls[0];
            gfs.value.push(gf);
          }
        }
        //附件的处理
        if (gf.CtrlType === 'Ath') {
          const aths = GetAthsByGroupCtrlID(gf.CtrlID);
          if (aths.length > 0) {
            gf.ath = aths[0];
            if (parseInt(gf.ath.IsVisable) === 1) gfs.value.push(gf);
          }
        }
        if (gf.CtrlType === 'SubFlow' && !!nodeInfo?.SFSta && nodeInfo?.SFSta != 0) {
          gfs.value.push(gf);
          isHaveSubFlow = true;
        }
        //审核组件
        if (gf.CtrlType === 'FWC' && nodeInfo != null && nodeInfo.FWCSta != 0 && !!props.params.WorkID) {
          isHaveFWC = true;
          parseFWC(gf, frmNode);
        }
      }
      if (isHaveSubFlow == false) {
        if (nodeInfo?.SFSta && nodeInfo?.SFSta != 0) {
          const gf: GroupFieldExt = cloneDeep(sysGroupField[0]);
          gf.Lab = '父子流程组件';
          gf.CtrlType = 'SubFlow';
          gfs.value.push(gf);
        }
      }
      if (isHaveFWC == false) {
        const gf: GroupFieldExt = cloneDeep(sysGroupField[0]);
        gf.Lab = '审核';
        gf.CtrlType = 'FWC';
        parseFWC(gf, frmNode);
      }
      //处理字段的下拉框
      for (const mapAttr of mapAttrs.value) {
        mapAttr['rules'] = [];
        if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
          mapAttr['ddl'] = GetDDLOption(mapAttr as any);
          if (mapAttr.LGType === FieldTypeS.Enum) {
            mainData.value[mapAttr.KeyOfEn + 'T'] = mainData.value[mapAttr.KeyOfEn + 'Text'];
            if (mapAttr.UIContralType === UIContralType.CheckBok) mapAttr['mode'] = 'multiple';
          } else if (typeof mainData.value[mapAttr.KeyOfEn] === 'string' && !mainData.value[mapAttr.KeyOfEn]) {
            /*mainData.value[mapAttr.KeyOfEn] = mapAttr['ddl'][0]?.value;
            mainData.value[mapAttr.KeyOfEn + 'T'] = mapAttr['ddl'][0]?.text;
            mainData.value[mapAttr.KeyOfEn + 'Text'] = mainData.value[mapAttr.KeyOfEn + 'T'];*/
          } else {
            const d = mapAttr['ddl'].filter((item) => item.value.toString() === mainData.value[mapAttr.KeyOfEn].toString());
            //解決tree结构数据过滤不到数据的情况
            const oldData = mainData.value[mapAttr.KeyOfEn + 'T'];

            mainData.value[mapAttr.KeyOfEn + 'T'] = d.length != 0 ? d[0].text : '';
            if (oldData) {
              mainData.value[mapAttr.KeyOfEn + 'T'] = oldData;
            }
            mainData.value[mapAttr.KeyOfEn + 'Text'] = mainData.value[mapAttr.KeyOfEn + 'T'];
          }
          console.log(mapAttr.ddl);
        }
        //日期、日期时间类型
        if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
          const formatType = GetDateTimeOption(mapAttr as any);
          mapAttr['dateType'] = formatType[0];
          mapAttr['columnsType'] = formatType[1];
          mapAttr['format'] = formatType[2] as string;

          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', type: 'object' }];
        } else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
          mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
        } else {
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
        }

        //字段附件，获取对应的附件信息
        if (mapAttr.UIContralType === UIContralType.AthShow) {
          const result = aths.value.filter((ath) => ath.MyPK === mapAttr.MyPK);
          if (result.length == 0) {
            mapAttr.ath = null;
            mainData.value[mapAttr.KeyOfEn] = '附件信息丢失,请联系管理员';
          }
          mapAttr.ath = result[0];
          if (athSlns.length != 0) {
            const result1 = athSlns.filter((ath) => ath.MyPK === mapAttr.MyPK + '_' + ath.FK_Node);
            if (result1.length != 0) {
              const ath = result1[0];
              ath.MyPK = mapAttr.ath['MyPK'];
              mapAttr.ath = ath;
            }
          }
        }
        //评分
        if (mapAttr.UIContralType === UIContralType.Score) {
          if (mainData.value[mapAttr.KeyOfEn] == '') mainData.value[mapAttr.KeyOfEn] = 0;
          mapAttr.Tag2 = mapAttr.Tag2 || '5';
        }
        mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;

        //mapExt的集合
        mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];

        //含有正则表达式
        mapAttr.mapExts
          .filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'RegularExpression')
          .forEach((mapExt) => {
            mapAttr['rules'].push({
              pattern: new RegExp(mapExt.Doc),
              message: mapExt.Tag2,
              trigger: mapExt.Tag,
            });
          });

        //后置说明
        mapAttr.suffix = GetPara(mapAttr.AtPara, 'suffix') || '';
        //是否设置后置枚举
        const exts = mapAttr.mapExts.filter((mapExt) => mapExt.ExtModel === 'EndLabEnum' && mapExt.DoWay === '1');
        if (exts.length > 0) {
          if (!!exts[0].Doc) {
            const keyOfEn = 'AP_' + mapAttr.KeyOfEn;
            mapAttr.suffix = exts[0].Doc;

            mapAttr['sufOptions'] = exts[0].Doc.replace(/，/g, ',')
              .split(',')
              .map((item) => {
                return {
                  value: item,
                  text: item,
                };
              });
            mainData.value[keyOfEn] = GetPara(mainData.value.AtPara, keyOfEn) || mapAttr['sufOptions'][0].value;
          }
        }
      }
      mainData.value = await ConvertDataFromDB(mainData.value, mapAttrs.value as any);
      origData.value = mainData.value;
      //判断是否启用了联动其他控件的功能
      const cmapExts = props.frmData.Sys_MapExt.filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
      cmapExts.forEach((mapExt) => {
        //判断当前枚举字段是否隐藏，隐藏后不联动其他控件
        if (mapAttrs.value.find((attr) => attr.KeyOfEn === mapExt.AttrOfOper && parseInt(attr.UIVisible) === 1) != null) {
          if (Array.isArray(mainData.value[mapExt.AttrOfOper])) {
            mainData.value[mapExt.AttrOfOper].forEach((item) => {
              SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item, true);
            });
          } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, mainData.value[mapExt.AttrOfOper], true);
        }
      });
      let enName = 'WGFlow_' + (props.params.FK_Flow || props.params.FlowNo);
      let entity = await ClassFactoryOfWaiGuaFlow.GetEn(enName as string);
      if (entity == null) {
        enName = 'WGEntity_' + mapData.value.No;
        entity = await ClassFactoryOfWaiGuaEntity.GetEn(enName as string);
        if (entity != null) {
          entity.WorkID = props.params.WorkID || props.params.RefPKVal;
          entity.EnityID = mapData.value.No;
          entity.FrmID = mapData.value.No;
          entity.OID = props.params.WorkID || props.params.RefPKVal;
          entity.FrmBodyJson = mainData.value;
          entity.MapAttrs = mapAttrs.value;
          entityFrm.value = entity;
        }
      } else {
        entity.WorkID = props.params.WorkID;
        entity.EnityID = mapData.value.No;
        entity.FrmID = mapData.value.No;
        entity.OID = props.params.WorkID;
        entity.FrmBodyJson = mainData.value;
        entity.MapAttrs = mapAttrs.value;
        entityFrm.value = entity;
      }
      generateWatermark();
      isLoadComplete.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
      isLoadComplete.value = true;
      if (entityFrm.value != null) await entityFrm.value.FrmLoadAfter();
    }
  };
  //弹窗显示
  const popupModal = reactive({
    visible: false,
    params: {},
    modal: 'Dtl',
  });
  let openDtls: string[] = [];
  /**
   * 跳转到从表
   * @param dtl
   * @constructor
   */
  const ToDtl = async (dtl) => {
    //if (props.params.WorkID == 0) return;
    //跳转前先保存
    await Save();
    const params = {
      EnsName: dtl.No,
      MapDtlNo: dtl.No,
      IsReadonly: props.isReadonly || props.fieldIsReadonly == true ? 1 : 0,
      FrmID: dtl.FK_MapData,
      RefPKVal: props.params.WorkID || props.params.No || props.params.RefNo,
      FK_Node: props.params.FK_Node,
      WorkID: props.params.WorkID,
      PWorkID: props.params.PWorkID,
      FK_Flow: props.params.FK_Flow,
      IsSinglePages: props.params.IsSinglePages || '1',
    };
    if (dtl.ListShowModel == 0) popupModal.modal = 'Dtl';
    if (dtl.ListShowModel === 1 || dtl.EditModel === 1) popupModal.modal = 'DtlCard';

    popupModal.visible = true;
    popupModal.params = params;
    return;

    /* openDtls.push(dtl.No);
    let str = '';
    for (const key in params) str += key + '=' + params[key] + '&';
    if (!!str) str = str.substring(0, str.length - 1);
    router.push('/CCMobile/CCForm/Dtl?' + str);*/
  };
  /**
   * 修改主表字段的数据
   * @param keyOfEn
   * @param val
   * @constructor
   */
  const UpdateMainData = (keyOfEn, val) => {
    mainData.value[keyOfEn] = val;
  };
  /**
   * 关闭从表的弹窗
   * @constructor
   */
  const ClosePoup = () => {
    popupModal.visible = false;
    //await InitPage();
  };

  const { ConvertDataToDB, ConvertDataFromDB } = userConvertData();
  /**
   * 获取分组下的字段集合
   * @param groupOID 分组OID
   * @constructor
   */
  const GetMapAttrsByGroupID = (groupOID: number) => {
    if (!groupOID) return mapAttrs.value.filter((attr) => !!attr.UIVisible);
    const curAttrs = mapAttrs.value.filter((attr) => attr.UIVisible && parseInt(attr.GroupID) === parseInt(groupOID));
    if (curAttrs.length == 0) {
      gfs.value.forEach((gf) => {
        if (gf.OID == groupOID) gf.ShowType = 2;
      });
    }
    if (curAttrs.length > 0) {
      gfs.value.forEach((gf) => {
        if (gf.OID == groupOID) gf.ShowType = 0;
      });
    }
    console.log('asd');
    console.log(curAttrs);
    return curAttrs;
  };
  /**
   * 获取分组下的附件信息
   * @param groupCtrlID 附件对应的MyPK
   * @constructor
   */
  const GetAthsByGroupCtrlID = (groupCtrlID: string) => {
    if (groupCtrlID == '' || aths.value.length == 0) return [];
    return aths.value.filter((ath) => ath.MyPK === groupCtrlID && ath.IsVisable != '0' && ath.NoOfObj != 'FrmWorkCheck');
  };
  /**
   * 获取分组下的从表信息
   * @param groupCtrlID 从表对应的No
   * @constructor
   */
  const GetDtlsByGroupCtrlID = (groupCtrlID: string) => {
    if (groupCtrlID == '' || dtls.value.length == 0) return [];
    return dtls.value.filter((dtl) => dtl.No === groupCtrlID && parseInt(dtl.IsView) == 1);
  };

  const basicData = shallowRef<Array<InstanceType<typeof MapAttrForm>> | InstanceType<typeof MapAttrForm>>();
  const TabbasicData = shallowRef<Array<InstanceType<typeof MapAttrForm>> | InstanceType<typeof MapAttrForm>>();
  const tabWorkCheck = shallowRef<InstanceType<typeof WorkCheck>>();
  const workCheck = shallowRef<InstanceType<typeof WorkCheck>>();
  const VerifyFormData = async (isOnlySave = false) => {
    if (isOnlySave == false) {
      let attrFormList: Array<InstanceType<typeof MapAttrForm>> | InstanceType<typeof MapAttrForm> | undefined = [];
      if (mapData.value?.FrmShowType === 0) {
        attrFormList = basicData.value;
      } else {
        attrFormList = TabbasicData.value;
      }
      const errs = [];
      if (Array.isArray(attrFormList)) {
        for (const attrForm of attrFormList) {
          const err = await attrForm?.validateForm();
          if (!!err) {
            errs.push(err);
          }
        }
      }
      if (!attrFormList || errs.length > 0) return null;
    }
    //更改数据字段值的类型
    let rowData: any = {};
    const attrGroupRefs = basicData.value || TabbasicData.value;
    let _firstRow = true;
    if (Array.isArray(attrGroupRefs)) {
      for (const attrGroupRef of attrGroupRefs) {
        const _tempRow = attrGroupRef?.mainData || {};
        const _innerAttrs = attrGroupRef.innerAttrs;
        let _newRow = {};
        if (_firstRow) {
          rowData = _tempRow;
          _firstRow = false;
          continue;
        }
        for (const _attr of _innerAttrs) {
          _newRow[_attr.KeyOfEn] = _tempRow[_attr.KeyOfEn];
        }
        rowData = { ...rowData, ..._newRow };
      }
    }
    if (attrGroupRefs && !Array.isArray(attrGroupRefs)) {
      rowData = attrGroupRefs.mainData;
    }
    const resultData = await ConvertDataToDB(rowData, mapAttrs.value as any);
    let result = true;
    let msg = '';
    //校验主表数字类型填写规范
    for (const mapAttr of mapAttrs.value) {
      const fieldValue = resultData[mapAttr.KeyOfEn];
      if (mapAttr.MyDataType == DataType.AppMoney || mapAttr.MyDataType == DataType.AppFloat || mapAttr.MyDataType == DataType.AppInt) {
        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
          const isValidNumber = /^[+-]?\d*(\.\d+)?$/.test(resultData[mapAttr.KeyOfEn]);
          if (!isValidNumber) {
            msg += '字段[' + mapAttr.Name + ']输入数字类型' + '\t\n';
          }
        }
        let num = GetPara(mapAttr.AtPara, 'NumMax');
        if (!!num && resultData[mapAttr.KeyOfEn] > parseFloat(num)) {
          msg += '字段[' + mapAttr.Name + ']值不能大于值[' + num + ']';
        }
        num = GetPara(mapAttr.AtPara, 'NumMin');
        if (!!num && resultData[mapAttr.KeyOfEn] < parseFloat(num)) {
          msg += '字段[' + mapAttr.Name + ']值不能小于值[' + num + ']';
        }
      }
    }
    //校验文本字段的输入长度是否超出数据库设置的长度
    mapAttrs.value
      .filter((mapAttr) => mapAttr.MyDataType === DataType.AppString)
      .forEach((mapAttr) => {
        if (resultData[mapAttr.KeyOfEn] != null && resultData[mapAttr.KeyOfEn] != '' && resultData[mapAttr.KeyOfEn].length > mapAttr.MaxLen)
          msg += '字段' + mapAttr.Name + '输入字段的长度不能超过' + mapAttr.MaxLen + '\t\n';
      });
    if (msg != '') {
      ShowFailToast.visible = true;
      ShowFailToast.msg = msg;
      return null;
    }

    let failedKeys: Recordable[] = [];
    //校验必填,只有发送的时候校验必填
    if (isOnlySave == false) {
      mapAttrs.value
        .filter((mapAttr) => mapAttr.UIIsInput === 1)
        .forEach((mapAttr) => {
          if (mapAttr.LGType === FieldTypeS.Enum) {
            if (mapAttr.UIContralType == UIContralType.CheckBok) {
              if (!resultData[mapAttr.KeyOfEn] || resultData[mapAttr.KeyOfEn] === '-1') {
                msg +=
                  '字段' +
                  mapAttr.Name +
                  `值不能为空,	
`;
                failedKeys.push(mapAttr);
              }
            } else if (resultData[mapAttr.KeyOfEn] === -1) {
              msg +=
                '字段' +
                mapAttr.Name +
                `值不能为空,	
`;
              failedKeys.push(mapAttr);
            }
          } else if (resultData[mapAttr.KeyOfEn] === null || resultData[mapAttr.KeyOfEn] === '') {
            msg +=
              '字段' +
              mapAttr.Name +
              `值不能为空,	
`;
            failedKeys.push(mapAttr);
          }
        });
      if (msg != '') {
        if (failedKeys.length > 0) {
          console.log({ failedKeys });
        }
        ShowFailToast.visible = true;
        ShowFailToast.msg = msg;
        return null;
      }
      let resultM = '';
      //校验正则
      for (const mapAttr of mapAttrs.value.filter((mapAttr) => mapAttr.UIIsEnable === 1 && !!mapAttr['rules'] && mapAttr['rules'].length > 0)) {
        for (const mapRule of mapAttr['rules']) {
          if (!mapRule.pattern) continue;
          let r = new RegExp(mapRule.pattern, 'g').test(resultData[mapAttr.KeyOfEn]);
          if (r == false) resultM += '字段' + mapAttr.Name + ':' + mapRule.message;
        }
      }
      if (resultM != '') {
        ShowFailToast.visible = true;
        ShowFailToast.msg = resultM;
        return null;
      }

      // 检查字段附件
      const athFieldList = mapAttrs.value.filter((attr) => attr.UIContralType == 6);
      for (const athField of athFieldList) {
        const rowKey = athField.KeyOfEn;
        const athNum = rowData?.[rowKey];
        const minUploadCount = (athField?.ath as Recordable)?.NumOfUpload || 0;
        const maxUploadCount = (athField?.ath as Recordable)?.TopNumOfUpload || 0;
        const uploadFileNumCheck = (athField?.ath as Recordable)?.UploadFileNumCheck || 0;
        if (uploadFileNumCheck == 1 && athNum == 0) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = (athField?.ath as Recordable)?.Name + '上传的附件数量不能为空，请上传附件';
          return false;
        }

        if (minUploadCount > 0 && athNum == 0) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = `字段附件 [${athField.Name}] 必须要上传文件`;
          return null;
        }
        if (athNum < minUploadCount) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = `字段附件[${athField.Name}] 上传附件数小于最小数量 ${minUploadCount}`;
          return null;
        }
        if (athNum > maxUploadCount) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = `字段附件[${athField.Name}] 上传附件数大于最大数量 ${minUploadCount}`;
          return null;
        }
      }
    }

    //保存审核组件
    if (isHaveEditWorkCheck.value == true) {
      if (isHaveSignCheck.value == true) {
        if (basicData.value != undefined) {
          if (Array.isArray(basicData.value)) result = await basicData.value[0].WorkCheckSave(isOnlySave);
          else result = await basicData.value.WorkCheckSave(isOnlySave);
        } else if (TabbasicData.value != undefined) {
          if (Array.isArray(TabbasicData.value)) result = await TabbasicData.value[0].WorkCheckSave(isOnlySave);
          else result = await TabbasicData.value.WorkCheckSave(isOnlySave);
        }
      } else {
        if (workCheck.value == undefined && typeof tabWorkCheck.value?.WorkCheckSave == 'function') result = await tabWorkCheck.value.WorkCheckSave(isOnlySave);
        else {
          if (Array.isArray(workCheck.value)) result = await workCheck.value[0].WorkCheckSave(isOnlySave);
          else result = await workCheck.value?.WorkCheckSave(isOnlySave);
        }
      }
    }

    if (result == false) {
      return null;
    }
    //校验附件
    if (aths.value.length > 0) {
      for (const ath of aths.value) {
        let refAth = instance?.refs['ath' + ath.MyPK];
        if (!!refAth && Array.isArray(refAth)) refAth = refAth[0];
        if (!!refAth) {
          const data = refAth.CheckAth(athInputUpload.includes(ath.MyPK + ','));
          if (!data) return null;
        }
      }
    }
    //校验从表最小值
    msg = '';
    if (isOnlySave == false) {
      for (const gf of gfs.value) {
        if (gf.CtrlType === 'Dtl') {
          if (gf.dtl.MobileShowModel != 0) {
            let refDtl = instance?.refs['dtl' + gf.dtl.No] as InstanceType<typeof Dtl>;
            if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
            if (!!refDtl) {
              let data = await refDtl?.SaveAll?.(isOnlySave);
              if (data == true && isOnlySave == false && (gf.dtl.ListShowModel === 0 || gf.dtl.ListShowModel === 1)) data = await refDtl?.CheckDtlNum?.();
              if (data === false) result = data;
            }
            continue;
          }
          if (gf.dtl.NumOfDtl != 0 && openDtls.includes(gf.dtl.No) == false) {
            //判断从表值
            try {
              const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
              handler.AddPara('EnsName', gf.dtl.No);
              handler.AddPara('WorkID', props.params.WorkID);
              handler.AddPara('PWorkID', props.params.PWorkID);
              handler.AddPara('FID', props.params.FID);
              handler.AddPara('FK_Node', props.params.FK_Node);
              handler.AddPara('RefPKVal', props.params.WorkID);
              const data = await handler.DoMethodReturnString('Dtl_InitCount');
              if (gf.dtl.NumOfDtl > parseInt(data)) {
                result = false;
                msg += gf.dtl.Name + '至少需要输入' + gf.dtl.NumOfDtl + '行';
              }
            } catch (e) {
              ShowFailToast.visible = true;
              ShowFailToast.msg = e as string;
              result = false;
            }
          }
        }
      }
    }
    //判断是否存在主表对从表列计算，且从表分页的情况
    const myMapAttrs = mapAttrs.value.filter(
      (mapAttr) =>
        mapAttr.MyDataType === DataType.AppInt || mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney,
    );
    for (const mapAttr of myMapAttrs) {
      const mapExts = mapAttr.mapExts.filter((mapExt) => mapExt.ExtType === 'NumEnterLimit' && mapExt.DoWay === '1');
      if (mapExts.length === 0) continue;
      const mapExt = mapExts[0];
      const mydtls = dtls.value.filter((dtl) => dtl.No === mapExt.Doc && GetPara(dtl.AtPara, 'PageSize') != '0');
      if (mydtls.length == 0) continue;
      const dtl = mydtls[0];
      //计算从表的值 AttrOfOper Tag
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('KeyOfEn', mapExt.Tag1);
      handler.AddPara('Oper', mapExt.Tag);
      handler.AddPara('PTable', dtl.PTable);
      let refPKVal = mainData.value['OID'];
      if (refPKVal == null || !refPKVal) refPKVal = mainData.value['No'];
      handler.AddPara('RefPKVal', refPKVal);
      try {
        const data = await handler.DoMethodReturnString('Dtl_ComputeForMainTable');
        mainData.value[mapExt.AttrOfOper] = data;
        resultData[mapExt.AttrOfOper] = data;
      } catch (e) {
        message.error(('主表对从表列计算失败:' + e) as string);
        return false;
      }
    }
    if (result == false) {
      ShowFailToast.visible = true;
      ShowFailToast.msg = msg;
      return null;
    }
    return resultData;
  };
  const Save = async () => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      const rowData = await VerifyFormData(true);
      if (rowData == null) return;
      if (props.pageFrom === 'FrmFool') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
        handler.AddJson(props.params);
        const keys = Object.keys(rowData);
        for (const key of keys) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
        const data = await handler.DoMethodReturnString('Save');
        if (typeof data == 'string' && data.includes('err@') == true) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = data.replace('err@', '');
          return false;
        }
        return true;
      }
      if (props.pageFrom === 'DtlFrm') {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        handler.AddPara('IsForDtl', 1);
        handler.AddPara('EnsName', props.params.EnsName);
        handler.AddPara('RefPKVal', props.params.RefPKVal);
        handler.AddPara('OID', props.params.RefOID);
        handler.AddPara('RowIndex', 0);
        handler.AddPara('IsVue3', 1);
        const keys = Object.keys(rowData);
        for (const key of keys) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
        const data = await handler.DoMethodReturnString('Dtl_SaveRow');
        if (typeof data == 'string' && data.includes('err@') == true) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = data.replace('err@', '');
          return false;
        }
        return true;
      }

      if (props.pageFrom !== 'FrmFool' && props.pageFrom !== 'DtlFrm') {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddJson(props.params);
        const keys = Object.keys(rowData);
        for (const key of keys) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
        const method = props.pageFrom === 'FrmEntityNoName' ? 'MyEntityNoName_SaveIt' : 'MyBill_SaveIt';
        const data = await handler.DoMethodReturnString(method);
        if (typeof data == 'string' && data.includes('err@') == true) {
          ShowFailToast.visible = true;
          ShowFailToast.msg = data.replace('err@', '');
          return false;
        }
        return true;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return false;
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    Event.on('IsShowMsg', async (data: any) => {
      //console.log(data);
      isShowMsg.value = data;
    });
    const args: Record<string, any> | null = await FrmBodyLoadAfter.FrmBodyLoadAfter(mapData.value?.No, props.params.WorkID, mainData.value, mapAttrs.value);
    if (!!args) {
      mainData.value = args?._bodyJson;
      mapAttrs.value = args?._attrs;
    }
  });
  // Event.on('InitPage', InitPage);
  onUnmounted(() => {
    Event.off('IsShowMsg');
  });

  const handleUpdate = (updatedData) => {
    mainData.value = updatedData;
  };

  defineExpose({ VerifyFormData, mainData, handleUpdate });

  /**
   * 获取枚举、外键、外部数据源的选择集合
   * @param mapAttr
   * @constructor
   */
  const GetDDLOption = (mapAttr: MapAttrExt) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: mainData.value[mapAttr.KeyOfEn],
          text: '绑定的外键枚举值丢失',
        },
      ];
    let options: Record<any, string>[] = [];
    let data = props.frmData[mapAttr.KeyOfEn];
    if (data == undefined) data = props.frmData[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = props.frmData.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if ((mapAttr.UIIsInput === 0 || mapAttr.DefVal === '-1') && mapAttr.UIContralType == UIContralType.DDL) {
        options.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          text: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.StrKey || item.IntKey,
          text: item['Name' + sysLang] || item.Lab,
        });
      });
      return options;
    }
    //只读的状态时
    if ((data == undefined || uiBindKey === 'Blank') && (props.isReadonly == true || props.fieldIsReadonly || mapAttr.UIIsEnable == 0)) {
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
    if (mapAttr.UIIsInput === 0)
      options.push({
        value: '',
        text: '-无-',
      });
    const keys = Object.keys(data[0]);
    const pKey = keys.find((key) => key.toLowerCase() == 'parentno');
    if (Array.isArray(data)) {
      if (pKey) {
        const { listToTree } = useTreeConvert();
        data.forEach((item) => {
          item.label = item.Name;
          item.value = item.No;
          item.text = item.Name;
          item.ParentNo = item[pKey];
        });
        const list = listToTree('0', data, false);
        options = list as any;
      } else {
        options = [
          ...options,
          ...data.map((item) => {
            return {
              value: item.No,
              label: item.Name,
              text: item.Name,
            };
          }),
        ];
      }
    }
    return options;
  };
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
        return ['datetime', ['hour'], 'YYYY-MM-DD HH'];
      case 2:
        return ['datetime', ['hour', 'minute'], 'YYYY-MM-DD HH:mm'];
      case 3:
        return ['datetime', ['hour', 'minute', 'second'], 'YYYY-MM-DD HH:mm:ss'];
      case 4:
        return ['date', ['year', 'month'], 'YYYY-MM'];
      case 5:
        return ['time', ['hour', 'minute'], 'HH:mm'];
      case 6:
        return ['time', ['hour', 'minute', 'second'], 'HH:mm:ss'];
      case 7:
        return ['date', ['month', 'day'], 'MM-DD'];
      case 8:
        return ['date', ['year'], 'YYYY'];
      case 9:
        return ['date', ['month'], 'MM'];
      default:
        return ['date', ['year', 'month', 'day'], 'YYYY-MM-DD'];
    }
  };
  const isNumeric = (str: string) => {
    if (typeof str != 'string') return false; // 判断是否为字符串
    return !isNaN(parseFloat(str)) && !isNaN(Number(str));
  };
  /**
   * 修改父组件属性的信息
   * @param keyOfEn
   * @param type
   * @param data
   * @param atpara
   * @param _rowIdx
   * @constructor
   */
  const ChangeParentAttr = async (keyOfEn, type, data, atpara = '', _rowIdx = 0) => {
    switch (type) {
      case 'FullData':
        for (const item in data) {
          if (mainData.value.hasOwnProperty(item)) {
            const isChangeVal = mainData.value[item] === data[item] ? false : true;
            mainData.value[item] = data[item];
            //判断当前的值是否有填充其他控件的功能
            if (isChangeVal && item != keyOfEn) {
              const mapAttr = mapAttrs.value.filter((attr) => attr.KeyOfEn === item)[0];
              //下拉框回填
              if (mapAttr.LGType == 1 && mapAttr?.ddl.length > 0) {
                const ddl = mapAttr.ddl.filter((attr) => attr.value === data[item])[0];
                mainData.value[item + 'T'] = ddl.text;
                mainData.value[item + 'Text'] = ddl.text;
                continue;
              }
              //pop填充
              const mapExts = mapAttr.mapExts || [];
              if (mapExts.length > 0) {
                mainData.value[item + 'T'] = data[item + 'T'];
                mainData.value[item + 'Text'] = data[item + 'T'];
                mapAttr.eleDBs = data[item + 'T'].split(',');
              }
            }
            //判断当前的值是否有填充其他控件的功能
            if (isChangeVal && item != keyOfEn) {
              const mapAttr = mapAttrs.value.filter((attr) => attr.KeyOfEn === item)[0];
              //调用子页面的方法
              await MapAttrLinkageTrigger(mapAttr, mainData.value[item], props.params.WorkID, null, false);
            }
          }
        }
        break;
      case 'ActiveDDL':
      case 'FullDataDDL':
        const isSelectVal = GetPara(atpara, 'IsSelectVal') || '0';
        mapAttrs.value.forEach((mapAttr) => {
          if (mapAttr.KeyOfEn === keyOfEn) {
            if (mapAttr.LGType === FieldTypeS.Enum) {
              //如果是枚举
              data = data.map((item) => {
                return {
                  value: isNumeric(item.value) ? parseInt(item.value) : item.value,
                  text: item.text,
                };
              });
            }
            mapAttr.ddl = data;
            /* if (data.length === 0) {
              mainData.value[keyOfEn] = '';
              mainData.value[keyOfEn + 'T'] = '';
              mainData.value[keyOfEn + 'Text'] = '';
            }*/
            mapAttr['ShowType'] = data.length != 0 && data[0].hasOwnProperty('ParentNo') ? 'Tree' : '';
            //判断当前值是否在当前的下拉列表中
            /*mainData.value[keyOfEn] = '';
            mainData.value[keyOfEn + 'T'] = '';
            mainData.value[keyOfEn + 'Text'] = '';*/
            if (Array.isArray(mainData.value[keyOfEn])) {
              let result: any = [];
              data.forEach((item) => {
                if (mainData.value[keyOfEn].includes(item.value)) result.push(item.value);
              });
              if (result.length != 0) mainData.value[keyOfEn] = result;
              if (result.length == 0) {
                if (isSelectVal === '0') mainData.value[keyOfEn] = [];
                else mainData.value[keyOfEn] = [data[0].value];
              }
            } else if (data.filter((item) => item.value === mainData.value[keyOfEn]).length === 0) {
              mainData.value[keyOfEn] = data.length === 0 ? '' : isSelectVal === '0' ? '' : data[0].value;
              mainData.value[keyOfEn + 'T'] = data.length === 0 ? '' : isSelectVal === '0' ? '' : data[0].text;
              mainData.value[keyOfEn + 'Text'] = mainData.value[keyOfEn + 'T'];
            }
            //调用子页面的方法
            MapAttrLinkageTrigger(mapAttr, mainData.value[keyOfEn], props.params.WorkID, null, false);
            return;
          }
        });
        break;
      case 'FullDataDtl': //刷新从表数据
        let refDtl = instance?.refs['dtl' + keyOfEn];
        if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
        if (!!refDtl) {
          refDtl.InitPage(false);
        }
        break;
      case 'FullDataAth': //刷新附件数据
        let refAth = instance?.refs['ath' + mapData.value?.No + '_' + keyOfEn];
        if (!!refAth && Array.isArray(refAth)) refAth = refAth[0];
        if (!!refAth) {
          refAth.dbList = [];
          refAth.InitPage();
        }
        break;
      case 'EnumHidItems': //隐藏枚举项
        //mainData.value[keyOfEn];
        for (const mapAttr of mapAttrs.value) {
          if (mapAttr.KeyOfEn === keyOfEn) {
            if (typeof mapAttr['ogDll'] === 'undefined') mapAttr['ogDll'] = mapAttr.ddl;
            if (!!data) {
              mapAttr.ddl = mapAttr['ogDll']
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
                if (mapAttr.ddl.filter((item) => mainData.value[keyOfEn].includes(item.value)).length === 0) {
                  mainData.value[keyOfEn] = [];
                }
              } else {
                if (mapAttr.ddl.filter((item) => item.value === mainData.value[keyOfEn]).length === 0) {
                  mainData.value[keyOfEn] = mapAttr.ddl.length === 0 ? (mapAttr.MyDataType === DataType.AppString ? '' : '-1') : -1;
                }
              }

              //调用子页面的方法
              await MapAttrLinkageTrigger(mapAttr, mainData.value[keyOfEn], props.params.WorkID, null, false);
            } else mapAttr.ddl = cloneDeep(mapAttr['ogDll']);
            return;
          }
        }
        break;
      default:
        break;
    }
  };
  provide('ChangeParentAttr', ChangeParentAttr);

  const MapAttrLinkageTrigger = async (mapAttr, value, refPKVal, option: ddlInfo | null = null, isPageLoad = false) => {
    const { GetActionDLLData, GetFullData, GetFullDataDtl } = mapExtParse();
    //修改对应的T值
    if (option != null) mainData.value[mapAttr.KeyOfEn + 'T'] = option.label;
    //处理扩展属性
    const mapExts = mapAttr.mapExts || [];
    for (const mapExt of mapExts) {
      if (isPageLoad && mapExt.ExtModel === 'RBAction') continue;
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          const data = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, mainData.value, '');
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, mapExt.AtPara);
          break;
        case 'FullCtrl':
        case 'TBFullCtrl':
        case 'Pop':
        case 'DDLFullCtrl':
          //不填充
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;

          //填充主表控件,控制字段是Tag5
          if (mapExt.Tag5 != 'None') {
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, mainData.value, null);
            if (fullData == null) continue;
            ChangeParentAttr(mapAttr.KeyOfEn, 'FullData', fullData, mapExt.AtPara);
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, mainData.value, '');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, mapExt.AtPara);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, mainData.value, null);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null, mapExt.AtPara);
          break;
        case 'RBAction': //联动其他控件
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          //清空之前的设置
          CleanAll(mapExt.FK_MapData, mapExt.AttrOfOper);
          //设置联动
          SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, value);
          break;
        case 'EnumHidItems': //隐藏枚举项
          if (!!mapExt.Tag4) {
            const args = mapExt.Tag4.split('@');
            args.forEach((item) => {
              const strs = item.split('=');
              if (strs.length === 2 && strs[0] === value.toString()) {
                ChangeParentAttr(mapExt.Tag, 'EnumHidItems', strs[1].replace('\n', '') + ',', mapExt.AtPara);
              }
            });
          }
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
  const CleanAll = (frmID, keyOfEn) => {
    if (LinkAttrs[keyOfEn] == undefined || LinkAttrs[keyOfEn].length == 0) return;
    if (LinkAttrs[keyOfEn].length > 0) {
      const ClearSet = LinkAttrs[keyOfEn][0];
      let refKeys: string[] = [];
      for (let key in ClearSet) {
        if (LinkAttrs[key] != undefined && LinkAttrs[key].length != 0 && key != keyOfEn) refKeys.push(key);
        const arr = ClearSet[key];
        if (arr.length == 0) continue;
        if (arr.length == 2) {
          for (let i = 0; i < gfs.value.length; i++) {
            if (!!gfs.value[i].CtrlID && gfs.value[i].CtrlID === key) {
              gfs.value[i].ShowType = arr[1];
              athInputUpload = athInputUpload.replace(key + ',', '');
            }
          }
          continue;
        }
        const k = mapAttrs.value.findIndex((mapAttr) => mapAttr.MyPK === frmID + '_' + key || mapAttr.MyPK === key);
        if (k != -1) {
          mapAttrs.value[k].UIIsEnable = arr[0];
          mapAttrs.value[k].UIVisible = arr[1];
          mapAttrs.value[k].UIIsInput = arr[2];
          mapAttrs.value[k].eleDBs = [];
          if (arr[2] == 0) {
            //判断之前rules
            const rules = mapAttrs.value[k]['rules'];
            if (!!rules && rules.length != 0) {
              //判断rules是否包含必填项
              const result = rules.findIndex((rule) => typeof rule.required === 'boolean');
              if (result.length != -1) mapAttrs.value[k]['rules'].splice(result, 1);
            }
          }
          mainData.value[key] = arr[3];
          if (mainData.value.hasOwnProperty(key + 'T')) mainData.value[key + 'T'] = '';
        }
      }
      for (const key of refKeys) {
        CleanAll(frmID, key);
      }
    }
  };
  let athInputUpload = ',';
  //设置联动
  const SetEnable = async (frmID, keyOfEn, val) => {
    //判断是否启用了
    const frmRBs = props.frmData.Sys_FrmRB;
    if (typeof val === 'boolean') {
      val = val ? 1 : 0;
    }
    const frmRB = frmRBs.filter((frmRB) => frmRB.MyPK === frmID + '_' + keyOfEn + '_' + val);
    if (frmRB.length == 0) return;

    //隐藏，显示的设置
    const cfgs = frmRB[0].FieldsCfg;
    //设置字段默认值
    const setVal = frmRB[0].SetVal;
    if (!cfgs && !setVal) return;
    const cfgPara = new AtPara(cfgs);
    const NDMapAttrs = {};
    let isSet = false;
    cfgPara.HisHT.forEach((value, key) => {
      const val = parseInt(value); //cfgPara.GetValIntByKey(key);
      let isHaveDeal = false;
      if (val != 0) {
        if (Array.isArray(NDMapAttrs[key]) == false) NDMapAttrs[key] = [];
        for (let i = 0; i < mapAttrs.value.length; i++) {
          if (mapAttrs.value[i].MyPK === frmID + '_' + key || mapAttrs.value[i].MyPK === key) {
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIIsEnable);
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIVisible);
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIIsInput);
            NDMapAttrs[key].push(origData.value[key]);
            if (val === 1) {
              //设置为可编辑
              mapAttrs.value[i].UIIsEnable = 1;
              mapAttrs.value[i].UIVisible = 1;
            }
            if (val === 2) {
              //设置为可编辑且必填
              mapAttrs.value[i].UIIsEnable = 1;
              mapAttrs.value[i].UIIsInput = 1;
              mapAttrs.value[i].UIVisible = 1;
              const rules = mapAttrs.value[i]['rules'];
              if (!rules || rules.length == 0) mapAttrs.value[i]['rules'] = [{ required: true, message: mapAttrs.value[i].Name + '值不能为空' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) mapAttrs.value[i]['rules'].push({ required: true, message: mapAttrs.value[i].Name + '值不能为空' });
              }
            }
            if (val === 3) {
              //设置为可见
              mapAttrs.value[i].UIIsEnable = 0;
              mapAttrs.value[i].UIVisible = 1;
            }
            if (val === 4) {
              //设置为不可见
              mapAttrs.value[i].UIVisible = 0;
            }
            //设置为可见且必填
            if (val === 5) {
              mapAttrs.value[i].UIIsEnable = 0;
              mapAttrs.value[i].UIVisible = 1;
              mapAttrs.value[i].UIIsInput = 1;
              const rules = mapAttrs.value[i]['rules'];
              if (!rules || rules.length == 0) mapAttrs.value[i]['rules'] = [{ required: true, message: '' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) mapAttrs.value[i]['rules'].push({ required: true, message: '' });
              }
            }
            isSet = true;
            isHaveDeal = true;
            break;
          }
        }
        if (isHaveDeal == false) {
          for (let i = 0; i < gfs.value.length; i++) {
            if (!!gfs.value[i].CtrlID && gfs.value[i].CtrlID === key) {
              NDMapAttrs[key].push(1);
              NDMapAttrs[key].push(gfs.value[i].ShowType);

              if (val === 1) {
                //设置为可编辑
              }
              if (val === 2) {
                //设置为可编辑且必填
                athInputUpload += key + ',';
              }
              if (val === 3) {
                //设置为可见
                gfs.value[i].ShowType = 0;
              }
              if (val === 4) {
                //设置为不可见
                gfs.value[i].ShowType = 2;
              }
              isSet = true;
            }
          }
        }
      }
    });

    const valPara = new AtPara(setVal);
    valPara.HisHT.forEach((value, key) => {
      if (Array.isArray(NDMapAttrs[key]) == false) {
        NDMapAttrs[key] = [];
        const mapAttr = mapAttrs.value.filter((mapAttr) => mapAttr.MyPK === frmID + '_' + keyOfEn)[0];
        NDMapAttrs[key].push(mapAttr.UIIsEnable);
        NDMapAttrs[key].push(mapAttr.UIVisible);
        NDMapAttrs[key].push(mapAttr.UIIsInput);
        NDMapAttrs[key].push(mainData.value[key]);
      }
      mainData.value[key] = valPara.HisHT.get(key);
      isSet = true;
    });
    LinkAttrs[keyOfEn] = [];
    if (isSet) LinkAttrs[keyOfEn].push(NDMapAttrs);
    //componentKey.value++;
  };
  InitPage();
  provide('CleanAll', CleanAll);
  provide('SetEnable', SetEnable);
  onUnmounted(() => {
    if (!!waterMarkText) watermark('');
  });
</script>

<style lang="less" scoped>
  .safe-area-bottom {
    height: env(safe-area-inset-bottom);
  }
  .content {
    background-color: #fafafd;
    box-sizing: border-box;
    // height: calc(var(--viewport-height) - 40px);
    //height: calc(var(--viewport-height) - 40px + env(safe-area-inset-bottom));
    // overflow-y: auto;
    // overflow-x: hidden;
    height: 100%;
    padding-top: 48px;
    padding-bottom: 40px;
    // h2 {
    //   margin: 0;
    //   padding: 10px 16px 10px;
    //   color: var(--van-doc-text-color-4);
    //   font-weight: 400;
    //   font-size: 16px;
    //   line-height: 16px;
    // }
  }

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

  .form-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 80px;
    line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding-right: 8px;

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
  // :deep(.van-cell__right-icon) {
  //   height: 16px;
  //   line-height: 16px;
  // }
  .vant-design-name {
    padding: 6px 16px 6px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
  }
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .flex-design {
    display: flex;
    align-items: center;
  }
  .circle {
    position: static;
    font-size: 14px !important;
    z-index: 98;
  }
</style>
