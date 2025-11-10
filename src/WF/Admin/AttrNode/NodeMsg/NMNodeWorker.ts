import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PushMsgAttr } from './PushMsg';

// 节点消息
export class NMNodeWorker extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.NMNodeWorker');
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
    const map = new Map('WF_PushMsg', '节点消息');
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(PushMsgAttr.RefPKVal, null, '关联的PK', false, false, 0, 20, 10);
    map.AddTBString(PushMsgAttr.FlowNo, null, '流程编号', false, false, 0, 5, 10);
    map.AddTBInt(PushMsgAttr.NodeID, 0, '发生的节点', false, false);
    //在什么事件下发生?
    map.AddTBString(PushMsgAttr.EventNo, null, '事件标记', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.EventName, null, '事件名称', true, true, 0, 100, 100);

    //推送对象. 发送给当前节点的所有处理人，发送给下一个节点的所有接受人，发送给被退回的节点处理人，撤销工作后通知的节点接受人
    map.AddTBString(PushMsgAttr.PushWayNo, null, '推送对象标记', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.PushWayName, null, '推送名称', true, true, 0, 100, 100);
    map.AddTBString(PushMsgAttr.PushWayExp1, null, '节点编号', true, true, 0, 2000, 100);
    map.AddTBString(PushMsgAttr.PushWayExp2, null, '节点名称', true, true, 0, 2000, 100);

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

    this._enMap = map;
    return this._enMap;
  }
}
