import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntityTreeAttr } from '/@/bp/en/EntityTree';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';

/// 知识树 属性
export class KnowledgeAttr extends EntityTreeAttr {
  /// <summary>
  /// 参与人s
  /// </summary>
  public static readonly Emps = 'Emps';
  /// <summary>
  /// 关注人
  /// </summary>
  public static readonly Foucs = 'Foucs';
  /// <summary>
  /// 内容1
  /// </summary>
  public static readonly Title = 'Title';
  /// <summary>
  /// 内容1
  /// </summary>
  public static readonly Docs = 'Docs';
  /// <summary>
  /// 创建字段
  /// </summary>
  public static readonly ImgUrl = 'ImgUrl';
  /// <summary>
  /// 内容2
  /// </summary>
  public static readonly KnowledgeSta = 'KnowledgeSta';
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名称
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
}

/// 知识树
export class Knowledge extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.KnowledgeManagement.Knowledge');
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
    const map = new Map('OA_Knowledge', '知识树');

    map.AddTBStringPK(KnowledgeAttr.No, null, '编号', false, false, 0, 50, 10);
    map.AddTBString(KnowledgeAttr.Name, null, '名称', true, true, 0, 500, 10);

    map.AddTBString(KnowledgeAttr.KnowledgeNo, null, '知识点', true, true, 0, 500, 10);

    map.AddTBString(KnowledgeAttr.ImgUrl, null, '路径', true, true, 0, 500, 10);
    map.AddTBString(KnowledgeAttr.Title, null, '标题', true, true, 0, 4000, 10);
    map.AddTBString(KnowledgeAttr.Docs, null, '描述', true, true, 0, 4000, 10);
    //map.AddTBString(KnowledgeAttr.KnowledgeSta, null, "状态", true, true, 0, 4000, 10);

    map.AddDDLSysEnum(KnowledgeAttr.KnowledgeSta, 0, '状态', true, false, 'KnowledgeSta', '@0=公开@1=私有');

    //zhoupeng@周朋;liping@李萍;
    map.AddTBString(KnowledgeAttr.Emps, null, '参与人', false, false, 0, 4000, 10);

    //,zhoupeng,liping,
    map.AddTBString(KnowledgeAttr.Foucs, null, '关注的人(多个人用逗号分开)', false, false, 0, 4000, 10);

    map.AddTBString(KnowledgeAttr.OrgNo, null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString(KnowledgeAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(KnowledgeAttr.RecName, null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime(KnowledgeAttr.RDT, null, '记录时间', false, false);

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 知识树 s
 */
export class Knowledges extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Knowledge();
  }
  constructor() {
    super();
  }
}
