import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { DBEnums } from '../Admin/FoolFormDesigner/props/database/DatabaseFormItem';
import { MapExt } from '/#/entity';
import { MapAttr } from '/#/entity';
import { computed, ref, StyleValue } from 'vue';
import { DealExp, GetPara, IsMobile } from '/@/utils/gener/StringUtils';
import { RuleObject } from 'ant-design-vue/es/form';
import { DecryptVal, EncryptVal } from '/@/DataUser/OverrideFiles/CCFormRef';
import { FrmConfig, GroupFieldExt } from './FrmFool/frm';
import { message } from 'ant-design-vue';
//下拉列表的接口
export interface ddlInfo {
  value: string | number;
  label: string;
}

//字段属性扩展的接口
export interface MapAttrExt extends MapAttr {
  ddl: Array<ddlInfo>; //这对枚举外键的选项
  mapExts: Array<MapExt>; //扩展属性
  format: string; //针对日期、时间类型的设置
  clearable: boolean; // 是否清空
  suffix: string; //后缀提示
  tracks: [];
  ath: {
    IsUpload: string | number;
  } | null;
  type: string; //字段类型
  eleDBs: Array<Recordable>;
  UIIsEnable: number;
  bit: number;
  mode: string;
  rules: Array<RuleObject>;
}

/**
 * 数据类型转换
 */
export function userConvertData() {
  /**
   * 转换数据类型保存到数据库
   * @param mainData
   * @param mapAttrs
   * @constructor
   */
  const ConvertDataToDB = async (mainData: Record<string, any>, mapAttrs: Array<MapAttrExt> | Array<MapAttr>) => {
    const result: Record<string, any> = {};
    for (const key in mainData) {
      result[key] = mainData[key];
    }
    for (const mapAttr of mapAttrs) {
      if (mapAttr.MyDataType === DataType.AppBoolean) {
        result[mapAttr.KeyOfEn] = typeof mainData[mapAttr.KeyOfEn] === 'boolean' ? mainData[mapAttr.KeyOfEn] : parseInt(mainData[mapAttr.KeyOfEn]) === 1 ? 1 : 0;
        continue;
      }
      if (Array.isArray(mainData[mapAttr.KeyOfEn])) {
        result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn].join(',');
        continue;
      }
      result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn];
      if (!!mapAttr.AtPara && mapAttr.AtPara.includes('IsEncrypt=1') == true) {
        result[mapAttr.KeyOfEn] = await EncryptVal(mapAttr.KeyOfEn, result[mapAttr.KeyOfEn]);
        continue;
      }
    }
    return result;
  };
  /**
   * 转换数据类型在页面展示
   * @param mainData
   * @param mapAttrs
   * @constructor
   */
  const ConvertDataFromDB = async (mainData: Record<string, any>, mapAttrs: Array<MapAttrExt> | Array<MapAttr>) => {
    const result: Record<string, any> = {};
    for (const key in mainData) {
      result[key] = mainData[key];
    }
    const { isTextSelect } = useKeyOfEnType(false);
    for (const mapAttr of mapAttrs) {
      if (mapAttr.MyDataType === DataType.AppBoolean) {
        if(parseInt(GetPara(mapAttr.AtPara,'CheckModel') || '0') ===0)
          result[mapAttr.KeyOfEn] = parseInt(mainData[mapAttr.KeyOfEn]) !== 0;
        else   result[mapAttr.KeyOfEn] = parseInt(mainData[mapAttr.KeyOfEn]);
        continue;
      }
      if (mapAttr.LGType === FieldTypeS.Enum) {
        if (mapAttr.UIContralType === UIContralType.CheckBok) {
          //如果mapAttr中ddl集合不为空时
          let isStringEnum = false;
          if (mapAttr['ddl'] && mapAttr['ddl'].length != 0 && typeof mapAttr['ddl'][0].value === 'string') isStringEnum = true;
          if(!mainData[mapAttr.KeyOfEn]){
             result[mapAttr.KeyOfEn] = [];
             result[mapAttr.KeyOfEn+'T'] = [];
             continue;
          }
          if (isStringEnum === false)
            result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn]
              .toString()
              .split(',')
              .map((item) => item * 1);
          else result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn].toString().split(',');
          if (mapAttr['ddl'] && mapAttr['ddl'].length != 0) {
            const val: string[] = [];
            mapAttr['ddl'].forEach((item) => {
              if (result[mapAttr.KeyOfEn].includes(item.value) == true) val.push(item.label);
            });
            //获取文本
            result[mapAttr.KeyOfEn + 'T'] = val.join(',');
          }
          continue;
        }
        result[mapAttr.KeyOfEn + 'T'] = result[mapAttr.KeyOfEn + 'Text'];
        continue;
      }

      if (mapAttr.UIContralType === UIContralType.DDL && mapAttr.LGType != FieldTypeS.Enum && mainData[mapAttr.KeyOfEn] == null) {
        result[mapAttr.KeyOfEn] = '';
        continue;
      }
      if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
        //不存在小数为数补0；
        const val = mainData[mapAttr.KeyOfEn];
        if (val === 0 || !!val) result[mapAttr.KeyOfEn] = parseFloat(val).toFixed(mapAttr['bit']);
        else result[mapAttr.KeyOfEn] = '';
        continue;
      }

      if (isTextSelect(mapAttr as MapAttrExt)) {
        if (mainData[mapAttr.KeyOfEn] == null || mainData[mapAttr.KeyOfEn] === '') result[mapAttr.KeyOfEn] = [];
        else {
          //如果mapAttr中ddl集合不为空时
          let isStringEnum = false;
          if (mapAttr['ddl'].length != 0 && typeof mapAttr['ddl'][0].value === 'string') isStringEnum = true;
          if (isStringEnum === false)
            result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn]
              .toString()
              .split(',')
              .map((item) => item * 1);
          else result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn].toString().split(',');
        }
        continue;
      }
      if (!!mapAttr.AtPara && mapAttr.AtPara.includes('IsEncrypt=1') == true) {
        result[mapAttr.KeyOfEn] = await DecryptVal(mapAttr.KeyOfEn, mainData[mapAttr.KeyOfEn]);
        continue;
      }
      result[mapAttr.KeyOfEn] = mainData[mapAttr.KeyOfEn];
    }
    return result;
  };
  return {
    ConvertDataToDB,
    ConvertDataFromDB,
  };
}
/**
 * 判断字段类型
 */
export function useKeyOfEnType(isReadonly) {
  //下拉框
  const isDDL = (mapAttr: MapAttrExt) =>
    (mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) ||
    mapAttr.LGType === FieldTypeS.FK ||
    //枚举下拉框
    (mapAttr.LGType === FieldTypeS.Enum && mapAttr.UIContralType === UIContralType.DDL);

  //枚举
  const isRadio = (mapAttr: MapAttrExt) => mapAttr.LGType === FieldTypeS.Enum && mapAttr.UIContralType === UIContralType.RadioBtn;
  //多选复选框
  const isCheckBoxs = (mapAttr: MapAttrExt) => mapAttr.LGType === FieldTypeS.Enum && mapAttr.UIContralType === UIContralType.CheckBok;
  //单选复选框
  const isBool = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppBoolean;
  //Int型
  const isInt = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppInt && mapAttr.LGType === FieldTypeS.Normal;
  //浮点型
  const isFloat = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble;
  //金额型
  const isMoney = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppMoney;
  //是否数值型
  const isNumber = (mapAttr: MapAttrExt) =>
    ((mapAttr.MyDataType === DataType.AppInt ||
      mapAttr.MyDataType === DataType.AppFloat ||
      mapAttr.MyDataType === DataType.AppDouble ||
      mapAttr.MyDataType === DataType.AppMoney) &&
      mapAttr.LGType === FieldTypeS.Normal) ||
    (mapAttr.MyDataType === DataType.AppInt && mapAttr.LGType === FieldTypeS.Enum);
  //日期型
  const isDate = (mapAttr: MapAttrExt) => {
    return mapAttr.MyDataType === DataType.AppDate;
  };

  //日期时间型
  const isDateOrDateTime = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime;
  // @ts-ignore
  /********************************************文本类型***************************************************************/
  //@0=普通文本@1=密码框@2=大文本@3=富文本
  const isTextBox = (mapAttr: MapAttrExt) =>
    mapAttr.MyDataType === DataType.AppString &&
    (mapAttr.UIContralType === UIContralType.TB || mapAttr.UIContralType === UIContralType.IDCard) &&
    (!mapAttr.TextModel || mapAttr.TextModel === 0);

  const isTextPop = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return (
          ['PopSelfUrl','PopBranchesAndLeaf','PopTable','PopTableSimple','PopGroupList','PopTableList'].includes(mapExt['DoWay'].toString())
          ||(mapExt['DoWay'] === 'PopBranches' && (IsMobile() === true || (!mapExt.AtPara.includes('ShowModel=1') && IsMobile() == false)))
        );
      }).length > 0
    );
  };

  const isTextPopSelect = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['DoWay'] === 'PopBranches' && mapExt.AtPara.includes('ShowModel=1');
      }).length > 0
    );
  };
  const isTextSelect = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return (
          mapExt['ExtType'] === 'PopBindSFTable' ||
          mapExt['ExtType'] === 'PopBindEnum' ||
          //mapExt['ExtType'] === 'PopTableList' ||
          (mapExt['ExtType'] === 'PopBranches' && mapExt.AtPara.includes('ShowModel==1'))
        );
      }).length > 0
    );
  };
  const isTextChoiceSearch = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'MultipleChoiceSearch';
      }).length > 0
    );
  };
  //自动完成
  const isAutoCompleteSimple = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0 || mapAttr.UIIsEnable == 0 || isReadonly) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'TBFullCtrl' && mapExt['DoWay'] === 'Simple';
      }).length > 0
    );
  };
  const isAutoCompleteTable = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0 || mapAttr.UIIsEnable == 0 || isReadonly) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'TBFullCtrl' && mapExt['DoWay'] === 'Table';
      }).length > 0
    );
  };
  //字段值链接
  const isReadOnlyLink = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'ReadOnlyLink' && mapExt['DoWay'] != '0';
      }).length > 0 &&
      (isReadonly || mapAttr.UIIsEnable === 0)
    );
  };
  //密码框
  const isPassword = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.TB && mapAttr.TextModel === 1;
  //大文本
  const isTextArea = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.TB && mapAttr.TextModel === 2;
  //富文本
  const isRich = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.TB && mapAttr.TextModel === 3;
  //大块说明文本
  const isBigText = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.FrmHtml;
  /*********************************************组件***************************************************************/
  //地图
  const isMap = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.MapPin;
  //颜色组件
  const isLabColor = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.LabColor && mapAttr.KeyOfEn.includes('LabColor');
  //字段附件
  const isFileAth = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.AthShow;
  //手写签字版
  const isHandWriting = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.HandWriting;
  //是否是超链接
  const isLink = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.HyperLink;
  //是否是按钮
  const isBtn = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.Btn;
  //身份证
  const isIDCard = (mapAttr: MapAttrExt) =>
    mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.IDCard && isReadonly == false && mapAttr.KeyOfEn.includes('Address');
  //定位
  const isFix = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.Fixed;

  //流程进度图
  const isJobSchedule = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.JobSchedule;
  //评分
  const isScore = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.Score;
  //签批字段
  const isSignCheck = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.SignCheck;
  //图片
  const isPic = (mapAttr: MapAttrExt) => mapAttr.UIContralType === UIContralType.FrmImg;
  //关联流程单据
  const isRelatedDocs = (mapAttr: MapAttrExt) => mapAttr.UIContralType === DBEnums.LinkRefFlow;
  //评论
  const isReview = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.FlowBBS;

  //公文字号.
  const isWordNum = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.WordNum;

  //公文正文组件.
  const isGovDocFile = (mapAttr: MapAttrExt) => mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.GovDocFile;

  // 图片附件
  const isSinglePic = (mapAttr: MapAttrExt) => mapAttr.UIContralType === UIContralType.FrmImgAth;

  //保密格式
  const isKeepSecret = (mapAttr: MapAttrExt) => {
    if (mapAttr.UIIsEnable == 1 && isReadonly == false) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'KeepSecret';
      }).length > 0
    );
  };
  //电话格式
  const isTelFormat = (mapAttr: MapAttrExt) => {
    if (mapAttr.UIIsEnable == 1 && isReadonly == false) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'FieldFormat' && mapExt['DoWay'] === 'Tel' && IsMobile();
      }).length > 0
    );
  };
  //邮件格式
  const isEmailFormat = (mapAttr: MapAttrExt) => {
    if (mapAttr.UIIsEnable == 1 && isReadonly == false) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'FieldFormat' && mapExt['DoWay'] === 'Email';
      }).length > 0
    );
  };
  //地址格式
  const isAddrFormat = (mapAttr: MapAttrExt) => {
    if (mapAttr.UIIsEnable == 1 && isReadonly == false) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'FieldFormat' && mapExt['DoWay'] === 'Addr';
      }).length > 0
    );
  };
  //日历格式
  const isCalendarFormat = (mapAttr: MapAttrExt) => {
    if (mapAttr.UIIsEnable == 1 && isReadonly == false) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'FieldFormat' && mapExt['DoWay'] === 'Calendar' && IsMobile();
      }).length > 0
    );
  };
  //是否级联
  const isCascader = (mapAttr: MapAttrExt) => {
    //if (mapAttr.UIIsEnable == 0 || isReadonly == true) return false;
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'Cascader';
      }).length > 0
    );
  };
  //快速录入
  const isFastInput = (mapAttr: MapAttrExt) => {
    if (mapAttr.mapExts == undefined || mapAttr.mapExts.length == 0) return false;
    return (
      mapAttr.mapExts.filter((mapExt) => {
        return mapExt['ExtModel'] === 'FastInput' && mapExt['DoWay'] === '1';
      }).length > 0
    );
  };
  return {
    isDDL,
    isRadio,
    isCheckBoxs,
    isBool,
    isInt,
    isFloat,
    isMoney,
    isNumber,
    isDate,
    isDateOrDateTime,
    isTextBox,
    isTextPop,
    isTextPopSelect,
    isTextSelect,
    isTextChoiceSearch,
    isAutoCompleteSimple,
    isAutoCompleteTable,
    isReadOnlyLink,
    isPassword,
    isTextArea,
    isRich,
    isBigText,
    isMap,
    isFileAth,
    isHandWriting,
    isLink,
    isBtn,
    isIDCard,
    isFix,
    isJobSchedule,
    isScore,
    isSignCheck,
    isPic,
    isSinglePic,
    isRelatedDocs,
    isReview,
    isGovDocFile,
    isKeepSecret,
    isTelFormat,
    isEmailFormat,
    isAddrFormat,
    isCalendarFormat,
    isWordNum,
    isCascader,
    isFastInput,
    isLabColor,
  };
}

/**
 * mapExts分组
 * @param mapExts
 * @constructor
 */
export function GetMapExtsGroup(mapExts: Array<MapExt>, frmID = '') {
  const map = ref<Record<string, any>>({});
  if (!mapExts) return map;
  const mypk = ref<string>();
  //对mapExt进行分组，根据AttrOfOper
  const exts = mapExts.filter((mapExt) => {
    if (
      mapExt.AttrOfOper != '' &&
      mapExt.ExtType != 'DtlImp' &&
      mapExt.MyPK.indexOf(mapExt.FK_MapData + '_Table') == -1 &&
      mapExt.MyPK.indexOf('PageLoadFull') == -1 &&
      mapExt.ExtType != 'StartFlow' &&
      mapExt.ExtType != 'AutoFullDLL' &&
      mapExt.ExtType != 'ActiveDDLSearchCond' &&
      mapExt.ExtType != 'AutoFullDLLSearchCond' &&
      mapExt.ExtType != 'HtmlText' &&
      mapExt.ExtModel != 'SearchCol' &&
      mapExt.ExtModel != 'MobileSearchCol' &&
      mapExt.ExtModel != 'FieldNumColor'
      //mapExt.ExtType != 'RegularExpression'
    ) {
      if (!frmID) frmID = mapExt.FK_MapData;
      //const extModels = ['MultipleChoiceSmall', 'SingleChoiceSmall', 'MultipleChoiceSearch', 'DateFieldInputRole', 'NumEnterLimit', 'AutoFull'];
      if (mapExt?.DoWay != 'None' && mapExt?.DoWay != '0') {
        if (!!mapExt?.RefPKVal && mapExt?.RefPKVal != frmID + '_' + mapExt.AttrOfOper) {
          //如果是启用的就不处理
          const len = mapExts.filter((item) => item.MyPK == mapExt?.RefPKVal && item?.DoWay != 'None' && item?.DoWay != '0').length;
          if (len != 0) return mapExt;
        } else {
          return mapExt;
        }

        //DoWay=0是禁用状态
        //if (parseInt(mapExt?.DoWay) !== 0) return mapExt;
      } //else return mapExt;
    }
  });
  exts.forEach((mapExt) => {
    mypk.value = mapExt.FK_MapData + '_' + mapExt.AttrOfOper;
    if (mapExt.ExtType === 'AutoFull') {
      //获取@的字段
      const targets: string[] = [];
      let index = -1;
      for (let i = 0; i < mapExt.Tag.length; i++) {
        const c = mapExt.Tag.charAt(i);
        if (c == '(') {
          index++;
        } else if (c == ')') {
          targets.push(mapExt.Tag.substring(index + 1, i));
          i++;
          index = i;
        } else if (/[\+\-|*\/]/.test(c)) {
          targets.push(mapExt.Tag.substring(index + 1, i));
          index = i;
        }
      }
      if (index + 1 < mapExt.Tag.length) {
        targets.push(mapExt.Tag.substring(index + 1, mapExt.Tag.length));
      }
      targets.forEach((item) => {
        if (item.includes('@')) {
          mypk.value = mapExt.FK_MapData + '_' + item.substring(1);
          if (!map[mypk.value]) map[mypk.value] = [mapExt];
          else map[mypk.value].push(mapExt);
        }
      });
    } else if (mapExt.ExtType === 'ReqDays') {
      mypk.value = mapExt.FK_MapData + '_' + mapExt.Doc;
      if (!map[mypk.value]) map[mypk.value] = [mapExt];
      else map[mypk.value].push(mapExt);

      mypk.value = mapExt.FK_MapData + '_' + mapExt.Tag1;
      if (!map[mypk.value]) map[mypk.value] = [mapExt];
      else map[mypk.value].push(mapExt);
    } else {
      if (!map[mypk.value]) map[mypk.value] = [mapExt];
      else map[mypk.value].push(mapExt);
    }
  });
  return map;
}

export function useFrmFoolMethod(frmConfigs:FrmConfig,autoLayout:boolean,isSetHeight?:boolean,fwcRight?:boolean,FWCGroupFiled?:GroupFieldExt) {
  /**
   * 获取分组下的字段集合
   * @param groupOID 分组OID
   * @constructor
   */
  const GetMapAttrsByGroupIDExt = (groupOID: number|string) => {
    if (!groupOID) return frmConfigs.mapAttrs; //.filter((attr) => !!attr.UIVisible);
    const curAttrs = frmConfigs.mapAttrs.filter((attr) => attr.UIVisible && parseInt(attr.GroupID) === parseInt(groupOID));
    if (curAttrs.length == 0) {
      frmConfigs.gfs.forEach((gf) => {
        if (gf.OID == groupOID) gf.ShowType = 2;
      });
    }
    if (curAttrs.length > 0) {
      frmConfigs.gfs.forEach((gf) => {
        if (gf.OID == groupOID) gf.ShowType = 0;
      });
    }
    return frmConfigs.mapAttrs.filter((attr) => parseInt(attr.GroupID) === parseInt(groupOID));
  };
    /**
   * 对从表求值
   * @constructor
   */
  const GetDtlMapExt = (dtlNo) => {
    const exts = frmConfigs.mapExts.filter((mapExt) => {
      if ((mapExt.ExtModel === 'NumEnterLimit' || mapExt.ExtModel === 'DateFiledMaxMin') && mapExt.Doc === dtlNo) {
        const mapAttr = frmConfigs.mapAttrs.filter((mapAttr) => mapAttr.KeyOfEn == mapExt.AttrOfOper)[0];
        mapExt.Tag6 = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
        return mapExt;
      }
    });
    return exts || [];
  };
  /**
   * 自定义url
   * @param mapDtl
   * @constructor
   */
  const GetIFrameSrc = (mapDtl,params,fieldIsReadonly) => {
    let url = mapDtl.UrlDtl || '';
    if (url === '') {
      message.error('从表' + mapDtl.Name + '没有设置URL');
      return url;
    }
    if (!url.includes('?')) url += '?1=1';
    url = DealExp(url, frmConfigs.mainData, false, true);
    url = url.replaceAll('+', '%2B');
    let urlParam = '';
    for (const key in params) {
      if (url.includes(key + '=') || key === 'EnsName' || key === 'RefPKVal' || key === 'FK_MapData' || key === 'IsReadonly') continue;
      urlParam += '&' + key + '=' + params[key];
    }
    if (url.includes('EnsName=') == false) url += '&EnsName=' + mapDtl.No;
    if (url.includes('RefPKVal=') == false) url += '&RefPKVal=' + params.WorkID;
    if (url.includes('FK_MapData=') == false) url += '&FK_MapData=' + mapDtl.FK_MapData;
    if (url.includes('IsReadonly=') == false) url += '&IsReadonly=' + (fieldIsReadonly == true ? 1 : 0);
    url += urlParam + '&Version=1&FrmType=0';
    return url;
  };
  /**
   * 表单样式
   */
  const getStyle = computed(() => {
    const style = {
      paddingTop: '5px',
    };
    if (!autoLayout) {
      style['minHeight'] = isSetHeight ? 'calc(100vh - 150px)' : 'auto';
    }
    if(!FWCGroupFiled || fwcRight==false){
      const w = document.querySelector('.content')?.clientWidth || 0;
      style['backgroundColor'] = 'white';
      if(w >= frmConfigs.mapData.FrmW)
         style['width'] = frmConfigs.mapData.FrmW+'px';
      style['margin'] = 'auto';
    }
    return style;
  });
  /**
   * 分组样式
   */
  const groupBarCurStyle = computed(() => {
    return {
      padding: '0',
      minHeight: '0',
      height: '0',
      overflow: 'hidden',
    } as StyleValue;
  });
  return{
    GetMapAttrsByGroupIDExt,
    GetDtlMapExt,
    GetIFrameSrc,
    getStyle, //表单样式
    groupBarCurStyle, // 分组样式
  }
}
