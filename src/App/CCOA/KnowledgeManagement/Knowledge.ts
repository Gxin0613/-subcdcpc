import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
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

    map.AddTBStringPK('No', null, '编号', false, false, 0, 50, 10);
    map.AddTBString('Name', null, '名称', true, true, 0, 500, 10);
    map.AddTBString('KnowledgeNo', null, '知识点', true, true, 0, 500, 10);

    map.AddTBString('ImgUrl', null, '路径', true, true, 0, 500, 10);
    map.AddTBString('Title', null, '标题', true, true, 0, 4000, 10);
    map.AddTBString('Docs', null, '描述', true, true, 0, 4000, 10);
    //map.AddTBString(KnowledgeAttr.KnowledgeSta, null, "状态", true, true, 0, 4000, 10);

    map.AddDDLSysEnum('KnowledgeSta', 0, '状态', true, false, 'KnowledgeSta', '@0=公开@1=私有');

    //zhoupeng@周朋;liping@李萍;
    map.AddTBString('Emps', null, '参与人', false, false, 0, 4000, 10);

    //,zhoupeng,liping,
    map.AddTBString('Foucs', null, '关注的人(多个人用逗号分开)', false, false, 0, 4000, 10);

    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 100, 10);
    map.AddTBString('RecName', null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime('RDT', null, '记录时间', false, false);
    map.AddTBString('Icon', null, 'Icon', false, false, 0, 100, 10);
    map.AddTBAtParas(1000);

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
