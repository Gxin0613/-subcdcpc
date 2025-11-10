import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { SysEnumMain, SysEnumMainAttr } from './SysEnumMain';
import { SysEnums } from './SysEnum';
import BSEntity from '/@/utils/gener/BSEntity';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { SysEnumLangs } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnumLang';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { MapFrmFool } from '/@/WF/Admin/FrmLogic/MapData/MapFrmFool';

// 枚举
export class SysEnumMainInt extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SysEnumMainInt');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.IsAdmin) {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
      return uac;
    }
    uac.IsView = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_EnumMain', '枚举值Int');
    map.AddTBStringPK(SysEnumMainAttr.No, null, '编号', true, true, 1, 190, 150);
    map.AddBoolean(SysEnumMainAttr.EnableColor, true, '使用枚举颜色', true, true);

    if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) map.AddBoolean('IsShare', true, '是否共享给其他组织?', true, true);

    map.AddTBString(SysEnumMainAttr.Name, null, '名称', true, false, 0, 200, 200, true);
    map.AddTBString(SysEnumMainAttr.CfgVal, null, '配置信息', false, false, 0, 1500, 400);
    map.AddTBString(SysEnumMainAttr.OrgNo, null, '组织编号', false, false, 0, 60, 400);
    map.AddTBString(SysEnumMainAttr.Lang, null, '语言', false, false, 0, 40, 400);

    //枚举值.
    map.AddTBString(SysEnumMainAttr.EnumKey, null, 'EnumKey', false, false, 0, 40, 150);

    for (let index = 0; index < 30; index++) {
      map.AddTBString('Idx' + index, null, '枚举键', true, false, 0, 100, 400);
      map.AddTBString('Val' + index, null, '枚举值', true, false, 0, 100, 400);
    }

    map.AddRM_DtlBatch('颜色设置', new SysEnums(), 'EnumKey');
    map.AddRM_DtlBatch('国际化', new SysEnumLangs(), 'EnumKey', '', '', 'icon-globe', '&EnumKey=@EnumKey');

    const rm2 = new RefMethod();
    rm2.Title = 'AI翻译辅助';
    rm2.ClassMethod = 'SysLange';
    rm2.Icon = 'icon-check';
    rm2.RefMethodType = RefMethodType.Func;
    rm2.HisMap.AddTBString('SysNo', 'En', '请输入要翻译的语言编号EN英语,FT繁体,JA日本', true, false, 0, 100, 100, true, '');
    map.AddRefMethod(rm2);

    this._enMap = map;
    return this._enMap;
  }

  override async afterUpdate() {
    const en = new SysEnumMain();
    en.No = this.No;
    await en.Retrieve();
    await en.SaveDtls();
    //修改后端的缓存
    const enumMain = new BSEntity('BP.Sys.SysEnumMain');
    enumMain.setPK(this.No);
    enumMain.No = this.No;
    await enumMain.DoMethodReturnString('ClearCache');
    return Promise.resolve(true);
    // return true;
  }
  public async SysLange(lang: string) {
    //翻译分组.
    const ens = new SysEnumLangs();
    await ens.Retrieve('EnumKey', this.EnumKey);
    await MapFrmFool.SysLange_Ens(ens, lang, '枚举:' + this.EnumKey);
    return '翻译成功，请关闭列表。';
  }
}
