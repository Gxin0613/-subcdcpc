import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import DBAccess from '/@/utils/gener/DBAccess';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { WindowTemplateAttr } from '/@/CCFast/Windows/Admin/WindowTemplate';

/// HtmlVarDtl变量信息
export class Jump extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.Jump');
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_WindowTemplate', '明细信息');

    map.AddTBStringPK(WindowTemplateAttr.No, null, '编号', true, true, 1, 40, 200);
    map.AddGroupAttr('明细信息');
    map.AddTBStringDoc('DtlExp', null, '详情表达式', true, false, true);
    map.AddTBStringDoc('DtlColNames', null, '列名对应', true, false, true);
    map.SetHelperAlert('DtlColNames', 'Key1=值1,key2=值2');
    const dtlOpenWay = '@0=抽屉50%@1=抽屉70%@2=抽屉90%@3=弹窗打开@4=新窗口打开';
    map.AddDDLSysEnum('DtlOpenWay', 0, '打开方式', true, true, 'DtlOpenWay', dtlOpenWay);
    map.AddTBInt('DtlW', 500, '宽度', true, false);
    map.AddTBInt('DtlH', 300, '高度', true, false);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}
