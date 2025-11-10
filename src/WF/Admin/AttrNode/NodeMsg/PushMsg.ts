import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

//属性列表
export class PushMsgAttr {
  public static readonly EventNo = 'EventNo';
  public static readonly EventName = 'EventName';

  public static readonly IsEnableSMS = 'IsEnableSMS';
  public static readonly SMSDoc = 'SMSDoc';

  public static readonly FlowNo = 'FlowNo';
  public static readonly NodeID = 'NodeID';
  public static readonly RefPKVal = 'RefPKVal';

  public static readonly IsEnableEmail = 'IsEnableEmail';

  public static readonly MailTitle = 'MailTitle';
  public static readonly MailDoc = 'MailDoc';

  public static readonly PushWayNo = 'PushWayNo';
  public static readonly PushWayName = 'PushWayName';
  public static readonly PushWayExp1 = 'PushWayExp1';
  public static readonly PushWayExp2 = 'PushWayExp2';

  public static readonly showAttrsMsg = 'EventNo,EventName,PushWayNo,PushWayName,PushWayExp1,IsEnableSMS,IsEnableEmail';
}

// 节点事件
export class PushMsg extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.PushMsg');
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('WF_PushMsg', '消息');
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    //(节点关联NodeID,流程关联FlowNo).
    map.AddTBString(PushMsgAttr.RefPKVal, null, '关联的PK', false, false, 0, 20, 10);
    map.AddTBString(PushMsgAttr.FlowNo, null, '流程编号', false, false, 0, 5, 10);
    map.AddTBInt(PushMsgAttr.NodeID, 0, '发生的节点', false, false);
    //在什么事件下发生?
    map.AddTBString(PushMsgAttr.EventNo, null, '事件标记', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.EventName, null, '事件名称', true, true, 0, 100, 100);

    //推送对象. 发送给当前节点的所有处理人，发送给下一个节点的所有接受人，发送给被退回的节点处理人，撤销工作后通知的节点接受人
    map.AddTBString(PushMsgAttr.PushWayNo, null, '推送对象标记', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.PushWayName, null, '推送名称', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.PushWayExp1, null, '表达式1', true, true, 0, 2000, 100);
    map.AddTBString(PushMsgAttr.PushWayExp2, null, '表达式2', true, true, 0, 2000, 100);

    // map.AddTBString(PushMsgAttr.AccepterID, null, '接受对象', true, true, 0, 100, 100);
    // map.AddTBString(PushMsgAttr.AccepterDoc1, null, '接受对象1', true, false, 0, 3900, 100);
    // map.AddTBString(PushMsgAttr.AccepterDoc2, null, '接受对象2', true, false, 0, 3900, 100);

    map.AddGroupAttr('短消息推送');
    map.AddBoolean(PushMsgAttr.IsEnableSMS, true, '启用短消息?', true, true);
    map.AddTBStringDoc(PushMsgAttr.SMSDoc, null, '短消息内容模版', true, false, true);

    map.AddGroupAttr('Email推送');
    map.AddBoolean(PushMsgAttr.IsEnableEmail, true, '启用邮件?', true, true);
    map.AddTBString(PushMsgAttr.MailTitle, null, '邮件标题模版', true, false, 0, 2000, 20, true);
    map.AddTBStringDoc(PushMsgAttr.MailDoc, null, '邮件内容模版', true, false, true);

    // map.AddGroupAttr('其他标记');
    // map.AddBoolean('DD', true, '钉钉?', true, true);
    // map.AddBoolean('WeChat', true, '企业微信?', true, true);
    // map.AddBoolean('Msg', true, '站内消息?', true, true);
    // map.AddBoolean('WebServices', true, 'WebServices?', true, true);
    map.AddTBAtParas(500);

    // map.AddRM_GPE(new GPE_PushMsg(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = DBAccess.GenerGUID();
    return true;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    // this.SetValByKey(NodeEventAttr.EventSource, 1);
    return true;
  }
}

//节点消息s
export class PushMsgs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new PushMsg();
  }
  constructor() {
    super();
  }
}
