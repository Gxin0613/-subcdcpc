import { EntityNoNameAttr, EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';

//属性列表
export class SQLTemplateAttr extends EntityNoNameAttr {
  /// <summary>
  /// SQL
  /// </summary>
  public static readonly Docs = 'Docs';
  /// <summary>
  /// NodeID
  /// </summary>
  public static readonly SQLType = 'SQLType';
}

// SQL模板
export class SQLTemplate extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.SQLTemplate","TS.Demo.BPFramework.SQLTemplate");
    super('TS.WF.Template.SQLTemplate');
    this.setPKVal(no);
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
    const map = new Map('WF_SQLTemplate', 'SQL模板');
    map.CodeStruct = '3';

    map.AddTBStringPK(SQLTemplateAttr.No, null, '编号', true, true, 3, 3, 3);
    map.AddDDLSysEnum(
      SQLTemplateAttr.SQLType,
      0,
      '模版SQL类型',
      true,
      true,
      SQLTemplateAttr.SQLType,
      '@0=方向条件@1=接受人规则@2=下拉框数据过滤@3=级联下拉框@4=PopVal开窗返回值@5=人员选择器人员选择范围',
    );

    map.AddTBString(SQLTemplateAttr.Name, null, 'SQL说明', true, false, 0, 200, 20, true);
    map.AddTBStringDoc(SQLTemplateAttr.Docs, null, 'SQL模版', true, false, true);

    //查询条件.
    map.AddSearchAttr(SQLTemplateAttr.SQLType);

    this._enMap = map;
    return this._enMap;
  }
}

//SQL模板s
export class SQLTemplates extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SQLTemplate();
  }

  constructor() {
    super();
  }
}
