import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class SysEventAttr {
  public static readonly RefPKVal = 'RefPKVal';
  public static readonly RefFlowNo = 'RefFlowNo';
  public static readonly FK_Node = 'FK_Node';
  public static readonly FK_Flow = 'FK_Flow';
  public static readonly EventID = 'EventID';
  public static readonly EventName = 'EventName';
  public static readonly EventDoType = 'EventDoType';
  public static readonly EventDoTypeT = 'EventDoTypeT';
  public static readonly FK_DBSrc = 'FK_DBSrc';
  public static readonly DoDoc = 'DoDoc';
  public static readonly EventSource = 'EventSource';
  public static readonly ShowAttrs = 'EventID,EventName,EventDoTypeT,EventDoTypeT,FK_DBSrc,DoDoc';
}
// 系统事件
export class SysEvent extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Sys.SysEvent');
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
    const map = new Map('Sys_FrmEvent', '系统事件');
    map.AddMyPK();
    //RefPKVal =存储节点ID, 表单ID, 流程编号.
    map.AddTBString(SysEventAttr.RefPKVal, null, '关联主键', false, false, 0, 100, 10);
    map.AddTBInt(SysEventAttr.EventSource, 0, '事件类型(0=表单事件,1=节点2=流程事件)', false, false);
    map.AddTBString(SysEventAttr.RefFlowNo, null, '关联的流程编号', false, true, 0, 10, 10);
    const help = `
    #### 帮助
    - 事件编号是一个固定的值.
    - 流程事件:
    - FlowOverBefore,FlowOverAfter等.
    - 节点事件:
    - SendWhen,SendErr,等.
    - 表单事件:
    - FrmLoadBefore,FrmLoadAfter等.
    `;
    map.AddTBString(SysEventAttr.EventID, null, '事件编号', true, true, 0, 100, 100, false, help);
    map.AddTBString(SysEventAttr.EventName, null, '事件名称', true, true, 0, 100, 100);

    map.AddTBString('EventDoType', null, '执行类型', true, true, 0, 100, 100);
    map.AddTBString(SysEventAttr.EventDoTypeT, null, '类型名称', true, true, 0, 100, 100);

    //map.AddTBInt('', 0, '执行类型', false, true);
    // map.AddTBString(SysEventAttr.EventDoType, null, '执行类型', true, true, 0, 100, 100);
    // map.AddTBString(SysEventAttr.EventDoTypeT, null, '执行类型T', true, true, 0, 100, 100);
    //@SFDBSrc=数据源@BuessUnit=事件类.
    // map.AddDDLStringEnum('EventDoModel', null, '执行模式', '@None=不执行@SFDBSrc=数据源@BuessUnit=事件类@SFProcs=定义过程', true, '', true);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=@EventID&DBModel=SFProc');
    map.AddLink('DoDoc', '设置-事件内容', url, true, GPNReturnType.OpenUrlByDrawer50, this.Help, 'icon-settings');

    // map.AddTBStringDoc(SysEventAttr.DoDoc, null, '执行内容', true, false, false);
    // map.AddTBStringDoc('DoDocT', null, '执行内容', false, false, false);
    // map.AddTBString(SysEventAttr.FK_DBSrc, null, '数据源', true, true, 0, 100, 100);
    map.AddTBString('FrmID', null, 'FrmID', true, true, 0, 100, 100);
    map.AddTBString('FlowNo', null, 'FlowNo', true, true, 0, 10, 100);
    map.AddTBInt('NodeID', 0, 'NodeID', false, true);

    map.AddTBInt('Idx', 0, 'Idx', false, true);
    // map.AddTBInt('FK_Node', 0, 'FK_Node', true, true);
    // map.AddDDLEntities(SysEventAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBAtParas(4000);
    // //编辑内容.
    // map.AddRM_GPE(new GPE_EventDoc(), 'icon-drop');
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    //this.EventSource = 0; //表单事件.
    return Promise.resolve(true);
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

//系统事件s
export class SysEvents extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SysEvent();
  }
  constructor() {
    super();
  }
}
