import { GloWF } from '../../GloWF';
import { Flow } from '/@/WF/TSClass/Flow';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FlowBuessFields extends PageBaseGroupEdit {
  constructor() {
    //构造方法里要输入类名,我们原则上需要 GPE_ 开头.
    //这个类要注册到 /Comm/UIEntity/ClassFactoryOfGroupPageEdit.ts 下.
    super('GPE_FlowBuessFields');
    this.PageTitle = '业务字段'; //GPE中文类名
  }
  async Init() {
    this.entity = new Flow(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = 'BuessFieldRole'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '显示列'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    let frmID = '';
    if (frmID == '') frmID = 'ND' + parseInt(this.PKVal) + '01';

    //增加子页面.
    const groupSQL = GloWF.SQLOfGpnMethodGroupSQL(frmID); //`SELECT OID as No, Lab as Name FROM Sys_GroupField WHERE FrmID='${frmID}' AND  (CtrlID = '' OR CtrlID IS NULL) `;
    const attrSQL = GloWF.SQLOfGpeFlowBuessFields(frmID);
    //` SELECT KeyOfEn AS No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='${frmID}'
    // AND UIContralType <=4 AND KeyOfEn NOT IN ('OID','Rec','RDT','FID','Title','BillNo','BillState','FlowStarter',
    // 'FlowEmps','FlowStartRDT','WFState','Emps')
    // AND UIVisible=1 ORDER BY GroupID,Idx
    // `;

    this.SelectItemsByGroupList('1', '选择字段', this.Desc0, true, groupSQL, attrSQL, 'BuessFields', 'BuessFieldNames');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `

  #### 概念
   - 业务字段是流程引擎系统字段以外的，用户自定义的表单字段.
   - 比如：请假日期从、到、请假人、请假原因等.
   - 流程引擎系统字段包括： 标题、发起人、发起日期、发起人部门、停留节点、当前处理人、流程状态等.
  #### 设置作用
   - 通用的待办列表显示的是系统字段, 比如：标题、发起人、发起日期、状态、停留节点.
   - 如果显示指定流程的待办、在途、抄送、就可以使用业务字段显示.
   - 点发起菜单，转到流程一户式操作,就可以查看该流程的信息.
`;
}
