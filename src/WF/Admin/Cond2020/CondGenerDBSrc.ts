import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { GloComm } from '../../Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 条件
export class CondGenerDBSrc extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondGenerDBSrc');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Cond', '通用数据源条件');
    map.AddMyPK();
    map.AddTBString(CondAttr.Note, '', '备注', true, true, 0, 200, 20, true);

    const url1 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Main&DBModel=Search');
    map.AddLink('DBSrc', '设置-数据源条件', url1, false, GPNReturnType.OpenUrlByDrawer50, '', 'icon-settings');

    // const url1 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', 'NodeID', '&MarkID=Main&DBModel=SFProc');
    // map.AddLink('DBSrc', '设置-数据源条件', url1, false, GPNReturnType.OpenUrlByDrawer50, '', 'icon-settings');

    this._enMap = map;
    return this._enMap;
  }

  override beforeUpdateInsertAction(): Promise<boolean> {
    this.Note = '通用数据源条件,点击查看.';
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
