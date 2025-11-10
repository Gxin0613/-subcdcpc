import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

/// HtmlVarDtl变量信息
export class JumpDtl extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.JumpDtl');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('GPM_WindowTemplateDtl', '跳转信息');

    map.AddMyPK();
    map.AddGroupAttr('跳转信息');
    map.AddTBStringDoc('DtlExp', null, '详情表达式', true, false, true);
    map.AddTBStringDoc('DtlColNames', null, '列名对应', true, false, true);
    map.SetHelperAlert('DtlColNames', 'Key1=值1,key2=值2');

    const dtlOpenWay = '@0=抽屉50%@1=抽屉70%@2=抽屉90%@3=弹窗打开@4=新窗口打开';
    map.AddDDLSysEnum('DtlOpenWay', 500, '打开方式', true, true, 'DtlOpenWay', dtlOpenWay);
    map.AddTBInt('DtlW', 0, '宽度', true, false);
    map.SetHelperAlert('DtlW', '只针对打开方式为模态窗起作用');
    map.AddTBInt('DtlH', 300, '高度', true, false);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}
