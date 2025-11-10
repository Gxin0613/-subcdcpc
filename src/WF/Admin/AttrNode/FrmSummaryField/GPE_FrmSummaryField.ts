import { GloWF } from '../../GloWF';
import { Sln5 } from '../FrmSln/Sln5/Sln5';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node } from '/@/WF/TSClass/Node';

export class GPE_FrmSummaryField extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmSummaryField');
    this.PageTitle = '摘要字段';
  }
  async Init() {
    this.entity = new Sln5(); //对应的类.
    this.KeyOfEn = 'FrmSummaryFieldRole';
    this.AddGroup('A', '+摘要字段'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    const nodeID = this.GetRequestVal('PKVal');
    const node = new Node();
    node.NodeID = nodeID;
    await node.RetrieveFromDBSources();
    //, 怎么获取主键的值
    //  const nodeID =  this.GetRequestVal('PKVal')+'01';
    const frmID = !node.NodeFrmID ? 'ND' + parseInt(node.FK_Flow) + nodeID : node.NodeFrmID;
    //  this.SingleTB('1', '输入摘要字段', 'FrmSummaryFields', this.Desc1, '请输入提示信息' + frmID);
    // const listSrc = 'SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData=' + frmID + ' Order BY Idx';
    // this.SelectItemsByList('2', '摘要字段SelectItemsByList', this.Desc1, true, listSrc, 'FrmSummaryFields', '');
    //const listSrc =` SELECT KeyOfEn as No, Name, GroupID as GroupNo  FROM Sys_MapAttr WHERE FK_MapData='` + frmID + `' and UIVisible=1 Order BY  GroupID, Idx`;
    //const listSrcGroup =`SELECT OID AS No, Lab as  Name FROM Sys_GroupField WHERE FrmID='` + frmID + "'";
    this.SelectItemsByGroupList('1', '选择摘要字段', this.Desc1, true, GloWF.sqlGroupField(frmID), GloWF.SQLOfFrmSummaryFields(frmID), 'FrmSummaryFields', 'FrmSummaryNames');
  }

  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = `
  #### 帮助
   - 摘要字段定义：把挑选的字段存储到流程引擎注册表的AtPara里.
   - 说明：在流程功能页面(待办、在途、草稿)中可以查看的都是流程字段，业务表单信息无法看到，该功能解决了此问题.
  #### 应用场景
   -  在审批请假信息中，没有打开之前，就想看到请假天数、请假原因.
   -  审批合同的时候，在待办里可以看到，合同金额。
 `;

  public readonly Desc1 = `
 #### 帮助
  - 请选择摘要字段，显示顺序是按照表单的字段顺序进行排序的.
  #### 设置效果图
  - 暂无
  #### 展示效果图
  - 暂无
`;
}
