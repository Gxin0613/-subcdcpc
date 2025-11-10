import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MenuAttr } from '../../../GPM/CCMenu/Menu';

// 蓝色大屏
export class RptBlue extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCFast.RptBlue');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('GPM_Menu', '蓝色大屏');
    map.AddTBString(MenuAttr.Tag1, null, '大屏编号', true, true, 0, 200, 200, true);
    map.AddTBStringPK(MenuAttr.No, null, '编号', false, false, 1, 90, 50);
    map.AddTBString(MenuAttr.Name, null, '菜单名称', true, false, 0, 200, 200);
    map.AddDDLSysEnum(MenuAttr.TagInt1, 0, '打开模式', true, true, 'TagInt1', '@0=Tab页打开@1=新窗口打开');
    map.AddTBString(MenuAttr.Icon, null, 'Icon', true, false, 0, 50, 50, true);

    // map.AddTBStringDoc(MenuAttr.Tag1, null, '维度1SQL', true, false, true);
    // map.AddTBStringDoc(MenuAttr.Tag2, null, '维度2SQL', true, false, true);
    // map.AddTBStringDoc(MenuAttr.Tag3, null, '维度3SQL', true, false, true);
    // map.AddTBString(MenuAttr.Tag4, null, '分析项目名称', true, false, 0, 200, 200);

    //从表明细.
    // map.AddRM_DtlSearch(new SearchAttrs(), SearchAttrAttr.RefMenuNo, 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}
//三维报表s
export class RptBlues extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new RptBlue();
  }
  constructor() {
    super();
  }
}
