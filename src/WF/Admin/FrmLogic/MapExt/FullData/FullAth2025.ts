import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
/// <summary>
/// 填充从表
/// </summary>
export class FullAth2025 extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullAth2025');
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
    // map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, true, 0, 10, 50, true);
    // map.AddTBString(MapExtAttr.RefPKVal, null, 'RefPKVal', false, true, 0, 10, 50, true);
    // map.AddTBString(MapExtAttr.ExtType, null, '类型', false, true, 0, 10, 50, true);

    map.AddTBString(MapExtAttr.Tag1, null, '附件NoOfObj', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '附件名称', true, true, 0, 150, 150, false);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=FullDataAth');
    map.AddLink('Doc', '设置-填充数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.help, 'icon-settings');
    this._enMap = map;
    return this._enMap;
  }
  public readonly help = `
  #### 帮助
  - 返回一个数据集合，列包含两个FileName,FileUrl,附件名称，附件存储路径，就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}
