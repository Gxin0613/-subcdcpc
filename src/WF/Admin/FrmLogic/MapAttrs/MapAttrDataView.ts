import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttr';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 数据视图
export class MapAttrDataView extends EntityMyPK {
  constructor(pkval?: string) {
    // super("bp.demo.MapAttrDataView","TS.Demo.BPFramework.MapAttrDataView");
    super('TS.FrmUI.MapAttrDataView');

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
    const map = new Map('Sys_MapAttr', '数据视图');

    // #region 通用的属性.
    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '名称', true, false, 0, 200, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, 'ID', true, true, 1, 200, 20);

    //默认值.
    map.AddTBStringDoc(MapAttrAttr.DefVal, null, 'SQL语句', true, false, true);
    map.SetHelperAlert(MapAttrAttr.DefVal, '设置查询语句比如:SELECT No,Name,Addr,Email FROM WF_Emp WHERE FK_Dept=@WebUser.DeptNo ');

    map.AddTBString(MapAttrAttr.UIBindKey, null, '中文对应', true, false, 0, 150, 20, true);
    map.SetHelperAlert(MapAttrAttr.UIBindKey, '@No=编号@Name=名称@Addr=地址@Email=邮件');

    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    //  map.AddBoolean(MapAttrAttr.UIVisible, true, "可见", true, true);
    map.AddTBInt(MapAttrAttr.Idx, 0, '序号', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

//数据视图s
export class MapAttrDataViews extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrDataView();
  }
  constructor() {
    super();
  }
}
