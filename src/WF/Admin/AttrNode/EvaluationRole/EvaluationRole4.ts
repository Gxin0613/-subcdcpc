import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';

// 考核规则
export class EvaluationRole4 extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.EvaluationRole4');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '指定字段的时间考核');

    map.AddGroupAttr('基本设置');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);
    map.AddDDLSysEnum('CHWayOfTimeRole', 1, '时间计算方式', true, false, 'CHWayOfTimeRole', '@0=按设置计算@1=按表单的字段计算');

    /*map.AddGroupAttr('按设置计算');
    map.AddTBInt('TimeLimit', 1, '天数', true, false);
    map.AddTBInt('TimeLimitHH', 0, '小时', true, false);
    map.AddTBInt('TimeLimitMM', 0, '分钟', true, false);*/

    map.AddGroupAttr('按表单的字段计算');

    //const sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData ='ND@NodeID' AND MyDataType IN (7,8) `;
    map.AddDDLSQL('CHWayOfTimeRoleField', null, '选字段(对表单字段有效)', GloWF.SQLOfRoleField, true);
    map.AddTBAtParas();
    //标识下列字段，都要存储到 AtPara 字段里中去.
    map.ParaFields = ',CHWayOfTimeRole,CHWayOfTimeRoleField,';

    // const rm = new RefMethod();
    // rm.Title = '设置该流程所有节点都采用此方案';
    // rm.ClassMethod = 'DoSetIt';
    // rm.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm);

    // const rm1 = new RefMethod();
    // rm1.Title = '表单属性';
    // rm1.ClassMethod = 'DoFrmAttr';
    // rm1.RefMethodType = RefMethodType.LinkModel;
    // map.AddRefMethod(rm1);

    map.AddRM_UrlRightFrameOpen('设置工作日', '/src/', '高级设置');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    this.CHWayOfTimeRole = 1;
    return true;
  }
}
