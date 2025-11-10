<template>
  <div :class="frmConfigs.frmStyleContent.frmContent">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <template v-if="nodeInfo?.AllowMultipleEditors == '1'">
          <div v-if="sformStore.onlineUsers.length > 0" class="online-users">
            <div class="title">{{ '在线用户' }}</div>
            <div class="user-list">
              <Popover v-for="user in sformStore.onlineUsers" :key="user.UserId">
                <template #content>
                  <p :style="({ color: user.HexColor } as StyleValue)">{{ user.UserId }} - {{ user.Username }}</p>
                </template>
                <img :src="user.Avatar" :onerror="user.DefaultIcon" alt="user-icon" />
              </Popover>
            </div>
          </div>
        </template>
        <!-- 广州市政的要求 打印标题及固定值-->
        <div v-if="CommonConfig.IsGZFrm" class="form-title" :class="frmConfigs.frmStyleContent.frmTitle">
          <template v-for="gf in CommonConfig.GZFrmTitles" :key="gf">
            <p style="margin-bottom: 0" v-if="frmConfigs.mapData?.PTable == gf.NO">{{ gf.Name }}</p>
          </template>
        </div>
        <template v-if="CommonConfig.IsGZFrm && frmConfigs.mapData?.PTable == 'ND2Rpt'">GZSZST-CX4-02-C</template>

        <template v-if="isLoadComplete">
          <!--平铺-->
          <FrmFoolSpread
            ref="spreadRef"
            v-if="frmConfigs.mapData?.FrmShowType === 0"
            :frmConfigs="frmConfigs"
            :params="params"
            :fieldIsReadonly="fieldIsReadonly"
            :isReadonly="isReadonly"
            :WGFrm="WGFrm"
            :componetKeys="componetKeys"
          />
          <!--Tab显示-->
          <FrmFoolTab
            ref="tabRef"
            v-if="frmConfigs.mapData?.FrmShowType === 1"
            :frmConfigs="frmConfigs"
            :params="params"
            :fieldIsReadonly="fieldIsReadonly"
            :isReadonly="isReadonly"
            :WGFrm="WGFrm"
            :componetKeys="componetKeys"
          />
          <!--从表合并-->
          <FrmFoolDtlMerge
            ref="dtlMergeRef"
            v-if="frmConfigs.mapData?.FrmShowType === 2"
            :frmConfigs="frmConfigs"
            :params="params"
            :fieldIsReadonly="fieldIsReadonly"
            :isReadonly="isReadonly"
            :WGFrm="WGFrm"
            :componetKeys="componetKeys"
          />
          <!--表单左右显示-->
          <FrmFoolTable
            ref="tableRef"
            v-if="frmConfigs.mapData?.FrmShowType === 3"
            :frmConfigs="frmConfigs"
            :params="params"
            :fieldIsReadonly="fieldIsReadonly"
            :isReadonly="isReadonly"
            :WGFrm="WGFrm"
            :componetKeys="componetKeys"
          />
        </template>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin, Popover } from 'ant-design-vue';
  import { reactive, ref, shallowRef, getCurrentInstance, provide, onUnmounted, onMounted, computed, StyleValue, nextTick } from 'vue';
  import { FrmAttachment, MapData, MapDtl, MapExt } from '/#/entity';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { MapAttrExt, GetMapExtsGroup, userConvertData, ddlInfo, useKeyOfEnType } from '/@/WF/CCForm/FrmEnd';
  import { DataType } from '/@/bp/en/DataType';
  import { FrmImg } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmImg';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { cloneDeep } from 'lodash-es';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import WebUser from '/@/bp/web/WebUser';
  import { AtPara } from '/@/bp/da/AtPara';
  import { MySetting } from '../Comm/Setting/MySetting';
  import Event from '/@/utils/Events';
  import { FrmAttachmentExts } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentExt';
  import { getmark } from '/@/utils/gener/watermark';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import { MapDtls } from '/@/WF/Admin/FrmLogic/MapDtl';
  import { FrmBodyLoadAfter } from '/@/DataUser/OverrideFiles/FrmBodyLoadAfter';
  import { ClassFactoryOfWaiGuaFlow } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaFlow';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useSharedFormStore } from '/@/store/modules/sharedForm';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { NodeFormType } from '/@/WF/Admin/EnumLab';
  import { MapData as MapFrmFool } from '../Admin/FrmLogic/MapData';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { MapAttr } from '../Admin/FrmLogic/MapAttrs/MapAttr';
  import { SysEnumMain } from '../Admin/FrmLogic/SysEnum/SysEnumMain';
  import { FrmConfig, GroupFieldExt } from './FrmFool/frm';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import FrmFoolSpread from './FrmFool/FrmFoolSpread.vue';
  import FrmFoolTab from './FrmFool/FrmFoolTab.vue';
  import FrmFoolTable from './FrmFool/FrmFoolTable.vue';
  import FrmFoolDtlMerge from './FrmFool/FrmFoolDtlMerge.vue';

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
    isSetHeight: {
      type: Boolean,
      default: true,
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    autoLayout: {
      type: Boolean,
      default: false,
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const sysLang = WebUser.SysLang || 'CH';
  const loading = ref(false);
  const instance = getCurrentInstance();
  const WGFrm = ref<WaiGuaBaseFrm>();
  const frmConfigs = reactive<FrmConfig>({
    frmData: {},
    gfs: [], //分组
    dtlGroup: [], //从表分组
    mapData: props.frmData.Sys_MapData[0] as MapData, //表单信息
    mapAttrs: {}, //字段属性
    mapExts: [], //字段扩展属性
    aths: [], // 附件属性集合
    dtls: [], //从表属性集合
    mainData: {}, //主表处理后信息
    origData: {}, //主表原始信息
    frmStyleContent: {
      frmContent: '',
      frmTitle: '',
      GroupTitle: '',
      frmstyle: '',
    }, // 表单样式
    tableCol: 4, //表格列数
    labPostion: 'left', //字段标签位置 左、上
    labAlign: 'left', // 字段标签 左右中
    nodeInfo: {}, //节点信息
    isHaveEditWorkCheck: false, //是否启用了审核组件
    isHaveSignCheck: false, // 是否存在签批字段
    checkField: '', //签批字段
    fwcVer: 0, //审核组件
    examineMode: '', // 审核组件模式
    athInputUpload: '',
    isZDPC: (groupID) => {
      for (const item of frmConfigs.gfs) {
        if (item.OID == groupID) {
          if (item.IsZDPC == 1) {
            item.IsZDPC = 0;
          } else {
            item.IsZDPC = 1;
          }
        }
      }
    },
    handleUpdate: (updatedData) => {
      handleUpdate(updatedData);
    },
    ChangeMainData: (atPara: AtPara, key: string) => {
      ChangeMainData(atPara, key);
    },
    changeTrack: () => {
      frmConfigs.examineMode = 'trackMode';
    },
    changeNormal: () => {
      frmConfigs.examineMode = 'normalMode';
    },
    changeTimeTrack: () => {
      frmConfigs.examineMode = 'trackTimeMode';
    },
  });

  const componetKeys = reactive({
    oldAttrKey: 0,
    attrKey: 0,
    dtlKey: {},
    athKey: 0,
  });

  const nodeInfo = typeof props.frmData.WF_Node != 'undefined' ? props.frmData.WF_Node[0] : null;
  frmConfigs.nodeInfo = nodeInfo;

  // 协作表单
  const { VITE_GLOB_WS_URL } = getAppEnvConfig();
  const sformStore = useSharedFormStore();
  if (!sformStore.isOnline && nodeInfo?.AllowMultipleEditors == '1') {
    sformStore.initWebSocket(VITE_GLOB_WS_URL, props.params.WorkID, props.frmData.Sys_MapData[0].No);
  }
  //审核组件模式
  const { watermark } = getmark();
  const WorkCheckMode = () => {
    switch (frmConfigs.nodeInfo.FWCShowModel) {
      case 0:
        frmConfigs.examineMode = 'normalMode';
        break;
      case 1:
        frmConfigs.examineMode = 'trackMode';
        break;
      case 2:
        frmConfigs.examineMode = 'trackTimeMode';
        break;
      default:
        frmConfigs.examineMode = 'normalMode';
        break;
    }
  };
  //获取表单的分组
  const { isTextPop, isRadio } = useKeyOfEnType(false);
  const generateWatermark = () => {
    let mapExts = props.frmData.Sys_MapExt || [];
    mapExts = mapExts.filter((mapExt) => {
      return mapExt.ExtModel === 'FrmBodySecret';
    });
    let text = '';
    if (mapExts.length != 0) text = mapExts[0].Tag1;
    if (text.includes('@') == true) text = DealExp(text, frmConfigs.mainData);
    if (!!text) watermark(text);
  };
  const isLoadComplete = ref(false);
  /**
   * 解析审核组件
   * @param gf
   * @param frmNode
   */
  const parseFWC = (gf, frmNode) => {
    gf.IsZDPC = parseInt(gf.ShowType || 0);
    if (nodeInfo != null && nodeInfo.FWCSta != 0 && !!props.params.WorkID) {
      frmConfigs.fwcVer = nodeInfo.FWCVer;
      //判断当前节点是否有签批字段
      const list = frmConfigs.mapAttrs.filter((item) => item.UIContralType == UIContralType.SignCheck);
      //节点启用/只读了审核组件
      if (frmNode != null && frmNode.MyPK != '' && nodeInfo.FormType == NodeFormType.SheetTree) {
        if (frmNode.IsEnableFWC != 0) {
          //存在签批字段
          if (list.length > 0) {
            if ((nodeInfo.FWCSta == 1 && nodeInfo.CheckField != '') || nodeInfo.FWCSta == 2) {
              frmConfigs.isHaveSignCheck = true;
              frmConfigs.checkField = nodeInfo.CheckField;
            } else {
              frmConfigs.gfs.push(gf);
            }
          } else {
            frmConfigs.gfs.push(gf);
          }
          if (nodeInfo.FWCSta == 1) frmConfigs.isHaveEditWorkCheck = true;
        }
      } else {
        if (list.length > 0) {
          if ((nodeInfo.FWCSta == 1 && nodeInfo.CheckField != '') || nodeInfo.FWCSta == 2) {
            frmConfigs.isHaveSignCheck = true;
            frmConfigs.checkField = nodeInfo.CheckField;
          } else {
            frmConfigs.gfs.push(gf);
          }
        } else {
          Event.emit('WorkCheckSta', '显示审核组件显示位置');
          frmConfigs.gfs.push(gf);
        }
        if (nodeInfo.FWCSta == 1) frmConfigs.isHaveEditWorkCheck = true;
      }
      WorkCheckMode();
    }
  };
  //表单样式
  const InitFrmStyleContent = async () => {
    //表单风格
    const mySetting = new MySetting(WebUser.No);
    await mySetting.RetrieveFromDBSources();
    const No: string = (mySetting.FrmStyle || '0').toString() || '0';
    switch (No) {
      case '0':
        frmConfigs.frmStyleContent.frmContent = 'defaultfrmContent' + 1;
        frmConfigs.frmStyleContent.frmTitle = 'defaultFrmTitle' + 1;
        frmConfigs.frmStyleContent.GroupTitle = 'defaultGroupTitle' + 1;
        frmConfigs.frmStyleContent.frmstyle = 'defaultFrmstyle' + 1;

        break;
      case '1':
        frmConfigs.frmStyleContent.frmContent = '';
        frmConfigs.frmStyleContent.frmTitle = '';
        frmConfigs.frmStyleContent.GroupTitle = '';
        frmConfigs.frmStyleContent.frmstyle = '';
        break;
      case '2':
        frmConfigs.frmStyleContent.frmContent = 'defaultfrmContent' + No;
        frmConfigs.frmStyleContent.frmTitle = 'defaultFrmTitle' + No;
        frmConfigs.frmStyleContent.GroupTitle = 'defaultGroupTitle' + No;
        frmConfigs.frmStyleContent.frmstyle = 'defaultFrmstyle' + No;
        break;
      case '3':
        frmConfigs.frmStyleContent.frmContent = 'defaultfrmContent' + No;
        frmConfigs.frmStyleContent.frmTitle = 'defaultFrmTitle' + No;
        frmConfigs.frmStyleContent.GroupTitle = 'defaultGroupTitle' + No;
        frmConfigs.frmStyleContent.frmstyle = 'defaultFrmstyle' + No;
        break;
      case '4':
        frmConfigs.frmStyleContent.frmContent = 'defaultfrmContent' + No;
        frmConfigs.frmStyleContent.frmTitle = 'defaultFrmTitle' + No;
        frmConfigs.frmStyleContent.GroupTitle = 'defaultGroupTitle' + No;
        frmConfigs.frmStyleContent.frmstyle = 'defaultFrmstyle' + No;
        break;
      case '5':
        frmConfigs.frmStyleContent.frmContent = 'defaultfrmContent' + No;
        frmConfigs.frmStyleContent.frmTitle = 'defaultFrmTitle' + No;
        frmConfigs.frmStyleContent.GroupTitle = 'defaultGroupTitle' + No;
        frmConfigs.frmStyleContent.frmstyle = 'defaultFrmstyle' + No;
        break;
    }
  };
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      frmConfigs.gfs = [];
      frmConfigs.dtlGroup = [];
      //frmConfigs.mapData = props.frmData.Sys_MapData[0] as MapData;
      frmConfigs.frmData = props.frmData;
      frmConfigs.aths = (props.frmData.Sys_FrmAttachment as Array<FrmAttachment>) || [];
      frmConfigs.dtls = (props.frmData.Sys_MapDtl as Array<MapDtl>) || [];
      const sysGroupField = props.frmData.Sys_GroupField as Array<GroupFieldExt>;
      if (props.frmData.Sys_MapData.length === 0) {
        message.error('没有获取到表单的基本信息，请关闭页面重新打开');
        return;
      }
      //处理表单风格
      await InitFrmStyleContent();
      frmConfigs.mapAttrs = cloneDeep(props.frmData.Sys_MapAttr as Array<MapAttrExt>);
      frmConfigs.mainData = props.frmData.MainTable[0] || {};
      frmConfigs.tableCol = frmConfigs.mapData?.TableCol == 0 ? 4 : 6;
      frmConfigs.labPostion = GetPara(frmConfigs.mapData?.AtPara, 'LabelPosition') || 'left';
      frmConfigs.labAlign = GetPara(frmConfigs.mapData?.AtPara, 'LabelAlign') || 'left';
      const mapExts = GetMapExtsGroup(props.frmData.Sys_MapExt);
      frmConfigs.mapExts = cloneDeep(props.frmData.Sys_MapExt as Array<MapExt>) || [];
      const frmNode = props.frmData.WF_FrmNode != undefined ? props.frmData.WF_FrmNode[0] : null;
      //自定义权限的附件属性
      let athSlns: any[] = [];
      if (!!frmNode && !!frmNode.FK_Frm && !!frmNode.FK_Node && frmNode.FrmSln == 1) {
        const athments = new FrmAttachmentExts();
        await athments.Retrieve('FK_MapData', frmNode.FK_Frm, 'FK_Node', frmNode.FK_Node);
        athSlns = athments;
        frmConfigs.aths.forEach((ath) => {
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
        //自定义权限的从表属性
        const ens = new MapDtls();
        await ens.Retrieve('FK_MapData', frmNode.FK_Frm, 'FK_Node', frmNode.FK_Node);
        frmConfigs.dtls.forEach((dtl) => {
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
      let isHaveSubFlow = false; //是否启用父子流程
      let isHaveFWC = false; //是否启用审核组件
      const isCanHaveFWC = typeof props.params.IsCanShowFWC == 'undefined' || props.params.IsCanShowFWC != '0';

      for (const gf of sysGroupField) {
        if (gf.CtrlType === 'Dir') {
          gf.IsZDPC = parseInt(gf.ShowType);
          frmConfigs.gfs.push(gf);
          continue;
        }
        if (gf.CtrlType === null || gf.CtrlType === '') {
          gf.IsZDPC = parseInt(gf.ShowType);
          frmConfigs.gfs.push(gf);
          continue;
        }
        //从表处理
        if (gf.CtrlType === 'Dtl') {
          const dtls = GetDtlsByGroupCtrlID(gf.CtrlID);
          if (dtls.length > 0) {
            gf.dtl = dtls[0];
            gf.IsZDPC = parseInt(gf.ShowType);
            if (frmConfigs.mapData.FrmShowType != 2) frmConfigs.gfs.push(gf);
            else frmConfigs.dtlGroup.push(gf);
            componetKeys.dtlKey[gf.dtl.No] = 0;
          }
          continue;
        }
        if (gf.CtrlType === 'GovDoc') {
          frmConfigs.gfs.push(gf);
          continue;
        }
        //附件的处理
        if (gf.CtrlType === 'Ath') {
          const aths = GetAthsByGroupCtrlID(gf.CtrlID);
          if (aths.length > 0) {
            gf.ath = aths[0];
            gf.IsZDPC = parseInt(gf.ShowType);
            if (parseInt(gf.ath.IsVisable) === 1) frmConfigs.gfs.push(gf);
          }
          continue;
        }
        if (gf.CtrlType === 'SubFlow' && !!nodeInfo?.SFSta && nodeInfo?.SFSta != 0) {
          if (frmNode != null && frmNode.MyPK != '' && nodeInfo.FormType == NodeFormType.SheetTree) {
            gf.IsZDPC = parseInt(gf.ShowType);
            if (frmNode.IsEnableSF != 0) frmConfigs.gfs.push(gf);
          } else {
            gf.IsZDPC = parseInt(gf.ShowType);
            frmConfigs.gfs.push(gf);
          }
          isHaveSubFlow = true;
        }
        //审核组件
        if (gf.CtrlType === 'FWC' && nodeInfo != null && nodeInfo.FWCSta != 0 && !!props.params.WorkID && isCanHaveFWC) {
          isHaveFWC = true;
          parseFWC(gf, frmNode);
        }
      }
      if (isHaveSubFlow == false) {
        const gf: GroupFieldExt = cloneDeep(sysGroupField[0]);
        gf.Lab = '父子流程组件';
        gf.CtrlType = 'SubFlow';
        gf.OID = DBAccess.GenerGUID();
        if (nodeInfo?.SFSta && nodeInfo?.SFSta != 0) {
          if (frmNode != null && frmNode.MyPK != '' && nodeInfo.FormType == NodeFormType.SheetTree) {
            if (frmNode.IsEnableSF != 0) frmConfigs.gfs.push(gf);
          } else {
            frmConfigs.gfs.push(gf);
          }
        }
      }
      if (isHaveFWC == false && isCanHaveFWC) {
        const gf: GroupFieldExt = cloneDeep(sysGroupField[0]);
        gf.Lab = '审核';
        gf.CtrlType = 'FWC';
        gf.OID = DBAccess.GenerGUID();
        parseFWC(gf, frmNode);
      }

      //处理字段的下拉框
      for (const mapAttr of frmConfigs.mapAttrs) {
        mapAttr['type'] = 'input';
        mapAttr['rules'] = [];
        //mapExt的集合
        mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
        if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
          mapAttr['ddl'] = GetDDLOption(mapAttr as any) || [];
          mapAttr['mode'] = '';
          if (mapAttr.LGType === FieldTypeS.Enum && mapAttr.UIContralType === UIContralType.CheckBok) mapAttr['mode'] = 'multiple';
          mapAttr['ShowType'] = mapAttr['ddl'].length != 0 && mapAttr['ddl'][0].hasOwnProperty('ParentNo') ? 'Tree' : '';
        }
        //图片 例如肖像
        if (mapAttr.UIContralType === UIContralType.FrmImg) frmConfigs.mainData[mapAttr.KeyOfEn] = await GetImgPath(mapAttr);
        //日期、日期时间类型
        if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
          const attr = GetDateTimeOption(mapAttr as any);
          mapAttr.format = attr[1];
          mapAttr['picker'] = attr[0];
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', type: 'string' }];
          //数值类型
        } else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
          mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
          if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
          //其他字段的必填
        } else {
          if (mapAttr.UIIsInput) {
            if (isTextPop(mapAttr)) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', trigger: 'blur' }];
            else if (isRadio(mapAttr)) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', trigger: 'change' }];
            else mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
          }
        }

        //含有正则表达式
        mapAttr.mapExts
          .filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'RegularExpression')
          .forEach((mapExt) => {
            mapAttr['rules'].push({
              transform: (value) => String(value),
              pattern: mapExt.Doc,
              message: mapExt.Tag2,
              trigger: mapExt.Tag,
            });
          });
        //字段附件，获取对应的附件信息
        if (mapAttr.UIContralType === UIContralType.AthShow) {
          const result = frmConfigs.aths.filter((ath) => ath.MyPK === mapAttr.MyPK);
          if (result.length == 0) {
            mapAttr.ath = null;
            frmConfigs.mainData[mapAttr.KeyOfEn] = '附件信息丢失,请联系管理员';
            continue;
          }
          mapAttr.ath = result[0];
          if (result?.[0]?.NumOfUpload > 0) {
            mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '最小值为' + result?.[0]?.NumOfUpload + '必须要上传文件' }];
          }
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
          if (frmConfigs.mainData[mapAttr.KeyOfEn] == '') frmConfigs.mainData[mapAttr.KeyOfEn] = 0;
          mapAttr.Tag2 = mapAttr.Tag2 || '5';
        }
        //是否可以清空填写
        mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;
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
                  label: item,
                };
              });
            frmConfigs.mainData[keyOfEn] = GetPara(frmConfigs.mainData.AtPara, keyOfEn) || mapAttr['sufOptions'][0].value;
          }
        }
      }
      frmConfigs.mainData = await ConvertDataFromDB(cloneDeep(frmConfigs.mainData), frmConfigs.mapAttrs as any);
      frmConfigs.origData = frmConfigs.mainData;

      //判断是否启用了联动其他控件的功能
      const cmapExts = props.frmData.Sys_MapExt.filter((mapExt) => mapExt.ExtModel === 'RBAction' && mapExt?.DoWay === '1');
      cmapExts.forEach((mapExt) => {
        //判断当前枚举字段是否隐藏，隐藏后不联动其他控件
        if (frmConfigs.mapAttrs.find((attr) => attr.KeyOfEn === mapExt.AttrOfOper && parseInt(attr.UIVisible) === 1) != null) {
          if (Array.isArray(frmConfigs.mainData[mapExt.AttrOfOper])) {
            frmConfigs.mainData[mapExt.AttrOfOper].forEach((item) => {
              SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item, true);
            });
          } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, frmConfigs.mainData[mapExt.AttrOfOper], true);
        }
      });
      let enName = 'WGFlow_' + (props.params.FK_Flow || props.params.FlowNo);
      let entity: any = await ClassFactoryOfWaiGuaFlow.GetEn(enName as string);
      if (entity == null) {
        enName = 'WGEntity_' + frmConfigs.mapData?.No;
        entity = await ClassFactoryOfWaiGuaEntity.GetEn(enName as string);
        if (entity != null) {
          entity.WorkID = props.params.WorkID || props.params.RefPKVal;
          entity.EnityID = frmConfigs.mapData?.No;
          entity.FrmID = frmConfigs.mapData?.No;
          entity.OID = props.params.WorkID || props.params.RefPKVal;
          entity.FrmBodyJson = frmConfigs.mapData;
          entity.MapAttrs = frmConfigs.mapAttrs;
          entity.Groups = frmConfigs.gfs;
          WGFrm.value = entity;
        }
      } else {
        entity.WorkID = props.params.WorkID;
        entity.EnityID = frmConfigs.mapData?.No;
        entity.FrmID = frmConfigs.mapData?.No;
        entity.OID = props.params.WorkID;
        entity.FrmBodyJson = frmConfigs.mainData;
        entity.MapAttrs = frmConfigs.mapAttrs;
        entity.Groups = frmConfigs.gfs;
        WGFrm.value = entity;
      }

      generateWatermark();
      frmConfigs.gfs
        .filter((gf) => gf.CtrlType === 'Dir')
        .forEach((gf) => {
          //判断是否隐藏dir
          const items = frmConfigs.gfs.filter((item) => item.ParentOID === gf.OID && item.ShowType != 2);
          if (items.length == 0) gf.ShowType = 2;
        });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
      if (WGFrm.value != null) {
        await WGFrm.value.FrmLoadAfter();
        frmConfigs.gfs = WGFrm.value.Groups as GroupFieldExt[];
      }
      isLoadComplete.value = true;
    }
  };
  const { ConvertDataToDB, ConvertDataFromDB } = userConvertData();

  /**
   * 获取分组下的附件信息
   * @param groupCtrlID 附件对应的MyPK
   * @constructor
   */
  const GetAthsByGroupCtrlID = (groupCtrlID: string) => {
    if (groupCtrlID == '' || frmConfigs.aths.length == 0) return [];
    return frmConfigs.aths.filter((ath) => ath.MyPK === groupCtrlID && ath.IsVisable != '0' && ath.NoOfObj != 'FrmWorkCheck');
  };
  /**
   * 获取分组下的从表信息
   * @param groupCtrlID 从表对应的No
   * @constructor
   */
  const GetDtlsByGroupCtrlID = (groupCtrlID: string) => {
    if (groupCtrlID == '' || frmConfigs.dtls.length == 0) return [];
    return frmConfigs.dtls.filter((dtl) => dtl.No === groupCtrlID && parseInt(dtl.IsView) == 1);
  };

  /**
   * 获取图片路径
   * @param mapAttr
   * @constructor
   */
  const GetImgPath = async (mapAttr) => {
    const frmImg = new FrmImg(mapAttr.MyPK);
    const result = await frmImg.RetrieveFromDBSources();
    if (result == 0) {
      message.error('图片控件[' + mapAttr.Name + ']信息丢失，请联系管理员');
      return '';
    }
    //数据来源为本地.
    let imgSrc = '';
    if (frmImg.ImgSrcType == 0) {
      //替换参数
      let frmPath = frmImg.ImgPath;
      frmPath = frmPath.replace('＠', '@');
      frmPath = frmPath.replace(/@basePath/g, '/resource/');
      imgSrc = DealExp(frmPath, frmConfigs.mainData);
    }

    //数据来源为指定路径.
    if (frmImg.ImgSrcType == 1) {
      let url = frmImg.ImgURL;
      url = url.replace('＠', '@');
      url = url.replace(/@basePath/g, '/resource/');
      imgSrc = DealExp(url, frmConfigs.mainData);
    }
    // 由于火狐 不支持onerror 所以 判断图片是否存在放到服务器端
    if (imgSrc == '' || imgSrc == null) imgSrc = '/resource/CompanyImgLogo/cc_logo.png';
    return imgSrc;
  };

  const isNumeric = (str: string) => {
    if (typeof str != 'string') return false; // 判断是否为字符串
    return !isNaN(parseFloat(str)) && !isNaN(Number(str));
  };

  /**
   * 修改父组件属性的信息
   * @param mapAttr
   * @param type
   * @constructor
   */
  const ChangeParentAttr = async (keyOfEn, type, data, idx, atpara) => {
    switch (type) {
      case 'FullData':
        for (const item in data) {
          if (frmConfigs.mainData.hasOwnProperty(item)) {
            const isChangeVal = frmConfigs.mainData[item] === data[item] ? false : true;
            frmConfigs.mainData[item] = data[item];
            if (!!data[item + 'T']) {
              frmConfigs.mapAttrs.forEach((mapAttr) => {
                if (mapAttr.KeyOfEn == item) {
                  mapAttr['eleDBs'] = data[item + 'T'].split(',');
                }
              });
            }
            //判断当前的值是否有填充其他控件的功能
            if (isChangeVal && item != keyOfEn) {
              const curmapAttrs = frmConfigs.mapAttrs.filter((attr) => attr.KeyOfEn === item);
              if (curmapAttrs.length > 0)
                //调用子页面的方法
                await MapAttrLinkageTrigger(curmapAttrs[0], frmConfigs.mainData[item], props.params.WorkID, null, false);
            }
          }
        }
        break;
      case 'ActiveDDL':
      case 'FullDataDDL':
        const isSelectVal = GetPara(atpara, 'IsSelectVal') || '0';
        for (const mapAttr of frmConfigs.mapAttrs) {
          if (mapAttr.KeyOfEn === keyOfEn) {
            if (mapAttr.LGType === FieldTypeS.Enum) {
              //如果是枚举
              data = data.map((item) => {
                return {
                  value: isNumeric(item.value) ? parseInt(item.value) : item.value,
                  label: item.label,
                };
              });
            }
            mapAttr.ddl = data;
            if (data.length === 0) frmConfigs.mainData[keyOfEn] = '';
            mapAttr['ShowType'] = data.length != 0 && data[0].hasOwnProperty('ParentNo') ? 'Tree' : '';
            //判断当前值是否在当前的下拉列表中
            if (Array.isArray(frmConfigs.mainData[keyOfEn])) {
              let result: any = [];
              data.forEach((item) => {
                if (frmConfigs.mainData[keyOfEn].includes(item.value)) result.push(item.value);
              });
              if (result.length != 0) frmConfigs.mainData[keyOfEn] = result;
              if (result.length == 0) {
                if (isSelectVal === '0') frmConfigs.mainData[keyOfEn] = [];
                else frmConfigs.mainData[keyOfEn] = [data[0].value];
              }
            } else if (data.filter((item) => item.value === frmConfigs.mainData[keyOfEn]).length === 0) {
              frmConfigs.mainData[keyOfEn] = data.length === 0 ? '' : isSelectVal === '0' ? '' : data[0].value;
            }
            //调用子页面的方法
            await MapAttrLinkageTrigger(mapAttr, frmConfigs.mainData[keyOfEn], props.params.WorkID, null, false);
            return;
          }
        }
        break;
      case 'FullDataDtl': //刷新从表数据
        if (!!frmConfigs.dtls.find((item) => item.No === keyOfEn)) {
          if (Array.isArray(data)) {
            //需要清空从表数据并插入数据
            try {
              const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
              handler.AddJson(props.params);
              handler.AddPara('DtlNo', keyOfEn);
              handler.AddPara('RowJson', encodeURIComponent(JSON.stringify(data)));
              await handler.DoMethodReturnString('Dtl_FullDtl');
            } catch (e) {
              message.error('从表填充失败:' + e);
              break;
            }
          }
          componetKeys.dtlKey[keyOfEn]++;
          break;
        }
        break;
      case 'FullDataAth': //刷新从表数据
        let refAth = instance?.refs['ath' + frmConfigs.mapData?.No + '_' + keyOfEn];
        if (!!refAth && Array.isArray(refAth)) refAth = refAth[0];
        if (!!refAth) {
          componetKeys.athKey++;
        }
        break;
      case 'EnumHidItems': //隐藏枚举项
        //mainData.value[keyOfEn];
        for (const mapAttr of frmConfigs.mapAttrs) {
          if (mapAttr.KeyOfEn === keyOfEn) {
            if (typeof mapAttr['ogDll'] === 'undefined') mapAttr['ogDll'] = mapAttr.ddl;
            if (!!data) {
              mapAttr.ddl = mapAttr['ogDll']
                .filter((item) => data.includes(item.value + ',') == false)
                .map((item) => {
                  return {
                    value: item.value,
                    label: item.label,
                  };
                });
              //判断当前值是否在当前的下拉列表中
              if (mapAttr.UIContralType == UIContralType.CheckBok) {
                //多选
                if (mapAttr.ddl.filter((item) => frmConfigs.mainData[keyOfEn].includes(item.value)).length === 0) {
                  frmConfigs.mainData[keyOfEn] = [];
                }
              } else {
                if (mapAttr.ddl.filter((item) => item.value === frmConfigs.mainData[keyOfEn]).length === 0) {
                  frmConfigs.mainData[keyOfEn] = mapAttr.ddl.length === 0 ? (mapAttr.MyDataType === DataType.AppString ? '' : '-1') : -1;
                }
              }

              //调用子页面的方法
              await MapAttrLinkageTrigger(mapAttr, frmConfigs.mainData[keyOfEn], props.params.WorkID, null, false);
            } else mapAttr.ddl = cloneDeep(mapAttr['ogDll']);
            return;
          }
        }

        break;
      default:
        break;
    }
    //2025-07-08 yln 暂时注释掉，初始化加载的时候调用该方法的时候会进行必填校验，忘记为什么增加这个判断
    /*const attrFormList = basicData.value || TabbasicData.value;
      for (const attrForm of attrFormList) {
        await attrForm?.clearValidate();
        await attrForm?.validateForm();
      }*/
  };
  provide('ChangeParentAttr', ChangeParentAttr);

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
          for (let i = 0; i < frmConfigs.gfs.length; i++) {
            if (!!frmConfigs.gfs[i].CtrlID && frmConfigs.gfs[i].CtrlID === key) {
              frmConfigs.gfs[i].ShowType = arr[1];
              frmConfigs.athInputUpload = frmConfigs.athInputUpload.replace(key + ',', '');
            }
          }
          continue;
        }
        const k = frmConfigs.mapAttrs.findIndex((mapAttr) => mapAttr.MyPK === frmID + '_' + key || mapAttr.MyPK === key);
        if (k != -1) {
          frmConfigs.mapAttrs[k].UIIsEnable = arr[0];
          frmConfigs.mapAttrs[k].UIVisible = arr[1];
          frmConfigs.mapAttrs[k].UIIsInput = arr[2];
          frmConfigs.mapAttrs[k].eleDBs = [];
          if (arr[2] == 0) {
            //判断之前rules
            const rules = frmConfigs.mapAttrs[k]['rules'];
            if (!!rules && rules.length != 0) {
              //判断rules是否包含必填项
              const result = rules.findIndex((rule) => typeof rule.required === 'boolean');
              if (result.length != -1) frmConfigs.mapAttrs[k]['rules'].splice(result, 1);
            }
          }
          frmConfigs.mainData[key] = arr[3];
          if (frmConfigs.mainData.hasOwnProperty(key + 'T')) frmConfigs.mainData[key + 'T'] = '';
        }
      }
      for (const key of refKeys) {
        CleanAll(frmID, key);
      }
    }
    //attrKey.value++;
  };
  //设置联动
  const SetEnable = async (frmID, keyOfEn, val, isFirstLoad = false, _rowIdx = 0) => {
    componetKeys.oldAttrKey = componetKeys.attrKey;
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
        for (let i = 0; i < frmConfigs.mapAttrs.length; i++) {
          if (frmConfigs.mapAttrs[i].MyPK === frmID + '_' + key || frmConfigs.mapAttrs[i].MyPK === key) {
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIIsEnable);
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIVisible);
            NDMapAttrs[key].push(props.frmData.Sys_MapAttr[i].UIIsInput);
            NDMapAttrs[key].push(frmConfigs.origData[key]);
            if (val === 1) {
              //设置为可编辑
              frmConfigs.mapAttrs[i].UIIsEnable = 1;
              frmConfigs.mapAttrs[i].UIVisible = 1;
            }
            if (val === 2) {
              //设置为可编辑且必填
              frmConfigs.mapAttrs[i].UIIsEnable = 1;
              frmConfigs.mapAttrs[i].UIIsInput = 1;
              frmConfigs.mapAttrs[i].UIVisible = 1;
              const rules = frmConfigs.mapAttrs[i]['rules'];
              if (!rules || rules.length == 0) frmConfigs.mapAttrs[i]['rules'] = [{ required: true, message: frmConfigs.mapAttrs[i].Name + '值不能为空' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) frmConfigs.mapAttrs[i]['rules'].push({ required: true, message: frmConfigs.mapAttrs[i].Name + '值不能为空' });
              }
            }
            if (val === 3) {
              //设置为可见
              frmConfigs.mapAttrs[i].UIIsEnable = 0;
              frmConfigs.mapAttrs[i].UIVisible = 1;
            }
            if (val === 4) {
              //设置为不可见
              frmConfigs.mapAttrs[i].UIVisible = 0;
            }
            //设置为可见且必填
            if (val === 5) {
              frmConfigs.mapAttrs[i].UIIsEnable = 0;
              frmConfigs.mapAttrs[i].UIVisible = 1;
              frmConfigs.mapAttrs[i].UIIsInput = 1;
              const rules = frmConfigs.mapAttrs[i]['rules'];
              if (!rules || rules.length == 0) frmConfigs.mapAttrs[i]['rules'] = [{ required: true, message: '' }];
              else {
                //判断rules是否包含必填项
                const result = rules.filter((rule) => typeof rule.required === 'boolean');
                if (result.length == 0) frmConfigs.mapAttrs[i]['rules'].push({ required: true, message: '' });
              }
            }
            isSet = true;
            isHaveDeal = true;
            break;
          }
        }
        if (isHaveDeal == false) {
          for (let i = 0; i < frmConfigs.gfs.length; i++) {
            if (!!frmConfigs.gfs[i].CtrlID && frmConfigs.gfs[i].CtrlID === key) {
              NDMapAttrs[key].push(1);
              NDMapAttrs[key].push(frmConfigs.gfs[i].ShowType);

              if (val === 1) {
                //设置为可编辑
              }
              if (val === 2) {
                //设置为可编辑且必填
                frmConfigs.athInputUpload += key + ',';
              }
              if (val === 3) {
                //设置为可见
                frmConfigs.gfs[i].ShowType = 0;
              }
              if (val === 4) {
                //设置为不可见
                frmConfigs.gfs[i].ShowType = 2;
              }
              isSet = true;
            }
          }
        }
      }
    });

    const valPara = new AtPara(setVal);
    valPara.HisHT.forEach(async (value, key) => {
      if (Array.isArray(NDMapAttrs[key]) == false) {
        NDMapAttrs[key] = [];
        const mapAttr = frmConfigs.mapAttrs.filter((mapAttr) => mapAttr.MyPK === frmID + '_' + keyOfEn)[0];
        NDMapAttrs[key].push(mapAttr.UIIsEnable);
        NDMapAttrs[key].push(mapAttr.UIVisible);
        NDMapAttrs[key].push(mapAttr.UIIsInput);
        NDMapAttrs[key].push(frmConfigs.mainData[key]);
      }

      //判断Int枚举
      const attr = new MapAttr(frmID + '_' + key);
      await attr.RetrieveFromDBSources();
      if (attr.LGType == 1) {
        const enumMain = new SysEnumMain(key);
        await enumMain.Retrieve();
        if (enumMain.EnumType == 0) {
          frmConfigs.mainData[key] = parseInt(valPara.HisHT.get(key));
        }
      } else {
        frmConfigs.mainData[key] = valPara.HisHT.get(key);
      }

      isSet = true;
    });
    LinkAttrs[keyOfEn] = [];
    if (isSet) LinkAttrs[keyOfEn].push(NDMapAttrs);
    if (isFirstLoad == false) componetKeys.attrKey++;
  };

  provide('CleanAll', CleanAll);
  provide('SetEnable', SetEnable);
  const MapAttrLinkageTrigger = async (mapAttr, value, refPKVal, option: ddlInfo | null = null, isPageLoad = false) => {
    const { GetActionDLLData, GetFullData, GetFullDataDtl } = mapExtParse();
    //修改对应的T值
    if (option != null) frmConfigs.mainData[mapAttr.KeyOfEn + 'T'] = option.label;
    //处理扩展属性
    const mapExts = mapAttr?.mapExts || [];
    for (const mapExt of mapExts) {
      if (isPageLoad && mapExt.ExtModel === 'RBAction') continue;
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          if (mapExt.AttrsOfActive === mapExt.AttrOfOper) {
            message.error('字段' + mapAttr.Name + '的级联下拉框出现问题,级联选择了自己');
            break;
          }
          const data = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, frmConfigs.mainData, '');
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, null, mapExt.AtPara);
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
            const fullData = await GetFullData(value, mapExt, props.params.WorkID, frmConfigs.mainData, null);
            if (fullData == null) continue;
            ChangeParentAttr(mapAttr.KeyOfEn, 'FullData', fullData, null, mapExt.AtPara);
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', refPKVal, frmConfigs.mainData, '');
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, null, mapExt.AtPara);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, refPKVal, frmConfigs.mainData, null);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', null, null, mapExt.AtPara);
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
                ChangeParentAttr(mapExt.Tag, 'EnumHidItems', strs[1].replace('\n', '') + ',', null, mapExt.AtPara);
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
   * 获取枚举、外键、外部数据源的选择集合
   * @param mapAttr
   * @constructor
   */
  const GetDDLOption = (mapAttr: MapAttrExt) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: frmConfigs.mainData[mapAttr.KeyOfEn],
          label: '绑定的外键枚举值丢失',
        },
      ];
    const options: any[] = [];
    let data = props.frmData[mapAttr.KeyOfEn];
    if (data == undefined) data = props.frmData[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = props.frmData.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if (mapAttr.UIContralType == UIContralType.DDL) {
        options.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.StrKey || item.IntKey,
          label: item['Name' + sysLang] || item.Lab,
        });
      });
      return options;
    }
    //只读的状态时
    if ((data == undefined || uiBindKey === 'Blank') && (props.isReadonly == true || props.fieldIsReadonly || mapAttr.UIIsEnable == 0)) {
      let valText = frmConfigs.mainData[mapAttr.KeyOfEn + 'Text'] || '';
      if (valText == '') valText = frmConfigs.mainData[mapAttr.KeyOfEn + 'T'] || '';
      return [
        {
          value: frmConfigs.mainData[mapAttr.KeyOfEn],
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
    if (data.length != 0 && data[0].hasOwnProperty('ParentNo') == true) {
      //转成树形结构
      const { listToTree } = useTreeConvert();
      const treeData = listToTree('0', data) || [];
      return treeData;
    } else {
      if (mapAttr.UIIsInput === 0)
        options.push({
          value: '',
          label: '-无-',
        });
      for (const item of data) {
        if (!item.No) {
          message.error(`字段【${mapAttr.Name}】的下拉数据值No不能为空`);
          break;
        }
        options.push({
          value: item.No.toString(),
          label: item.Name,
        });
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
        return ['date', 'YYYY-MM-DD'];
      case 10:
        return ['date', 'YYYY年MM月DD日'];
      case 1:
        return ['date', 'YYYY-MM-DD HH'];
      case 2:
        return ['date', 'YYYY-MM-DD HH:mm'];
      case 3:
        return ['date', 'YYYY-MM-DD HH:mm:ss'];
      case 4:
        return ['month', 'YYYY-MM'];
      case 11:
        return ['month', 'YYYY年MM月'];
      case 5:
        return ['time', 'HH:mm'];
      case 6:
        return ['time', 'HH:mm:ss'];
      case 7:
        return ['date', 'MM-DD'];
      case 8:
        return ['year', 'YYYY'];
      case 12:
        return ['year', 'YYYY年'];
      case 9:
        return ['month', 'MM'];
      default:
        return ['date', 'YYYY-MM-DD'];
    }
  };
  const ChangeMainData = (atPara: AtPara, key: string) => {
    frmConfigs.mainData[key] = atPara.GetValStrByKey(key);
    frmConfigs.mainData.AtPara = atPara.GenerAtParaStrs();
  };

  InitPage();
  const handleUpdate = (updatedData) => {
    frmConfigs.mainData = updatedData;
  };
  const mainData = () => {
    return frmConfigs.mainData;
  };
  const spreadRef = shallowRef<InstanceType<typeof FrmFoolSpread>>(); //加载主表信息
  const tabRef = shallowRef<InstanceType<typeof FrmFoolTab>>();
  const dtlMergeRef = shallowRef<InstanceType<typeof FrmFoolDtlMerge>>();
  const tableRef = shallowRef<InstanceType<typeof FrmFoolTable>>();
  /**
   * 校验表单信息
   * @param isOnlySave
   */
  const VerifyFormData = async (isOnlySave = false) => {
    let attrFormList = [];
    let rowData: any = {};
    let result: any = [];
    if (!!spreadRef.value) result = spreadRef.value?.FrmFoolValidate();
    if (!!tabRef.value) result = tabRef.value?.FrmFoolValidate();
    if (!!dtlMergeRef.value) result = dtlMergeRef.value?.FrmFoolValidate();
    if (!!tableRef.value) result = tableRef.value?.FrmFoolValidate();
    if (!result || result.length < 2) return null;
    attrFormList = result[0];
    rowData = result[1];
    if (!!tabRef.value) {
      const result: any = tabRef.value?.FrmFoolValidate();
      attrFormList = result[0];
      rowData = result[1];
    }
    const resultData = await ConvertDataToDB(rowData, frmConfigs.mapAttrs as any);
    resultData.AtPara = frmConfigs.mainData.AtPara;

    //校验文本字段的输入长度是否超出数据库设置的长度
    let msg = '';
    frmConfigs.mapAttrs
      .filter((mapAttr) => mapAttr.MyDataType === DataType.AppString)
      .forEach((mapAttr) => {
        if (resultData[mapAttr.KeyOfEn] != null && resultData[mapAttr.KeyOfEn] != '' && resultData[mapAttr.KeyOfEn].length > mapAttr.MaxLen)
          msg += `字段[${mapAttr.Name}]输入字段的长度不能超过${mapAttr.MaxLen}位,`;
      });
    if (msg != '') {
      message.error(msg);
      return false;
    }
    frmConfigs.mapAttrs
      .filter(
        (mapAttr) =>
          mapAttr.MyDataType === DataType.AppInt ||
          mapAttr.MyDataType === DataType.AppFloat ||
          mapAttr.MyDataType === DataType.AppDouble ||
          mapAttr.MyDataType === DataType.AppMoney,
      )
      .forEach((mapAttr) => {
        let num = GetPara(mapAttr.AtPara, 'NumMax');
        if (!!num && resultData[mapAttr.KeyOfEn] > parseFloat(num)) {
          msg += '字段[' + mapAttr.Name + ']值不能大于值[' + num + ']';
        }
        num = GetPara(mapAttr.AtPara, 'NumMin');
        if (!!num && resultData[mapAttr.KeyOfEn] < parseFloat(num)) {
          msg += '字段[' + mapAttr.Name + ']值不能小于值[' + num + ']';
        }
      });
    if (msg != '') {
      message.error(msg);
      return false;
    }

    if (isOnlySave == false && props.fieldIsReadonly == false) {
      if ((await FrmFoolValidateByAuto(attrFormList)) == false) return null;
      if (FrmFoolValidate(resultData) == false) return null;
    }
    const componetRef = spreadRef.value || tabRef.value || dtlMergeRef.value || tableRef.value;
    if (!!componetRef) {
      if ((await componetRef.SaveAllDtl(isOnlySave)) == false) return null;
      if ((await componetRef.SaveAllAth(isOnlySave)) == false) return null;
      if ((await componetRef.SaveWorkCheck(isOnlySave)) == false) return null;
    }
    if ((await ComputedCongBiaoToMainTable(resultData)) == false) return null;
    return resultData;
  };
  /**
   *
   * @param attrFormList 正则表达校验根据Rules
   */
  const FrmFoolValidateByAuto = async (attrFormList) => {
    const errs: any = [];
    for (const attrForm of attrFormList) {
      const err = await attrForm?.validateForm();
      if (!!err) {
        errs.push(err);
      }
    }
    if (errs.length > 0) {
      let msg = '';
      errs.forEach((err) => {
        err['errorFields']?.forEach((item) => {
          const mapAttr = frmConfigs.mapAttrs.filter((mapAttr) => mapAttr.KeyOfEn === item['name'][0])[0];
          msg += '字段[' + mapAttr.Name + '],提示信息:' + item['errors'].join(',') + ',';
        });
      });
      message.error(msg);
      return false;
    }
    return true;
  };
  const FrmFoolValidate = (resultData: Record<string, any>) => {
    let msg = '';
    
    let resultM = '';
    frmConfigs.mapAttrs
      .filter((mapAttr) => mapAttr.UIIsInput === 1)
      .forEach((mapAttr) => {
        if (mapAttr.LGType === FieldTypeS.Enum) {
          if (mapAttr.UIContralType == UIContralType.CheckBok) {
            if (!resultData[mapAttr.KeyOfEn] || resultData[mapAttr.KeyOfEn] === '-1') msg += `字段${mapAttr.Name}值不能为空,`;
          } else if (resultData[mapAttr.KeyOfEn] === -1) msg += `字段${mapAttr.Name}值不能为空,`;
        } else if (resultData[mapAttr.KeyOfEn] === null || resultData[mapAttr.KeyOfEn] === '') {
          msg += `字段${mapAttr.Name}值不能为空,`;
        }
      });
    if (msg != '') {
      message.error(msg);
      return false;
    }
    //校验正则
    frmConfigs.mapAttrs
      .filter((mapAttr) => mapAttr.UIIsEnable === 1)
      .forEach((mapAttr) => {
        if (!!mapAttr['rules'] && mapAttr['rules'].length > 0) {
          mapAttr['rules'].forEach((item) => {
            let r = new RegExp(item['pattern'], 'g').test(resultData[mapAttr.KeyOfEn]);
            if (r == false) resultM += '字段' + mapAttr.Name + ':' + item.message;
          });
        }
      });
    if (resultM != '') {
      message.error(resultM);
      return false;
    }
    //检查字段附件
    const athFieldList = frmConfigs.mapAttrs.filter((attr) => attr.UIContralType == 6);
    for (const athField of athFieldList) {
      const rowKey = athField.KeyOfEn;
      const athNum = resultData?.[rowKey];
      const minUploadCount = (athField?.ath as Recordable)?.NumOfUpload || 0;
      const maxUploadCount = (athField?.ath as Recordable)?.TopNumOfUpload || 0;
      if (athNum == 0 && athField.UIIsInput == 1) {
        message.error(`字段附件 [${athField.Name}] 必须要上传文件`);
        return false;
      }
      if (minUploadCount > 0 && athNum == 0) {
        message.error(`字段附件 [${athField.Name}] 必须要上传文件`);
        return false;
      }
      if (athNum < minUploadCount) {
        message.error(`字段附件[${athField.Name}] 上传附件数小于最小数量 ${minUploadCount}`);
        return false;
      }
      if (athNum > maxUploadCount) {
        message.error(`字段附件[${athField.Name}] 上传附件数大于最大数量 ${minUploadCount}`);
        return false;
      }
    }
  };
  /**
   * 从表分页时对主表根据从表列计算
   */
  const ComputedCongBiaoToMainTable = async (resultData) => {
    //判断是否存在主表对从表列计算，且从表分页的情况
    const mapExts = frmConfigs.mapExts.filter((mapExt) => mapExt.ExtType === 'NumEnterLimit' && mapExt.DoWay === '1');
    if (mapExts.length == 0) return true;
    const dtls = frmConfigs.dtls.filter((dtl) => GetPara(dtl.AtPara, 'PageSize') != '0');
    if (dtls.length == 0) return true;
    try {
      for (const mapExt of mapExts) {
        const mydtl = dtls.find((dtl) => dtl.No === mapExt.Doc);
        if (!!mydtl) {
          //计算从表的值 AttrOfOper Tag
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
          handler.AddPara('KeyOfEn', mapExt.Tag1);
          handler.AddPara('Oper', mapExt.Tag);
          handler.AddPara('PTable', mydtl.PTable);
          let refPKVal = frmConfigs.mainData['OID'];
          if (refPKVal == null || !refPKVal) refPKVal = frmConfigs.mainData['No'];
          handler.AddPara('RefPKVal', refPKVal);
          const data = await handler.DoMethodReturnString('Dtl_ComputeForMainTable');
          frmConfigs.mainData[mapExt.AttrOfOper] = data;
          resultData[mapExt.AttrOfOper] = data;
        }
      }
      return true;
    } catch (e) {
      message.error(('主表对从表列计算失败:' + e) as string);
      return false;
    }
  };
  defineExpose({ VerifyFormData, mainData, handleUpdate });

  onMounted(async () => {
    Event.on('InitFrm', async () => {
      const en = new MapFrmFool();
      en.setPKVal(frmConfigs.mapData?.No);
      await en.Retrieve();
      isLoadComplete.value = false;
      frmConfigs.mapData = Object.fromEntries(en.Row) as MapData;
      await InitPage();
    });
    const args: Record<string, any> | null = await FrmBodyLoadAfter.FrmBodyLoadAfter(frmConfigs.mapData?.No, props.params.WorkID, frmConfigs.mainData, frmConfigs.mapAttrs);
    if (!!args) {
      frmConfigs.mainData = args?._bodyJson;
      frmConfigs.mapAttrs = args?._attrs;
    }
  });
  // Event.on('InitPage', InitPage);
  onUnmounted(() => {
    Event.off('InitFrm');
    watermark('');
  });
</script>

<style lang="less" scoped>
  ::v-deep .form-title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    // height: 80px;
    // line-height: 80px;
    font-weight: 600;
    font-size: 18px;
    padding: 14px;

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

  ::v-deep .title-text {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  :deep(.ant-card-body) {
    padding: 6px 24px;
  }

  ::v-deep .GroupBar {
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
  ::v-deep .GroupTitle {
    margin: 10px 0;
    border-radius: 5px;
    background-color: #e3dbd7;
  }
  //第一套样式
  ::v-deep .defaultFrmTitle1 {
    width: 100%;
  }
  ::v-deep .defaultGroupTitle1 {
    // padding: 5px 0;
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

  ::v-deep .defaultfrmContent2 {
    background-color: #2d2d2e !important;
  }
  ::v-deep .defaultFrmTitle2 {
    & img {
      display: none;
    }
    & p {
      height: 60px;
      color: #fff;
    }
  }
  ::v-deep .defaultGroupTitle2 {
    position: relative;
    border-radius: 0;
    // border-bottom: 2px solid #e3dbd7;
    // background: #fff;
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
      // background: linear-gradient(to right, #e6e6e6, #7ea9f0);
      background: linear-gradient(to right, #905e18, #fea101);
      transform: skew(-30deg);
    }
    & span {
      padding-left: 50px;
    }
  }
  ::v-deep .defaultFrmstyle2 {
    color: #fff;
    :deep(.ant-form-item-control) {
      //日期input框
      .ant-picker.ant-picker-disabled {
        background-color: #4a4a4a;
        input {
          background-color: #4a4a4a;
        }
      }
      .frmStyleType {
        background-color: #2c2b2e;
        border-color: #9e9b9b;
        color: #b8b8b8;
        input {
          color: #b8b8b8;
          background-color: #2c2b2e;
        }
        label {
          color: #b8b8b8;
        }
        .ant-picker-suffix {
          color: #b8b8b8;
        }
        //下拉菜单
        .ant-select-selector {
          background-color: #2c2b2e;
        }
        .ant-select-arrow {
          color: #b8b8b8;
        }
      }
    }
    //文本框
    :deep(.ant-input-affix-wrapper) {
      background-color: #2c2b2e;
      border-color: #9e9b9b;
    }
    :deep(.ant-input-affix-wrapper-disabled) {
      background-color: #454545;
      border-color: #5b5b5b;
      input {
        color: #b8b8b8;
        background-color: #454545 !important;
      }
    }
    :deep(.ant-form-item-label label) {
      color: #b8b8b8;
    }
  }
  //第三套样式
  ::v-deep .defaultFrmTitle3 {
    & img {
      display: none;
    }
    & p {
      height: 60px;
    }
  }
  ::v-deep .defaultGroupTitle3 {
    background: #fff;
  }
  //第四套样式
  ::v-deep .defaultFrmTitle4 {
    & img {
      display: none;
    }
    & p {
      height: 60px;
    }
  }
  ::v-deep .defaultGroupTitle4 {
    border-radius: 0;
    border-bottom: 1px solid #e3dbd7;
    background-color: #fff;
  }
  ::v-deep .defaultFrmstyle4 {
    :deep(.ant-form-item) {
      flex-direction: column;
    }
    :deep(.ant-form-horizontal .ant-form-item-control) {
      flex: 1;
    }
    :deep(.ant-form-item-label) {
      text-align: left;
    }
  }

  //第五套样式
  ::v-deep .defaultfrmContent5 {
  }
  ::v-deep .defaultFrmTitle5 {
  }
  ::v-deep .defaultGroupTitle5 {
    border: 1px solid #e3dbd7;
    background-color: #fff !important;
    border-radius: 0 !important;
  }
  ::v-deep .defaultFrmstyle5 {
    // border: 1px solid #e0e0e0;
    .ant-form {
      .ant-row {
        margin: 0 !important;
        row-gap: unset !important;
        .ant-col {
          padding: 0 !important;
          height: 100%;
          // background-color: #f7f7f7;
          .ant-form-item {
            border: 1px solid #e0e0e0;
            height: 100%;
            line-height: 36px;
            margin: 0 !important;
            .ant-form-item-label {
              background-color: #f7f7f7;
            }
            label {
              padding-left: 5px;
              padding-right: 5px;
            }
          }
        }
        .ant-form-item-control {
          .ant-input-number {
            .ant-input-number-input {
              vertical-align: unset;
            }
          }
        }
      }
    }
    :deep(.ant-form-item-control) {
      //日期input框
      .ant-picker {
        border-radius: 0;
        border: none;
        min-height: 35px;
      }
      .ant-picker.ant-picker-disabled {
        input {
          min-height: 27px;
        }
      }
      .ant-input {
        border-radius: 0;
        // border: none !important;
      }
    }
    //文本框
    :deep(.ant-input-affix-wrapper) {
      border-color: transparent;
      border-radius: 0;
      input.ant-input {
        min-height: 26px;
      }
    }
    :deep(.ant-input-affix-wrapper-disabled) {
      border-color: transparent;
      input {
        min-height: 26px;
      }
    }
    :deep(.ant-input-number) {
      border: none;
      border-radius: 0;
    }
    :deep(.ant-input-number .ant-input-number-input) {
      min-height: 36px;
    }
    :deep(.ant-input-number-group-addon) {
      border-left: 1px solid #d9d9d9;
      border-right: 1px solid #d9d9d9;
    }
    :deep(.ant-input-group) {
      .pop_intput_div {
        min-height: 36px;
        border: none;
        border-radius: 0;
        width: calc(100% - 44px) !important;
      }
    }
  }

  ::v-deep .shuiyin {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
  }
  ::v-deep .shuiyin-item {
    color: #999;
    pointer-events: none;
    display: inline-block;
    width: 300px;
    height: 50px;
    line-height: 50px;
    font-size: 20px;
    transform: rotateZ(-45deg);
  }
  ::v-deep .online-users {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid #ccc;
    .title {
      font-size: 14px;
      font-weight: bold;
      color: #444;
    }
    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-left: 12px;
      cursor: pointer;
    }
  }
  ::v-deep .glyphicon {
    margin-right: 10px;
  }
  ::v-deep .tab_fwc {
    display: flex;
    flex-direction: column;
  }
  ::v-deep .groupTableTitle {
    text-align: center;
    vertical-align: middle;
    height: auto;
    justify-content: center;
    align-items: center;
    display: grid;
    border: solid 1px #ccc;
    border-right: none;
  }
  ::v-deep .CHLab {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 10px;
  }
  ::v-deep .EnLab {
    text-orientation: upright;
    text-combine-upright: all;
  }

  ::v-deep .split-layout {
    display: flex;
    gap: 10px;
    border-radius: 12px;
    min-height: calc(100vh - 150px);
  }
  ::v-deep .left-pane {
    background: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0;
    width: 64%;
    padding: 4px 10px;
  }
  ::v-deep .right-pane {
    background: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0;
    width: 36%;
    padding: 4px 10px;
  }
</style>
