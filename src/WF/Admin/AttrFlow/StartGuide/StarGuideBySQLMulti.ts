import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { FlowAttr } from '/@/WF/TSClass/Flow';
import { EntityNoName } from '/@/bp/en/EntityNoName';

export class StarGuideBySQLMulti extends EntityNoName {
  constructor(no?: string) {
    super('TS.AttrFlow.StarGuideBySQLMulti');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!no) this.setPKVal(no);
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
    const map = new Map('WF_Flow', '按设置的SQL-单条模式');

    map.AddTBStringPK(FlowAttr.No, null, '流程编号', true, true, 0, 10, 100, false);
    map.AddTBString(FlowAttr.Name, null, '名称', true, true, 0, 50, 200, false);

    map.AddTBString(FlowAttr.StartGuidePara1, null, '查询参数', true, false, 0, 50, 200, true, this.DescTag1);
    map.AddTBString(FlowAttr.StartGuidePara2, null, '初始化列表参数', true, false, 0, 50, 200, true, this.DescTag2);

    this._enMap = map;
    return this._enMap;
  }

  public readonly DescTag1 = `
  #### 帮助
   - 比如:SELECT No, Name, No as EmpNo,Name as EmpName,Email FROM WF_Emp WHERE No LIKE '%@key%'
   - 初始化列表参数，该查询语句必须有No,Name两个列，注意显示数量限制。
   - 很多场合下需要用到父子流程，在启动子流程的时候需要选择一个父流程。
   - 实例:SELECT a.WorkID as No, a.Title as Name, a.Starter, a.WorkID As PWorkID, '011' as PFlowNo, a.FK_Node as PNodeID FROM WF_GenerWorkflow a, WF_GenerWorkerlist b WHERE A.WorkID=b.WorkID AND B.FK_Emp='@WebUser.No' AND B.IsPass=0 AND A.FK_Flow='011' AND a.Title Like '%@Key%'


   
  `;
  public readonly DescTag2 = `
  #### 帮助
   - 比如:SELECT top 15 No,Name ,No as EmpNo,Name as EmpName ,Email FROM WF_Emp
   - 或者:SELECT No,Name ,No as EmpNo,Name as EmpName ,Email FROM WF_Emp WHERE ROWID < 15
   - 该数据源必须有No,Name两个列, 其他的列要与开始节点表单字段对应。
   - 注意查询的数量，避免太多影响效率。


  `;
}
