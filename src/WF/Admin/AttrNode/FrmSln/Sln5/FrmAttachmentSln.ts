import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmAttachmentAttr } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';

// 从表属性
export class FrmAttachmentSln extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmAttachmentSln');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_FrmAttachment', '附件属性');
    map.AddGroupAttr('基础信息');
    // #region 基础信息.
    map.AddTBStringPK('MyPK', null, '主键MyPK', true, true, 1, 200, 50);

    map.AddTBString(FrmAttachmentAttr.Name, null, '名称', true, false, 1, 200, 20);
    map.AddTBString(FrmAttachmentAttr.NoOfObj, null, '附件标识', true, true, 0, 50, 20);

    map.AddDDLSysEnum(FrmAttachmentAttr.FileType, 0, '附件类型', true, true, FrmAttachmentAttr.FileType, '@0=普通附件@1=图片文件');
    map.AddTBInt('FK_Node', 0, 'NodeID', false, false);

    map.AddTBString('FK_MapData', null, '表单ID', false, true, 0, 100, 20);
    map.AddTBAtParas(1000);
    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 从表属性s
 */
export class FrmAttachmentSlns extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachmentSln();
  }
  constructor() {
    super();
  }
}
