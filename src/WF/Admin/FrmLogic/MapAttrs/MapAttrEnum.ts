import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttr';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_FieldNameLink } from '../MapExt/FieldNameLink/GPE_FieldNameLink';
import { GPE_ActiveDDL } from '../MapExt/ActiveDDL/GPE_ActiveDDL';
import { GPE_DDLFullCtrlts } from '../MapExt/DDLFullCtrl/GPE_DDLFullCtrlts';
import { GPE_PageLoadFullDDL } from '../MapData/PageLoadFull/GPE_PageLoadFullDDL';
import { MapExtAttr } from '../MapExt';
import { GPE_RadioBtns } from '../MapExt/RadioBtns/GPE_RadioBtns';
import { GPE_EnumHidItems } from '../MapExt/EnumHidItems/GPE_EnumHidItems';
import WebUser from '/@/bp/web/WebUser';
import { SysEnums } from '../SysEnum/SysEnum';
import { SysEnumLangs } from '../SysEnum/SysEnumLang';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { MapFrmFool } from '../MapData/MapFrmFool';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrEnum extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrEnum', 'BP.Sys.FrmUI.MapAttrEnum');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapAttr', '枚举字段');

    map.AddGroupAttr('基础信息');
    map.AddMyPK(true);
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);
    map.AddTBString(MapAttrAttr.UIBindKey, null, '枚举ID', true, true, 0, 150, 20);
    map.AddTBString(MapAttrAttr.DefVal, null, '默认值', true, false, 0, 100, 20);

    // map.AddDDLSysEnum(MapAttrAttr.UIContralType, 0, '控件类型', true, true, 'EnumUIContralType', '@1=下拉框@2=复选框@3=单选按钮');
    // map.AddDDLSysEnum('RBShowModel', 3, '单选按钮的展现方式', true, true, 'RBShowModel', '@0=竖向@3=横向');
    //map.AddDDLSysEnum(MapAttrAttr.LGType, 0, "逻辑类型", true, false, MapAttrAttr.LGType,
    // "@0=普通@1=枚举@2=外键@3=打开系统页面");
    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.SetHelperAlert(MapAttrAttr.UIWidth, '对自由表单,从表有效,显示文本框的宽度.');
    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见?', true, true);
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑?', true, true);
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);

    // map.AddGroupAttr('移动端');
    map.AddBoolean('IsLabLine', false, '移动端:标题独占一行?', true, true);
    map.AddBoolean('DtlIsRepeat', false, '从表:选择项目不允许重复?', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);
    const help = `
    #### 帮助
    - 在从表的输入过程中，该列不允许重复输入。
    - 比如:初步原因分析,在多行数据,该单据的从表数据不能重复.
    - 就是说不能一个item出现在从表记录中两次.
    `;
    map.SetHelperAlert('DtlIsRepeat', help);
    map.AddTBAtParas(3000);
    map.ParaFields = ',IsLabLine,DtlIsRepeat,';

    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_ActiveDDL(), 'icon-docs');

    // ? /src/WF/Comm/En.vue?EnName=tS.xxx?PKVal=xxx
    // map.AddRM_DtlSearch('编辑枚举值', new SysEnums(), SysEnumAttr.EnumKey, '', '', '', 'icon-grid', false, '&EnumKey=' + this.UIBindKey);
    //装载填充.
    map.AddRM_GPE(new GPE_PageLoadFullDDL(), 'icon-drawer');

    //帮助弹窗显示
    map.AddRM_GPE(new GPE_FieldNameLink(), 'icon-link');
    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');
    map.AddRM_GPE(new GPE_RadioBtns(), 'icon-control-forward');

    // map.AddRM_UrlTabOpen('联动控件', '/@/WF/Admin/FrmLogic/Views/RadioBtns.vue');
    map.AddGroupMethod('填充设置');
    map.AddRM_GPE(new GPE_DDLFullCtrlts(), 'icon-energy');
    map.AddRM_GPE(new GPE_EnumHidItems(), 'icon-ghost');

    map.AddMapLoader(async () => {
      map.AddGroupMethod('枚举值');
      if (WebUser.CCBPMRunModel != 0) {
        map.AddRM_EnOnly('编辑枚举值', 'TS.FrmUI.SysEnumMainInt', WebUser.OrgNo + '_@UIBindKey', 'icon-pencil');
      } else {
        map.AddRM_EnOnly('编辑枚举值', 'TS.FrmUI.SysEnumMainInt', '@UIBindKey', 'icon-pencil');
      }
      console.log(this.Row);
      map.AddRM_DtlBatch('枚举值颜色', new SysEnums(), 'EnumKey', '', '', 'icon-star', '&EnumKey=' + this.Row.GetValByKey('UIBindKey'));
      map.AddRM_DtlBatch('国际化', new SysEnumLangs(), 'EnumKey', '', '', 'icon-globe', '&EnumKey=' + this.Row.GetValByKey('UIBindKey'));

      const rm2 = new RefMethod();
      rm2.Title = 'AI翻译辅助';
      rm2.ClassMethod = 'SysLange';
      rm2.Icon = 'icon-check';
      rm2.RefMethodType = RefMethodType.Func;
      rm2.HisMap.AddTBString('SysNo', 'En', '请输入要翻译的语言编号en英语,ft繁体,ja日本', true, false, 0, 100, 100, true, '');
      // rm2.HisMap.AddTBString('EnumKey',  this.Row.GetValByKey('UIBindKey'), 'UIEnky', true, false, 0, 100, 100, true, '');

      map.AddRefMethod(rm2);
    });

    // map.AddGroupMethod('实验中');
    // map.AddRM_UrlRightFrameOpen('编辑枚举值', '/src/WF/Admin/FrmLogic/SysEnum/EnumInt.vue?No=@UIBindKey', 'icon-drop');

    // map.AddRM_DtlSearch('填充下拉框', new FullDataDDLs(), 'RefPKVal', null, null, '', 'icon-user', false);
    // map.AddRM_DtlSearch('填充从表', new FullDataDtls(), 'RefPKVal', null, null, '', 'icon-user', false);

    // //.选项联动
    // map.AddGroupMethod('选项联动控件');
    // // map.AddRM_GPE(new GPE_RadioBtns(), 'icon-control-forward', '_RadioBtns');
    // map.AddRM_DtlBatch('联动控件', new RBAttrs(), MapExtAttr.RefPKVal, '', '', 'icon-paper-plane', null);
    // // map.AddRM_DtlSearch('联动控件', new RBAttrs(), MapExtAttr.RefPKVal, '', '', '', 'icon-paper-plane', false, '&ExtModel=RBAction&FrmID=@FK_MapData');
    // map.AddRM_DtlBatch('联动字段', new RBAttrs(), MapExtAttr.RefPKVal, '', '', 'icon-chart', '&ExtType=Attr&FrmID=@FK_MapData');
    // map.AddRM_DtlBatch('联动子表', new RBDtls(), MapExtAttr.RefPKVal, '', '', 'icon-organization', '&ExtType=Dtl&FrmID=@FK_MapData');
    // map.AddRM_DtlBatch('联动附件', new RBAths(), MapExtAttr.RefPKVal, '', '', 'icon-layers', '&ExtType=Ath&FrmID=@FK_MapData');
    this._enMap = map;
    return this._enMap;
  }

  public async SysLange(lang: string) {
    //翻译分组.
    const ens = new SysEnumLangs();
    await ens.Retrieve('EnumKey', this.UIBindKey);
    await MapFrmFool.SysLange_Ens(ens, lang, '枚举:' + this.UIBindKey);
    return '翻译成功，请关闭列表。';
  }
}
/**
 * 枚举字段s
 */
export class MapAttrEnums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrEnum();
  }
  constructor() {
    super();
  }
}
