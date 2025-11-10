import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { FlowAdm } from './Admin/FlowAdm';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 待办
/// </summary>
export class Todolist extends EntityMyPK {
  constructor(pkval?: number) {
    super('TS.WF.Todolist');
    if (!!pkval) {
      this.setPKVal(pkval);
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Todolist', '待办');
    map.AddMyPK();
    map.AddTBIntPK('WorkID', 0, '工作ID');
    map.AddTBString('Title', null, '标题', true, true, 0, 100, 350);
    // map.AddTBString('FlowNo', null, '编号', false, true, 0, 100, 90);
    // map.AddDDLEntities('FlowNo', null, '所属流程', new FlowAdm(), false);
    map.AddDDLEnsByOptions({ key: 'FlowNo', defaultVal: null, desc: '所属流程', en: new FlowAdm(), uiIsEnable: false, UIWidth: 200 });
    // map.AddTBString('FlowName', null, '流程', true, true, 0, 100, 200);
    map.AddTBDate('SendDT', null, '接收日期', true, true);
    map.AddTBString('Sender', null, '发送人', true, true, 0, 100, 130);
    map.AddTBString('StarterName', null, '发起人', true, true, 0, 100, 100);
    map.AddTBDate('RDT', null, '发起日期', true, true);
    map.AddTBString('EmpNo', null, '处理人', false, false, 0, 100, 10);
    map.AddTBString('NodeName', null, '停留节点', true, true, 0, 100, 200);
    map.AddTBString('TodoEmps', null, '待办人员', true, true, 0, 100, 300);
    //查询条件.
    // map.DTSearchKey = 'SendDT';
    map.DTSearchWay = DTSearchWay.ByDateRange;

    // const rm = new RefMethod();
    // rm.Title = '打开';
    map.AddSearchAttr('FlowNo', 240);

    //隐藏查询条件.
    map.AddHidden('EmpNo', '=', '@WebUser.No');

    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 待办s
 */
export class Todolists extends EntitiesMyPK {
  get GetNewEntity(): Todolist {
    return new Todolist();
  }
  constructor() {
    super();
  }
}
