import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 消息表
/// </summary>
export class SMS extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Port.SMS');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsInsert = false;
    uac.IsUpdate = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_SMS', '消息');

    map.AddMyPK();
    map.AddTBString('Sender', null, '发送人', true, true, 0, 50, 150);
    map.AddTBString('SendTo', null, '接收人', true, true, 0, 50, 150);

    map.AddBoolean('IsRead', false, '是否读取?', true, false);

    map.AddTBDateTime('RDT', null, '发送日期', true, true);
    map.AddTBString('EmailTitle', null, '标题', true, true, 0, 50, 150, true);
    map.AddTBStringDoc('EmailDoc', null, '内容', true, true, true);

    map.AddSearchAttr('IsRead');
    map.AddHidden('SendTo', '=', '@WebUser.No');

    this._enMap = map;
    return this._enMap;
  }
}

//消息表s
export class SMSs extends EntitiesMyPK {
  get GetNewEntity(): SMS {
    return new SMS();
  }

  constructor() {
    super();
  }
}
