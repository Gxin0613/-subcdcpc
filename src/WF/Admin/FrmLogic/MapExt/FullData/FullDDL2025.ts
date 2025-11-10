import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
/// 填充从表
export class FullDDL2025 extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullDDL2025');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '填充从表');

    map.AddMyPK();

    map.AddTBString(MapExtAttr.Tag1, null, '字段ID', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '字段名称', true, true, 0, 150, 150, false);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=FullDataDDL');
    map.AddLink('Doc', '设置-填充数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.help, 'icon-settings');

    this._enMap = map;
    return this._enMap;
  }
  public readonly help = `
  #### 帮助
  - 输入一个数据源SQL或者url，返回一个数据集合，列名与从表的列名对应就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
