import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 系统字典表
export class SFTableDtl extends EntityMyPK {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableDtl');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTableDtl', '字典数据');
    map.AddMyPK();
    map.AddTBString('FK_SFTable', null, '外键表ID', true, false, 0, 200, 20);
    map.AddTBString('BH', null, 'BH', true, false, 0, 200, 20);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 20);
    map.AddTBString('ParentNo', null, '父节点ID', true, true, 0, 200, 20);
    map.AddTBString('OrgNo', null, 'OrgNo', true, false, 0, 200, 20);
    map.AddTBInt('Idx', 0, '序号', true, false);

    // //从表数据维护.
    // map.AddRM_DtlBatch('数据维护', new DictDtls(), DictDtlAttr.FK_SFTable, '', '', 'icon-drop', '');
    // const rm = new RefMethod();
    // rm.Title = '编辑数据';
    // rm.ClassMethodName = this.ToString() + '.DoEdit';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);
    // const rm = new RefMethod();
    // rm.Title = "查看数据";
    // rm.ClassMethodName = this.ToString() + ".DoEdit";
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
}

//字典表 s
export class SFTableDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFTableDtl();
  }
  constructor() {
    super();
  }
}
