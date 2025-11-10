import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmAttachmentAttr } from './FrmAttachment';

// 附件
export class FrmAttachmentLang extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.FrmAttachmentLang');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmAttachment', '附件');

    map.AddMyPK();

    map.AddTBString(FrmAttachmentAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(FrmAttachmentAttr.Name, null, '中文', true, false, 0, 50, 150);
    map.AddLang();

    //参数属性.
    map.AddTBAtParas(3000);

    this._enMap = map;
    return this._enMap;
  }
}

//附件s
export class FrmAttachmentLangs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachmentLang();
  }
  constructor() {
    super();
  }
}
